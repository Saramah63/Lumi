import type { GlowState } from "./types";

export function modeToGlowState(mode: string): GlowState {
  if (mode === "baseline") return "calm";
  if (mode === "listening") return "alert";
  if (mode === "firm") return "strong";
  if (mode === "regulation" || mode === "warm") return "calm";
  return "alert";
}
