import { NextRequest, NextResponse } from "next/server";
import { resolveTTSAudioByKey } from "../../../../src/server/tts-core";

type Params = { params: Promise<{ key: string }> };

export async function GET(_: NextRequest, context: Params) {
  const { key } = await context.params;

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const audio = await resolveTTSAudioByKey(key);
  if (!audio) {
    return NextResponse.json({ error: "Audio not found" }, { status: 404 });
  }

  return new Response(new Uint8Array(audio.buffer), {
    status: 200,
    headers: {
      "Content-Type": audio.mimeType,
      "Cache-Control": "private, max-age=86400",
    },
  });
}
