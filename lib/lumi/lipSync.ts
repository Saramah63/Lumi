export type MouthState = 0 | 1 | 2 | 3 | 4;

export function mouthStateFromRms(rms: number): MouthState {
  if (rms < 0.04) return 4; // CLOSED
  if (rms < 0.1) return 1; // OPEN
  if (rms < 0.22) return 3; // ROUND
  return 2; // WIDE
}

export function stabilizeMouthState(prev: MouthState, next: MouthState): MouthState {
  // Amplitude is already smoothed; allow natural one-step changes to keep lip sync lively.
  if (prev === next) return prev;
  return next;
}

export function computeRmsFromTimeDomain(data: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i += 1) {
    const v = (data[i] - 128) / 128;
    sum += v * v;
  }
  return Math.sqrt(sum / data.length);
}
