"use client";

import {
  computeRmsFromTimeDomain,
  mouthStateFromRms,
  stabilizeMouthState,
  type MouthState,
} from "./lipSync";

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

  const fiVoice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("fi"));
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

  const AudioContextCtor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextCtor) {
    callbacks.onSpeakingChange?.(true);
    await audio.play();
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Audio playback failed"));
    });
    callbacks.onSpeakingChange?.(false);
    callbacks.onMouthStateChange?.(0);
    callbacks.onLightIntensityChange?.(0);
    URL.revokeObjectURL(objectUrl);
    return;
  }

  const context = new AudioContextCtor();
  const source = context.createMediaElementSource(audio);
  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.82;

  source.connect(analyser);
  analyser.connect(context.destination);

  const data = new Uint8Array(analyser.frequencyBinCount);
  let raf = 0;
  let stopped = false;
  let prevMouth: MouthState = 0;

  const stop = async () => {
    if (stopped) return;
    stopped = true;
    if (raf) cancelAnimationFrame(raf);
    audio.pause();
    callbacks.onSpeakingChange?.(false);
    callbacks.onMouthStateChange?.(0);
    callbacks.onLightIntensityChange?.(0);
    URL.revokeObjectURL(objectUrl);
    try {
      if (context.state !== "closed") await context.close();
    } catch {
      // ignore close errors
    }
  };

  activePlayback = { stop };

  const tick = () => {
    if (stopped) return;

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
    await context.resume();
    callbacks.onSpeakingChange?.(true);
    await audio.play();
    tick();

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Audio playback failed"));
    });

    await stop();
  } finally {
    if (activePlayback?.stop === stop) {
      activePlayback = null;
    }
  }
}
