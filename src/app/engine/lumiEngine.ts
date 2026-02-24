import { cancelLumiSpeak, lumiSpeak, type LumiMode } from "../../../lib/lumi/speakFinnish";

export type LumiLanguage = "fi-FI";
export type LumiSpeakMode = LumiMode;

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
  private isMuted = false;
  private blinkTimer: number | null = null;
  private blinkLoopStarted = false;

  subscribe(listener: StateListener): () => void {
    this.ensureBlinkLoop();
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
      void this.stop();
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  async speak(text: string, mode: LumiSpeakMode = "baseline", _options: LumiSpeakOptions = {}): Promise<void> {
    if (!text.trim() || this.isMuted) {
      return;
    }

    await this.stop();
    this.ensureBlinkLoop();

    const asksQuestion = /\?$/.test(text.trim());
    const isListening = mode === "listening" || asksQuestion;
    const isFirm = mode === "firm";
    const floatAmount = isFirm ? 0.15 : isListening ? 0.24 : mode === "warm" ? 0.32 : 0.4;
    const baseLight = isFirm ? 0.54 : isListening ? 0.28 : mode === "warm" ? 0.42 : 0.4;

    this.patch({
      isSpeaking: true,
      isListening,
      isFirm,
      mouthOpen: 0,
      lightIntensity: baseLight,
      floatAmount,
    });

    this.triggerSyncBreath();

    try {
      await lumiSpeak(text, mode, {
        onFrame: (mouthOpen, lightIntensity) => {
          this.patch({ mouthOpen, lightIntensity });
        },
        onEnd: () => {
          if (mode === "warm") {
            this.triggerWarmGlow();
          }

          this.patch({
            isSpeaking: false,
            isListening: false,
            isFirm: false,
            mouthOpen: 0,
            lightIntensity: 0.25,
            floatAmount: 0.35,
          });
        },
      });
    } catch (error) {
      this.patch({
        isSpeaking: false,
        isListening: false,
        isFirm: false,
        mouthOpen: 0,
        lightIntensity: 0.25,
        floatAmount: 0.35,
      });
      throw error;
    }
  }

  async speakLines(lines: string[], mode: LumiSpeakMode = "baseline", pauseMs = 800): Promise<void> {
    for (const line of lines) {
      await this.speak(line, mode);
      await new Promise((resolve) => window.setTimeout(resolve, pauseMs));
    }
  }

  async stop(): Promise<void> {
    cancelLumiSpeak();
    this.patch({
      isSpeaking: false,
      isListening: false,
      isFirm: false,
      mouthOpen: 0,
      lightIntensity: 0.25,
      floatAmount: 0.35,
    });
  }

  private ensureBlinkLoop(): void {
    if (this.blinkLoopStarted || typeof window === "undefined") {
      return;
    }

    this.blinkLoopStarted = true;

    const schedule = () => {
      const nextDelay = this.state.isSpeaking
        ? 6200 + Math.random() * 2600
        : 4000 + Math.random() * 2000;

      this.blinkTimer = window.setTimeout(() => {
        this.triggerBlink();
        schedule();
      }, nextDelay);
    };

    schedule();
  }

  dispose(): void {
    if (typeof window !== "undefined" && this.blinkTimer !== null) {
      window.clearTimeout(this.blinkTimer);
    }
    this.blinkTimer = null;
    this.blinkLoopStarted = false;
    cancelLumiSpeak();
  }
}

export const lumiEngine = new LumiEngine();
