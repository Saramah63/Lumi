import { mouthStateFromRms, stabilizeMouthState } from "./lipSync";
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

  const audio = new Audio(url);
  audio.crossOrigin = "anonymous";

  const ctx = await getAudioContext();

  if (!ctx) {
    let raf = 0;
    let stopped = false;
    const startedAt = performance.now();
    const tickFallback = () => {
      if (stopped) return;
      const t = (performance.now() - startedAt) / 1000;
      const rms = Math.max(
        0,
        Math.min(1, 0.1 + 0.08 * Math.abs(Math.sin(t * 11)) + 0.03 * Math.abs(Math.sin(t * 29)))
      );
      const mouth = mouthStateFromRms(rms * 2.2);
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
      onMouthState(0);
      URL.revokeObjectURL(url);
    }
    return;
  }

  let source: MediaElementAudioSourceNode | null = null;
  let analyser: AnalyserNode | null = null;
  const data = new Uint8Array(1024);
  let raf = 0;
  let prevState: MouthState = 0;

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

  const tick = () => {
    if (!analyser) return;
    analyser.getByteTimeDomainData(data);

    let sum = 0;
    for (let i = 0; i < data.length; i += 1) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);

    const next = mouthStateFromRms(rms * 2.8);
    const stable = stabilizeMouthState(prevState, next);
    prevState = stable;

    onMouthState(stable);

    raf = requestAnimationFrame(tick);
  };

  audio.onplay = async () => {
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    onSpeakingChange(true);
    tick();
  };

  audio.onended = () => {
    cancelAnimationFrame(raf);
    onSpeakingChange(false);
    onMouthState(0);
    URL.revokeObjectURL(url);
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
    onMouthState(0);
  }
}
