import { unlockAudio } from "./audioUnlock";
import { getAudioContext, markAudioError } from "./audioContext";

export type LumiMode = "baseline" | "listening" | "firm" | "firm_calm" | "warm";
export type LumiLang = "fi-FI";

export type LumiSpeakHooks = {
  onStart?: () => void;
  onFrame?: (mouthOpen: number, lightIntensity: number) => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
};

type VisemePoint = {
  t: number;
  v: string;
};

type TTSPayload = {
  audioUrl?: string;
  visemes?: VisemePoint[];
  emotion?: string;
};

type ActivePlayback = {
  stop: () => void;
};

let activePlayback: ActivePlayback | null = null;

export function cancelLumiSpeak(): void {
  activePlayback?.stop();
  activePlayback = null;
}

function getLightIntensityFromRms(rms: number): number {
  return Math.max(0, Math.min(1, rms * 2));
}

async function fetchTTSData(text: string, mode: LumiMode): Promise<TTSPayload> {
  const response = await fetch("/api/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, mode, lang: "fi-FI" as LumiLang }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`TTS request failed (${response.status}): ${detail}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("audio/mpeg")) {
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    return { audioUrl: objectUrl };
  }

  const payload = (await response.json()) as TTSPayload;
  if (!payload.audioUrl) {
    throw new Error("Missing audioUrl in /api/tts response");
  }

  return payload;
}

function visemeToMouth(v: string): number {
  const key = v.toUpperCase();
  if (key === "AA") return 0.92;
  if (key === "OH") return 0.78;
  if (key === "EE") return 0.5;
  if (key === "REST") return 0.1;
  return 0.35;
}

function visemeMouthAtTime(visemes: VisemePoint[] | undefined, elapsedMs: number): number {
  if (!visemes || visemes.length === 0) {
    return 0;
  }

  let point = visemes[0];
  for (let i = 1; i < visemes.length; i += 1) {
    if (visemes[i].t > elapsedMs) break;
    point = visemes[i];
  }

  return visemeToMouth(point.v);
}

async function playWithAudioElement(tts: TTSPayload, mode: LumiMode, hooks: LumiSpeakHooks): Promise<void> {
  const normalizedUrl =
    tts.audioUrl &&
    (/^(https?:)?\//.test(tts.audioUrl) || tts.audioUrl.startsWith("blob:") || tts.audioUrl.startsWith("data:"))
      ? tts.audioUrl
      : `/${tts.audioUrl ?? ""}`;
  const audio = new Audio(normalizedUrl);
  audio.preload = "auto";
  audio.crossOrigin = "anonymous";
  const releaseObjectUrl = () => {
    // intentionally no-op to avoid premature revokes that can spawn player errors
  };
  let rafId: number | null = null;
  let stopped = false;
  let context: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let source: MediaElementAudioSourceNode | null = null;
  let amplitudeData: Uint8Array<ArrayBuffer> | null = null;
  let smoothedMouth = 0;
  const startedAt = performance.now();

  const cleanup = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio.currentTime = 0;
    audio.src = "";
    audio.load();

    if (source) {
      try {
        source.disconnect();
      } catch {
        // ignore disconnect failures
      }
    }

    if (analyser) {
      try {
        analyser.disconnect();
      } catch {
        // ignore disconnect failures
      }
    }

    hooks.onFrame?.(0, 0.25);
    releaseObjectUrl();
  };

  const stop = () => {
    if (stopped) {
      return;
    }
    stopped = true;
    cleanup();
    hooks.onEnd?.();
  };

  const playWithoutContext = async () => {
    const animate = () => {
      if (stopped) return;
      const elapsedMs = performance.now() - startedAt;
      const visemeMouth = visemeMouthAtTime(tts.visemes, elapsedMs);
      const pulse = 0.12 * Math.abs(Math.sin(elapsedMs / 120));
      const mouth = Math.max(visemeMouth, pulse);
      const lightIntensity = getLightIntensityFromRms(mouth * 0.8);
      hooks.onFrame?.(Math.max(0, Math.min(1, mouth)), lightIntensity);
      rafId = requestAnimationFrame(animate);
    };

    hooks.onStart?.();
    rafId = requestAnimationFrame(animate);
    try {
      await audio.play();
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error("Audio playback failed"));
      });
    } finally {
      stop();
    }
  };

  activePlayback = { stop };

  try {
    try {
      context = await getAudioContext();
    } catch (error) {
      markAudioError(error);
      context = null;
    }

    if (!context) {
      await playWithoutContext();
      return;
    }

    source = context.createMediaElementSource(audio);
    analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.78;
    amplitudeData = new Uint8Array(analyser.fftSize) as Uint8Array<ArrayBuffer>;

    source.connect(analyser);
    analyser.connect(context.destination);

    if (context.state === "suspended") {
      await context.resume();
    }

    hooks.onStart?.();
    try {
      await audio.play();
    } catch (error) {
      markAudioError(error);
      throw error;
    }

    const frame = () => {
      if (stopped || !analyser || !amplitudeData) {
        return;
      }

      analyser.getByteTimeDomainData(amplitudeData);
      let sumSquares = 0;

      for (let i = 0; i < amplitudeData.length; i += 1) {
        const sample = (amplitudeData[i] - 128) / 128;
        sumSquares += sample * sample;
      }

      const rms = Math.sqrt(sumSquares / amplitudeData.length);
      const gained = Math.min(1, rms * 4.6);
      const elapsedMs = performance.now() - startedAt;
      const visemeMouth = visemeMouthAtTime(tts.visemes, elapsedMs);
      const targetMouth = Math.max(gained, visemeMouth);
      smoothedMouth = smoothedMouth * 0.7 + targetMouth * 0.3;

      const lightIntensity = getLightIntensityFromRms(rms);

      hooks.onFrame?.(Math.max(0, Math.min(1, smoothedMouth)), lightIntensity);
      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Audio playback failed"));
    });

    stop();
  } catch (error) {
    if (!stopped) {
      markAudioError(error);
      stop();
    }
    throw error;
  } finally {
    if (activePlayback?.stop === stop) {
      activePlayback = null;
    }
  }
}

async function playWithBrowserSpeech(text: string, mode: LumiMode, hooks: LumiSpeakHooks): Promise<void> {
  if (!("speechSynthesis" in window)) {
    throw new Error("No available speech synthesis fallback");
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "fi-FI";
  utter.rate = mode === "listening" ? 0.85 : mode === "firm" ? 0.82 : 0.92;
  utter.pitch = mode === "firm" ? 0.9 : mode === "warm" ? 1.06 : 1.0;

  const ensureVoices = async () => {
    const voices = synth.getVoices();
    if (voices.length > 0) return voices;
    await new Promise<void>((resolve) => {
      const timeout = window.setTimeout(() => {
        synth.removeEventListener("voiceschanged", onChange);
        resolve();
      }, 500);
      const onChange = () => {
        window.clearTimeout(timeout);
        synth.removeEventListener("voiceschanged", onChange);
        resolve();
      };
      synth.addEventListener("voiceschanged", onChange);
    });
    return synth.getVoices();
  };

  const voices = await ensureVoices();
  const fiVoice = voices.find((v) => v.lang.toLowerCase().startsWith("fi"));
  if (fiVoice) {
    utter.voice = fiVoice;
  }

  let rafId: number | null = null;
  let stopped = false;
  let energy = 0;
  const animate = () => {
    if (stopped) {
      return;
    }
    energy *= 0.88;
    const noise = (Math.sin(performance.now() / 58) + 1) * 0.08;
    const mouthOpen = Math.max(0, Math.min(1, energy + noise));
    const lightIntensity = getLightIntensityFromRms(mouthOpen);
    hooks.onFrame?.(mouthOpen, lightIntensity);
    rafId = requestAnimationFrame(animate);
  };

  const cleanup = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    hooks.onFrame?.(0, 0.25);
  };

  const stop = () => {
    if (stopped) {
      return;
    }
    stopped = true;
    synth.cancel();
    cleanup();
    hooks.onEnd?.();
  };

  activePlayback = { stop };

  await new Promise<void>((resolve, reject) => {
    utter.onstart = () => {
      hooks.onStart?.();
      rafId = requestAnimationFrame(animate);
    };

    utter.onboundary = () => {
      energy = 0.95;
    };

    utter.onend = () => {
      if (!stopped) {
        stopped = true;
        cleanup();
        hooks.onEnd?.();
      }
      resolve();
    };

    utter.onerror = (event) => {
      if (!stopped) {
        stopped = true;
        cleanup();
        hooks.onEnd?.();
      }
      reject(new Error(`SpeechSynthesis failed: ${event.error}`));
    };

    synth.speak(utter);
  }).finally(() => {
    if (activePlayback?.stop === stop) {
      activePlayback = null;
    }
  });
}

export async function lumiSpeak(
  text: string,
  mode: LumiMode,
  hooks: LumiSpeakHooks = {}
): Promise<void> {
  cancelLumiSpeak();
  await unlockAudio();

  try {
    const tts = await fetchTTSData(text, mode);
    await playWithAudioElement(tts, mode, hooks);
  } catch (apiError) {
    console.warn("TTS API unavailable, using browser fallback speech.", apiError);
    hooks.onError?.(apiError);
    await playWithBrowserSpeech(text, mode, hooks);
  }
}
