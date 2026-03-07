"use client";

import type { GlowState } from "./types";
import type { SpeakMode } from "./speak";

export type KidAnswerResponse = {
  answer: string;
  mode: SpeakMode;
  glowState: GlowState;
  source: "openai" | "fallback";
};

export type ConversationTurn = {
  role: "kid" | "lumi";
  text: string;
};

export async function askKidQuestion(params: {
  kidName: string;
  question: string;
  contextMode?: SpeakMode;
  history?: ConversationTurn[];
}): Promise<KidAnswerResponse> {
  const response = await fetch("/api/kid-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(details || `Kid chat failed (${response.status})`);
  }

  const json = (await response.json()) as KidAnswerResponse;
  return json;
}
