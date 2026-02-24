import { NextResponse } from "next/server";
import { resolveTTSAudioByKey } from "../../../../src/server/tts-core";

type Params = { params: { key: string } };

export async function GET(_: Request, context: Params) {
  const { key } = context.params;

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
