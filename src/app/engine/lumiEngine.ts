export type LumiLanguage = "fi-FI" | "en-US";
export type LumiSpeakMode = "normal" | "listening" | "firm" | "repair";

export interface LumiSpeakOptions {
  lang?: LumiLanguage;
  voice?: string;
}

export interface LumiEngineState {
  isSpeaking: boolean;
  isListening: boolean;
  isFirm: boolean;
  mouthOpen: number;
  lightIntensity: number;
  floatAmount: number;
  blinkTick: number;
  warmGlowTick: number;
  syncBreathTick: number;
}

type StateListener = (state: LumiEngineState) => void;

const initialState: LumiEngineState = {
  isSpeaking: false,
  isListening: false,
  isFirm: false,
  mouthOpen: 0,
  lightIntensity: 0.25,
  floatAmount: 0.35,
  blinkTick: 0,
  warmGlowTick: 0,
  syncBreathTick: 0,
};

export class LumiEngine {
  private state: LumiEngineState = { ...initialState };
  private listeners = new Set<StateListener>();
  private audio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private amplitudeData: Uint8Array | null = null;
  private rafId: number | null = null;
  private blinkTimer: number | null = null;
  private isMuted = false;

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): LumiEngineState {
    return this.state;
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  private patch(next: Partial<LumiEngineState>): void {
    this.state = { ...this.state, ...next };
    this.emit();
  }

  private bumpTrigger(trigger: "blinkTick" | "warmGlowTick" | "syncBreathTick"): void {
    this.patch({ [trigger]: this.state[trigger] + 1 } as Partial<LumiEngineState>);
  }

  triggerBlink(): void {
    this.bumpTrigger("blinkTick");
  }

  triggerWarmGlow(): void {
    this.bumpTrigger("warmGlowTick");
  }

  triggerSyncBreath(): void {
    this.bumpTrigger("syncBreathTick");
  }

  setListening(isListening: boolean): void {
    this.patch({ isListening });
  }

  setFirm(isFirm: boolean): void {
    this.patch({ isFirm });
  }

  setFloatAmount(floatAmount: number): void {
    this.patch({ floatAmount: Math.max(0, Math.min(1, floatAmount)) });
  }

  setMuted(isMuted: boolean): void {
    this.isMuted = isMuted;
    if (isMuted) {
      this.stop();
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  async speak(text: string, mode: LumiSpeakMode = "normal", options: LumiSpeakOptions = {}): Promise<void> {
    if (!text.trim() || this.isMuted) {
      return;
    }

    await this.stop();

    const lang = options.lang ?? "fi-FI";
    this.patch({
      isSpeaking: true,
      isListening: mode === "listening",
      isFirm: mode === "firm",
      mouthOpen: 0,
      lightIntensity: mode === "firm" ? 0.6 : 0.45,
    });

    this.triggerSyncBreath();
    this.startBlinkLoop();

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          lang,
          voice: options.voice,
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`TTS request failed (${response.status}): ${detail}`);
      }

      const payload = (await response.json()) as { audioUrl?: string };

      if (!payload.audioUrl) {
        throw new Error("TTS response missing audioUrl");
      }

      await this.playAudio(payload.audioUrl, mode);
    } catch (error) {
      this.onPlaybackEnd(mode);
      throw error;
    }
  }

  async speakLines(lines: string[], mode: LumiSpeakMode = "normal", pauseMs = 800): Promise<void> {
    for (const line of lines) {
      await this.speak(line, mode);
      await new Promise((resolve) => window.setTimeout(resolve, pauseMs));
    }
  }

  async stop(): Promise<void> {
    this.stopBlinkLoop();
    this.stopLipSyncLoop();

    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = "";
    }

    this.patch({
      isSpeaking: false,
      mouthOpen: 0,
      lightIntensity: 0.25,
      isFirm: false,
      isListening: false,
    });
  }

  private async playAudio(url: string, mode: LumiSpeakMode): Promise<void> {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = "auto";
      this.audio.crossOrigin = "anonymous";
      this.audio.onended = () => {
        this.onPlaybackEnd(mode);
      };
      this.audio.onerror = () => {
        this.onPlaybackEnd(mode);
      };
    }

    this.audio.src = url;
    this.audio.currentTime = 0;

    await this.ensureAnalyser();

    if (this.audioContext?.state === "suspended") {
      await this.audioContext.resume();
    }

    await this.audio.play();
    this.startLipSyncLoop();
  }

  private onPlaybackEnd(mode: LumiSpeakMode): void {
    this.stopBlinkLoop();
    this.stopLipSyncLoop();

    if (mode === "repair") {
      this.triggerWarmGlow();
    }

    this.patch({
      isSpeaking: false,
      mouthOpen: 0,
      lightIntensity: 0.25,
      isFirm: false,
      isListening: false,
    });
  }

  private async ensureAnalyser(): Promise<void> {
    if (!this.audio || typeof window === "undefined") {
      return;
    }

    if (!this.audioContext) {
      const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) {
        return;
      }
      this.audioContext = new AudioContextCtor();
    }

    if (!this.mediaSource) {
      this.mediaSource = this.audioContext.createMediaElementSource(this.audio);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.82;
      this.mediaSource.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      this.amplitudeData = new Uint8Array(this.analyser.frequencyBinCount);
    }
  }

  private startLipSyncLoop(): void {
    if (typeof window === "undefined") {
      return;
    }

    const tick = () => {
      if (!this.analyser || !this.amplitudeData || !this.state.isSpeaking) {
        this.patch({ mouthOpen: 0 });
        return;
      }

      this.analyser.getByteFrequencyData(this.amplitudeData);
      let sum = 0;
      for (let i = 0; i < this.amplitudeData.length; i += 1) {
        sum += this.amplitudeData[i];
      }
      const amplitude = sum / this.amplitudeData.length / 255;
      const mouthOpen = Math.max(0, Math.min(1, amplitude * 2.8));
      const lightBase = this.state.isFirm ? 0.55 : 0.4;
      const lightIntensity = Math.max(0, Math.min(1, lightBase + mouthOpen * 0.35));

      this.patch({ mouthOpen, lightIntensity });
      this.rafId = window.requestAnimationFrame(tick);
    };

    this.stopLipSyncLoop();
    this.rafId = window.requestAnimationFrame(tick);
  }

  private stopLipSyncLoop(): void {
    if (typeof window !== "undefined" && this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
    }
    this.rafId = null;
  }

  private startBlinkLoop(): void {
    if (typeof window === "undefined") {
      return;
    }

    const schedule = () => {
      const delay = 2200 + Math.random() * 2400;
      this.blinkTimer = window.setTimeout(() => {
        if (this.state.isSpeaking) {
          this.triggerBlink();
        }
        schedule();
      }, delay);
    };

    this.stopBlinkLoop();
    schedule();
  }

  private stopBlinkLoop(): void {
    if (typeof window !== "undefined" && this.blinkTimer !== null) {
      window.clearTimeout(this.blinkTimer);
    }
    this.blinkTimer = null;
  }
}

export const lumiEngine = new LumiEngine();
