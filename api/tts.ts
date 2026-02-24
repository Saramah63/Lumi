import type { IncomingMessage, ServerResponse } from "node:http";
import {
  prepareTTSAudio,
  resolveTTSAudioByKey,
  validateTTSInput,
  type TTSInput,
} from "../src/server/tts-core";

function json(res: ServerResponse, code: number, payload: unknown): void {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  res.setHeader("Cache-Control", "private, max-age=86400");

  if (req.method === "GET") {
    const url = new URL(req.url ?? "", "http://localhost");
    const key = url.searchParams.get("key");

    if (!key) {
      json(res, 400, { error: "Missing key" });
      return;
    }

    const audio = await resolveTTSAudioByKey(key);
    if (!audio) {
      json(res, 404, { error: "Audio not found" });
      return;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", audio.mimeType);
    res.setHeader("Content-Length", audio.buffer.length);
    res.end(audio.buffer);
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const rawBody = await readBody(req);
    const body = JSON.parse(rawBody) as Partial<TTSInput>;
    const parsed = validateTTSInput(body);

    if (!parsed.ok) {
      json(res, 400, { error: parsed.error });
      return;
    }

    const result = await prepareTTSAudio(parsed.data);
    json(res, 200, { audioUrl: result.audioUrl, cacheHit: result.cacheHit });
  } catch (error) {
    console.error("TTS endpoint error", error);
    json(res, 500, {
      error: "Failed to synthesize speech",
      detail: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
