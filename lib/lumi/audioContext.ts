"use client";

let sharedContext: AudioContext | null = null;
let audioDisabledUntil = 0;
let lastErrorLogAt = 0;

function shouldLogError(): boolean {
  const now = Date.now();
  if (now - lastErrorLogAt < 30000) return false;
  lastErrorLogAt = now;
  return true;
}

function disableAudioTemporarily(reason?: string) {
  audioDisabledUntil = Date.now() + 30000;
  if (shouldLogError()) {
    console.warn("WebAudio disabled temporarily.", reason ?? "");
  }
}

export async function getAudioContext(): Promise<AudioContext | null> {
  if (typeof window === "undefined") return null;
  if (Date.now() < audioDisabledUntil) return null;

  const AudioContextCtor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextCtor) return null;

  try {
    if (!sharedContext || sharedContext.state === "closed") {
      sharedContext = new AudioContextCtor();
    }

    if (sharedContext.state === "suspended") {
      await sharedContext.resume();
    }

    return sharedContext;
  } catch (error) {
    disableAudioTemporarily(error instanceof Error ? error.message : "AudioContext init failed");
    return null;
  }
}

export function markAudioError(error?: unknown) {
  disableAudioTemporarily(error instanceof Error ? error.message : "Audio error");
}

export async function safeResumeAudioContext(): Promise<boolean> {
  const ctx = await getAudioContext();
  return !!ctx;
}

export function closeSharedAudioContext(): void {
  if (!sharedContext || sharedContext.state === "closed") return;
  try {
    void sharedContext.close();
  } catch {
    // ignore close failures
  } finally {
    sharedContext = null;
  }
}
