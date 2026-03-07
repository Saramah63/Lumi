import type { GlowState } from "./types";

export function modeToGlowState(mode: string): GlowState {
  if (mode === "firm") return "strong";
  if (mode === "regulation" || mode === "warm") return "calm";
  return "alert";
}
