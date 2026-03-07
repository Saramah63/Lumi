"use client";

import {
  computeRmsFromTimeDomain,
  mouthStateFromRms,
  stabilizeMouthState,
  type MouthState,
} from "./lipSync";
import { unlockAudio } from "./audioUnlock";
import { getAudioContext, markAudioError } from "./audioContext";

export type SpeakMode = "baseline" | "listening" | "firm" | "firm_calm" | "warm" | "regulation";

export type SpeakCallbacks = {
  onSpeakingChange?: (value: boolean) => void;
  onMouthStateChange?: (state: MouthState) => void;
  onLightIntensityChange?: (value: number) => void;
};

type ActivePlayback = {
  stop: () => Promise<void>;
};

let activePlayback: ActivePlayback | null = null;
let ttsBypassUntil = 0;
let ttsBypassReason = "";

export async function cancelLumiSpeak(): Promise<void> {
  if (!activePlayback) return;
  await activePlayback.stop();
  activePlayback = null;
}

async function playWithBrowserSpeech(
  text: string,
  mode: SpeakMode,
  callbacks: SpeakCallbacks = {},
  originalError?: string
): Promise<void> {
  if (!("speechSynthesis" in window)) {
    throw new Error(originalError ?? "TTS failed and browser speech fallback is unavailable.");
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "fi-FI";
  utter.rate =
    mode === "listening"
      ? 0.88
      : mode === "firm"
        ? 0.84
        : mode === "firm_calm"
          ? 0.86
          : mode === "warm"
            ? 0.95
            : 0.92;
  utter.pitch = mode === "firm" ? 0.92 : mode === "firm_calm" ? 0.96 : mode === "warm" ? 1.06 : 1.0;

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

  let raf = 0;
  let stopped = false;
  let prevMouth: MouthState = 0;
  const startedAt = performance.now();

  const stop = async () => {
    if (stopped) return;
    stopped = true;
    if (raf) cancelAnimationFrame(raf);
    synth.cancel();
    callbacks.onSpeakingChange?.(false);
    callbacks.onMouthStateChange?.(0);
    callbacks.onLightIntensityChange?.(0);
  };

  activePlayback = { stop };

  const tick = () => {
    if (stopped) return;
    const t = (performance.now() - startedAt) / 1000;
    const base = mode === "firm" ? 0.08 : mode === "firm_calm" ? 0.085 : 0.1;
    const wave = 0.08 * Math.abs(Math.sin(t * 10.5));
    const jitter = 0.03 * Math.abs(Math.sin(t * 27.1));
    const rms = Math.max(0, Math.min(1, base + wave + jitter));

    const next = mouthStateFromRms(rms * 2.8);
    const stable = stabilizeMouthState(prevMouth, next);
    prevMouth = stable;

    callbacks.onMouthStateChange?.(stable);
    callbacks.onLightIntensityChange?.(Math.max(0, Math.min(1, rms * 1.8)));
    raf = requestAnimationFrame(tick);
  };

  try {
    await new Promise<void>((resolve, reject) => {
      utter.onstart = () => {
        callbacks.onSpeakingChange?.(true);
        tick();
      };
      utter.onend = () => resolve();
      utter.onerror = () => reject(new Error(originalError ?? "Browser speech fallback failed."));
      synth.speak(utter);
    });
    await stop();
  } finally {
    if (activePlayback?.stop === stop) {
      activePlayback = null;
    }
  }
}

export async function lumiSpeak(
  text: string,
  mode: SpeakMode,
  callbacks: SpeakCallbacks = {}
): Promise<void> {
  await cancelLumiSpeak();
  await unlockAudio();

  if (Date.now() < ttsBypassUntil) {
    return playWithBrowserSpeech(
      text,
      mode,
      callbacks,
      `TTS temporarily bypassed: ${ttsBypassReason || "provider unavailable"}`
    );
  }

  let response: Response;
  try {
    response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, mode }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    ttsBypassReason = message;
    ttsBypassUntil = Date.now() + 5 * 60 * 1000;
    return playWithBrowserSpeech(text, mode, callbacks, `TTS request failed: ${message}`);
  }

  if (!response.ok) {
    let details = "";
    try {
      const text = await response.text();
      if (text) details = text;
    } catch {
      // ignore parse failure
    }
    const message = details
      ? `TTS failed (${response.status}): ${details}`
      : `TTS failed (${response.status})`;
    if (
      response.status === 402 ||
      response.status === 401 ||
      response.status === 403 ||
      response.status >= 500
    ) {
      ttsBypassReason = message;
      ttsBypassUntil = Date.now() + 5 * 60 * 1000;
    }
    return playWithBrowserSpeech(text, mode, callbacks, message);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const audio = new Audio(objectUrl);
  audio.crossOrigin = "anonymous";

  const context = await getAudioContext();

  if (!context) {
    callbacks.onSpeakingChange?.(true);
    let raf = 0;
    let stopped = false;
    const startedAt = performance.now();
    let fallbackPrev: MouthState = 0;

    const stopFallback = () => {
      if (stopped) return;
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      audio.pause();
      audio.currentTime = 0;
      callbacks.onSpeakingChange?.(false);
      callbacks.onMouthStateChange?.(0);
      callbacks.onLightIntensityChange?.(0);
      URL.revokeObjectURL(objectUrl);
    };

    const tickFallback = () => {
      if (stopped) return;
      const t = (performance.now() - startedAt) / 1000;
      const base = mode === "firm" ? 0.08 : mode === "firm_calm" ? 0.085 : 0.1;
      const wave = 0.08 * Math.abs(Math.sin(t * 10.5));
      const jitter = 0.03 * Math.abs(Math.sin(t * 27.1));
      const rms = Math.max(0, Math.min(1, base + wave + jitter));
      const next = mouthStateFromRms(rms * 2.2);
      const stable = stabilizeMouthState(fallbackPrev, next);
      fallbackPrev = stable;
      callbacks.onMouthStateChange?.(stable);
      callbacks.onLightIntensityChange?.(Math.max(0, Math.min(1, rms * 1.5)));
      raf = requestAnimationFrame(tickFallback);
    };

    const stop = async () => {
      stopFallback();
    };

    activePlayback = { stop };

    try {
      tickFallback();
      await audio.play();
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error("Audio playback failed"));
      });
    } catch (error) {
      stopFallback();
      return playWithBrowserSpeech(
        text,
        mode,
        callbacks,
        `Audio play failed: ${error instanceof Error ? error.message : "unknown"}`
      );
    }

    stopFallback();
    if (activePlayback?.stop === stop) {
      activePlayback = null;
    }
    return;
  }

  let source: MediaElementAudioSourceNode | null = null;
  let analyser: AnalyserNode | null = null;
  const data = new Uint8Array(1024);
  let raf = 0;
  let stopped = false;
  let prevMouth: MouthState = 0;

  try {
    source = context.createMediaElementSource(audio);
    analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.82;

    source.connect(analyser);
    analyser.connect(context.destination);
  } catch (error) {
    markAudioError(error);
    callbacks.onSpeakingChange?.(false);
    callbacks.onMouthStateChange?.(0);
    callbacks.onLightIntensityChange?.(0);
    URL.revokeObjectURL(objectUrl);
    return playWithBrowserSpeech(
      text,
      mode,
      callbacks,
      `Audio graph setup failed: ${error instanceof Error ? error.message : "unknown"}`
    );
  }

  const stop = async () => {
    if (stopped) return;
    stopped = true;
    if (raf) cancelAnimationFrame(raf);
    audio.pause();
    callbacks.onSpeakingChange?.(false);
    callbacks.onMouthStateChange?.(0);
    callbacks.onLightIntensityChange?.(0);
    URL.revokeObjectURL(objectUrl);
    if (source) {
      try {
        source.disconnect();
      } catch {
        // ignore
      }
    }
    if (analyser) {
      try {
        analyser.disconnect();
      } catch {
        // ignore
      }
    }
  };

  activePlayback = { stop };

  const tick = () => {
    if (stopped || !analyser) return;

    analyser.getByteTimeDomainData(data);
    const rms = computeRmsFromTimeDomain(data);

    const next = mouthStateFromRms(rms * 2.8);
    const stable = stabilizeMouthState(prevMouth, next);
    prevMouth = stable;

    callbacks.onMouthStateChange?.(stable);
    callbacks.onLightIntensityChange?.(Math.max(0, Math.min(1, rms * 2)));

    raf = requestAnimationFrame(tick);
  };

  try {
    if (context.state === "suspended") {
      await context.resume();
    }

    callbacks.onSpeakingChange?.(true);
    try {
      await audio.play();
    } catch (error) {
      await stop();
      return playWithBrowserSpeech(
        text,
        mode,
        callbacks,
        `Audio play failed: ${error instanceof Error ? error.message : "unknown"}`
      );
    }
    tick();

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Audio playback failed"));
    });

    await stop();
  } catch (error) {
    markAudioError(error);
    await stop();
    return playWithBrowserSpeech(
      text,
      mode,
      callbacks,
      `Audio playback failed: ${error instanceof Error ? error.message : "unknown"}`
    );
  } finally {
    if (activePlayback?.stop === stop) {
      activePlayback = null;
    }
  }
}
