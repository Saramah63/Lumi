"use client";

import { getAudioContext, markAudioError } from "./audioContext";

let audioUnlocked = false;

export async function unlockAudio(): Promise<void> {
  if (audioUnlocked) return;
  if (typeof window === "undefined") return;

  try {
    const ctx = await getAudioContext();
    if (!ctx) return;

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
  } catch (error) {
    markAudioError(error);
  }
}
