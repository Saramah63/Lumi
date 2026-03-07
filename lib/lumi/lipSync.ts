export type MouthState = 0 | 1 | 2 | 3 | 4;

export function mouthStateFromRms(rms: number): MouthState {
  if (rms < 0.03) return 0; // REST
  if (rms < 0.08) return 4; // CLOSED
  if (rms < 0.16) return 1; // OPEN
  if (rms < 0.28) return 2; // WIDE
  return 3; // ROUND
}

export function stabilizeMouthState(prev: MouthState, next: MouthState): MouthState {
  if (prev === next) return prev;
  const diff = Math.abs(prev - next);
  if (prev === 0) return next;
  if (diff >= 2) return next;
  return prev;
}

export function computeRmsFromTimeDomain(data: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i += 1) {
    const v = (data[i] - 128) / 128;
    sum += v * v;
  }
  return Math.sqrt(sum / data.length);
}
