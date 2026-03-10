import { mouthStateFromRms, computeRmsFromTimeDomain } from "./lipSync";
import { getAudioContext, markAudioError } from "./audioContext";
import type { MouthState } from "../../src/app/components/lumi/LumiAvatarRive";

export type Mode = "baseline" | "listening" | "firm" | "firm_calm" | "warm";

export async function lumiSpeak(params: {
  text: string;
  mode: Mode;
  onSpeakingChange: (v: boolean) => void;
  onMouthState: (s: MouthState) => void;
  onBlink?: () => void;
}) {
  const { text, mode, onSpeakingChange, onMouthState } = params;

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, mode, lang: "fi-FI" }),
  });

  if (!res.ok) throw new Error("TTS failed");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const releaseObjectUrl = () => {
    // no-op; avoid premature revoke errors in browsers
  };

  const audio = new Audio(url);
  audio.crossOrigin = "anonymous";
  audio.muted = true; // avoid double playback path; Web Audio handles output

  const ctx = await getAudioContext();

  if (!ctx) {
    let raf = 0;
    let stopped = false;
    const startedAt = performance.now();
  const tickFallback = () => {
    if (stopped) return;
    const t = (performance.now() - startedAt) / 1000;
    const rmsRaw = Math.max(0, Math.min(1, 0.08 + 0.1 * Math.abs(Math.sin(t * 9)) + 0.05 * Math.abs(Math.sin(t * 17))));
    smoothed = smoothed * 0.7 + rmsRaw * 0.3;
    const mouth = mouthStateFromRms(smoothed);
    onMouthState(mouth);
    raf = requestAnimationFrame(tickFallback);
  };

    try {
      onSpeakingChange(true);
      raf = requestAnimationFrame(tickFallback);
      await audio.play();
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error("Audio playback failed"));
      });
    } finally {
      stopped = true;
      cancelAnimationFrame(raf);
      onSpeakingChange(false);
      onMouthState(4);
      audio.src = "";
      audio.load();
      releaseObjectUrl();
    }
    return;
  }

  let source: MediaElementAudioSourceNode | null = null;
  let analyser: AnalyserNode | null = null;
  const data = new Uint8Array(1024);
  let raf = 0;
  let smoothed = 0;

  try {
    source = ctx.createMediaElementSource(audio);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;

    source.connect(analyser);
    analyser.connect(ctx.destination);
  } catch (error) {
    markAudioError(error);
    await audio.play();
    return;
  }

  let lastUpdate = 0;
  const tick = (now?: number) => {
    if (!analyser) return;
    const ts = now ?? performance.now();
    if (ts - lastUpdate < 45) {
      raf = requestAnimationFrame(tick);
      return;
    }
    lastUpdate = ts;
    analyser.getByteTimeDomainData(data);
    const rms = computeRmsFromTimeDomain(data);
    smoothed = smoothed * 0.7 + rms * 0.3;
    const next = mouthStateFromRms(smoothed);
    onMouthState(next);
    raf = requestAnimationFrame(tick);
  };

  audio.onplay = async () => {
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    onSpeakingChange(true);
    onMouthState(1);
    tick();
  };

  audio.onended = () => {
    cancelAnimationFrame(raf);
    onSpeakingChange(false);
    onMouthState(4);
    audio.src = "";
    audio.load();
    releaseObjectUrl();
    try {
      source?.disconnect();
      analyser?.disconnect();
    } catch {
      // ignore
    }
  };

  try {
    await audio.play();
  } catch (error) {
    markAudioError(error);
    onSpeakingChange(false);
    onMouthState(4);
  }
}
