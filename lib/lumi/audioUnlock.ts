"use client";

let audioUnlocked = false;

export async function unlockAudio(): Promise<void> {
  if (audioUnlocked) return;
  if (typeof window === "undefined") return;

  try {
    const AudioContextCtor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextCtor) {
      audioUnlocked = true;
      return;
    }

    const ctx = new AudioContextCtor();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    source.stop(0.01);

    audioUnlocked = true;

    setTimeout(() => {
      try {
        void ctx.close();
      } catch {
        // ignore
      }
    }, 200);
  } catch {
    // ignore unlock failure
  }
}
