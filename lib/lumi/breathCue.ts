"use client";

export type BreathEyesState = "auto" | "closed" | "open";

type BreathCueOptions = {
  onEyesStateChange?: (state: BreathEyesState) => void;
  phaseMs?: number;
};

function createNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * durationSec);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    channel[i] = (Math.random() * 2 - 1) * 0.55;
  }
  return buffer;
}

function playBreathWhoosh(ctx: AudioContext, phase: "inhale" | "exhale", seconds: number) {
  const source = ctx.createBufferSource();
  source.buffer = createNoiseBuffer(ctx, seconds);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = phase === "inhale" ? 860 : 620;
  filter.Q.value = 0.5;

  const gain = ctx.createGain();
  gain.gain.value = 0.0001;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  const attack = seconds * 0.35;
  const release = seconds * 0.65;
  const peak = phase === "inhale" ? 0.055 : 0.045;

  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + release);

  source.start(now);
  source.stop(now + seconds + 0.05);
}

export function startBreathingCue(options: BreathCueOptions = {}): () => Promise<void> {
  const { onEyesStateChange, phaseMs = 1200 } = options;
  const AudioContextCtor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  let ctx: AudioContext | null = null;
  if (AudioContextCtor) {
    ctx = new AudioContextCtor();
    void ctx.resume().catch(() => {
      // keep running eye cue even if audio fails
    });
  }

  let stopped = false;
  let phase: "inhale" | "exhale" = "inhale";
  let timer: number | null = null;

  const tick = () => {
    if (stopped) return;
    if (phase === "inhale") {
      onEyesStateChange?.("closed");
      if (ctx) playBreathWhoosh(ctx, "inhale", Math.max(0.7, phaseMs / 1000));
      phase = "exhale";
    } else {
      onEyesStateChange?.("open");
      if (ctx) playBreathWhoosh(ctx, "exhale", Math.max(0.7, phaseMs / 1000));
      phase = "inhale";
    }
    timer = window.setTimeout(tick, phaseMs);
  };

  tick();

  return async () => {
    if (stopped) return;
    stopped = true;
    if (timer) window.clearTimeout(timer);
    onEyesStateChange?.("auto");
    if (ctx && ctx.state !== "closed") {
      try {
        await ctx.close();
      } catch {
        // ignore close errors
      }
    }
  };
}
