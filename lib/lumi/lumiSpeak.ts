import { mouthStateFromRms, stabilizeMouthState } from "./lipSync";
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

  const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) {
    await audio.play();
    return;
  }

  const ctx = new AudioContextCtor();
  const source = ctx.createMediaElementSource(audio);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;

  source.connect(analyser);
  analyser.connect(ctx.destination);

  const data = new Uint8Array(analyser.frequencyBinCount);

  let raf = 0;
  let prevState: MouthState = 0;

  const tick = () => {
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
    await ctx.resume();
    onSpeakingChange(true);
    tick();
  };

  audio.onended = async () => {
    cancelAnimationFrame(raf);
    onSpeakingChange(false);
    onMouthState(0);
    URL.revokeObjectURL(url);
    try {
      await ctx.close();
    } catch {
      // noop
    }
  };

  await audio.play();
}
