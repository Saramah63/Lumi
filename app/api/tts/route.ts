import { NextResponse } from "next/server";
import crypto from "node:crypto";
import fs from "node:fs/promises";

export const runtime = "nodejs";

type Mode = "baseline" | "listening" | "firm" | "warm";

function hashKey(text: string, mode: Mode) {
  return crypto.createHash("sha256").update(`${mode}::${text}`).digest("hex");
}

export async function POST(req: Request) {
  const body = (await req.json()) as { text?: string; mode?: Mode; lang?: string };
  const text = body.text;
  const mode = body.mode ?? "baseline";
  const lang = body.lang ?? "fi-FI";

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  if (lang !== "fi-FI") {
    return NextResponse.json({ error: "lang must be fi-FI" }, { status: 400 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    return NextResponse.json(
      { error: "Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID" },
      { status: 500 }
    );
  }

  const key = hashKey(text, mode);
  const path = `/tmp/lumi_tts_${key}.mp3`;

  try {
    const existing = await fs.readFile(path);
    return new NextResponse(existing, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    // cache miss -> generate
  }

  const voice_settings =
    mode === "firm"
      ? { stability: 0.72, similarity_boost: 0.8, style: 0.28, use_speaker_boost: true }
      : mode === "listening"
        ? { stability: 0.68, similarity_boost: 0.78, style: 0.32, use_speaker_boost: true }
        : mode === "warm"
          ? { stability: 0.62, similarity_boost: 0.8, style: 0.4, use_speaker_boost: true }
          : { stability: 0.65, similarity_boost: 0.78, style: 0.35, use_speaker_boost: true };

  const elevenUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const res = await fetch(elevenUrl, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return NextResponse.json({ error: "ElevenLabs failed", details: errText }, { status: 500 });
  }

  const audio = Buffer.from(await res.arrayBuffer());

  try {
    await fs.writeFile(path, audio);
  } catch {
    // ignore cache write errors
  }

  return new NextResponse(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
