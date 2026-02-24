import { NextResponse } from "next/server";
import {
  prepareTTSAudio,
  resolveTTSAudioByKey,
  validateTTSInput,
  type TTSInput,
} from "../../../src/server/tts-core";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const audio = await resolveTTSAudioByKey(key);
  if (!audio) {
    return NextResponse.json({ error: "Audio not found" }, { status: 404 });
  }

  return new Response(audio.buffer, {
    status: 200,
    headers: {
      "Content-Type": audio.mimeType,
      "Cache-Control": "private, max-age=86400",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<TTSInput>;
    const parsed = validateTTSInput(body);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const result = await prepareTTSAudio(parsed.data);
    return NextResponse.json({ audioUrl: result.audioUrl, cacheHit: result.cacheHit }, { status: 200 });
  } catch (error) {
    console.error("Next TTS route error", error);
    return NextResponse.json(
      {
        error: "Failed to synthesize speech",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
