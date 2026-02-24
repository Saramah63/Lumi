import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { Pool } from "pg";

type Lang = "fi-FI" | "en-US";
type TTSRequestBody = {
  text?: string;
  lang?: Lang;
  voice?: string;
};

type CacheRecord = {
  mimeType: string;
  audioBase64: string;
};

const CACHE_DIR = "/tmp/lumi-tts-cache";
const MAX_TEXT_LENGTH = 900;

let pool: Pool | null = null;

function getPool(): Pool | null {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    });
  }

  return pool;
}

async function ensureCacheTable(db: Pool): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS lumi_tts_cache (
      cache_key TEXT PRIMARY KEY,
      mime_type TEXT NOT NULL,
      audio_base64 TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function readCache(cacheKey: string): Promise<CacheRecord | null> {
  const db = getPool();

  if (db) {
    await ensureCacheTable(db);
    const result = await db.query(
      `SELECT mime_type, audio_base64 FROM lumi_tts_cache WHERE cache_key = $1`,
      [cacheKey]
    );

    if (result.rows.length > 0) {
      return {
        mimeType: result.rows[0].mime_type,
        audioBase64: result.rows[0].audio_base64,
      };
    }
  }

  const filePath = path.join(CACHE_DIR, `${cacheKey}.json`);

  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as CacheRecord;
    if (!parsed?.mimeType || !parsed?.audioBase64) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function writeCache(cacheKey: string, data: CacheRecord): Promise<void> {
  const db = getPool();

  if (db) {
    await ensureCacheTable(db);
    await db.query(
      `
      INSERT INTO lumi_tts_cache (cache_key, mime_type, audio_base64)
      VALUES ($1, $2, $3)
      ON CONFLICT (cache_key)
      DO UPDATE SET
        mime_type = EXCLUDED.mime_type,
        audio_base64 = EXCLUDED.audio_base64,
        created_at = NOW()
      `,
      [cacheKey, data.mimeType, data.audioBase64]
    );
  }

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const filePath = path.join(CACHE_DIR, `${cacheKey}.json`);
  await fs.writeFile(filePath, JSON.stringify(data), "utf8");
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

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

function normalizeVoice(lang: Lang, voice?: string): string {
  if (voice && voice.trim().length > 0) {
    return voice.trim();
  }

  return lang === "fi-FI" ? "fi_female_default" : "en_female_default";
}

async function synthWithElevenLabs(text: string, lang: Lang, voice: string): Promise<CacheRecord | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const defaultVoiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey) {
    return null;
  }

  const voiceId = voice.startsWith("eleven:")
    ? voice.replace("eleven:", "")
    : defaultVoiceId;

  if (!voiceId) {
    return null;
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2",
      voice_settings: {
        stability: lang === "fi-FI" ? 0.45 : 0.5,
        similarity_boost: 0.8,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs failed (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  return {
    mimeType: "audio/mpeg",
    audioBase64: audioBuffer.toString("base64"),
  };
}

async function synthWithOpenAI(text: string, lang: Lang, voice: string): Promise<CacheRecord> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const openAIVoice = voice.startsWith("openai:")
    ? voice.replace("openai:", "")
    : lang === "fi-FI"
      ? "alloy"
      : "nova";

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts",
      voice: openAIVoice,
      input: text,
      format: "mp3",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI TTS failed (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  return {
    mimeType: "audio/mpeg",
    audioBase64: audioBuffer.toString("base64"),
  };
}

async function synthesize(text: string, lang: Lang, voice: string): Promise<CacheRecord> {
  try {
    const eleven = await synthWithElevenLabs(text, lang, voice);
    if (eleven) {
      return eleven;
    }
  } catch (error) {
    console.warn("ElevenLabs synthesis failed, falling back to OpenAI.", error);
  }

  return synthWithOpenAI(text, lang, voice);
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

    const cached = await readCache(key);
    if (!cached) {
      json(res, 404, { error: "Audio not found" });
      return;
    }

    const audio = Buffer.from(cached.audioBase64, "base64");
    res.statusCode = 200;
    res.setHeader("Content-Type", cached.mimeType);
    res.setHeader("Content-Length", audio.length);
    res.end(audio);
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const rawBody = await readBody(req);
    const body = JSON.parse(rawBody) as TTSRequestBody;

    const text = (body.text ?? "").trim();
    const lang = body.lang ?? "fi-FI";

    if (!text) {
      json(res, 400, { error: "text is required" });
      return;
    }

    if (text.length > MAX_TEXT_LENGTH) {
      json(res, 400, { error: `text too long (max ${MAX_TEXT_LENGTH})` });
      return;
    }

    if (lang !== "fi-FI" && lang !== "en-US") {
      json(res, 400, { error: "lang must be fi-FI or en-US" });
      return;
    }

    const voice = normalizeVoice(lang, body.voice);
    const cacheKey = sha256(`${text}::${lang}::${voice}`);

    const cached = await readCache(cacheKey);
    if (cached) {
      json(res, 200, { audioUrl: `/api/tts?key=${cacheKey}`, cached: true });
      return;
    }

    const audio = await synthesize(text, lang, voice);
    await writeCache(cacheKey, audio);

    json(res, 200, { audioUrl: `/api/tts?key=${cacheKey}`, cached: false });
  } catch (error) {
    console.error("TTS endpoint error", error);
    json(res, 500, {
      error: "Failed to synthesize speech",
      detail: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
