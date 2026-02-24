import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Pool } from "pg";

export type LumiLanguage = "fi-FI";
export type LumiVoiceMode = "baseline" | "listening" | "firm" | "warm";

export type TTSInput = {
  text: string;
  lang?: LumiLanguage;
  voice?: string;
  mode?: LumiVoiceMode;
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

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function validateTTSInput(input: Partial<TTSInput>): { ok: true; data: Required<TTSInput> } | { ok: false; error: string } {
  const text = (input.text ?? "").trim();
  const lang = input.lang ?? "fi-FI";
  const mode = normalizeMode(input.mode);
  const voice = (input.voice ?? "").trim();

  if (!text) {
    return { ok: false, error: "text is required" };
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return { ok: false, error: `text too long (max ${MAX_TEXT_LENGTH})` };
  }

  if (lang !== "fi-FI") {
    return { ok: false, error: "lang must be fi-FI" };
  }

  return {
    ok: true,
    data: {
      text,
      lang,
      mode,
      voice,
    },
  };
}

function normalizeMode(mode?: string): LumiVoiceMode {
  if (mode === "listening" || mode === "firm" || mode === "warm") {
    return mode;
  }
  return "baseline";
}

function normalizeVoice(mode: LumiVoiceMode, voice?: string): string {
  if (voice && voice.length > 0) {
    return voice;
  }

  return {
    baseline: "fi_baseline",
    listening: "fi_listening",
    firm: "fi_firm",
    warm: "fi_warm",
  }[mode];
}

function buildCacheKey(input: Required<TTSInput>): string {
  const voice = normalizeVoice(input.mode, input.voice);
  return sha256(`${input.text}::${input.lang}::${voice}::${input.mode}`);
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

function elevenVoiceSettings(mode: LumiVoiceMode): { stability: number; similarity_boost: number; style?: number; use_speaker_boost?: boolean } {
  if (mode === "firm") {
    return { stability: 0.68, similarity_boost: 0.75, style: 0.25, use_speaker_boost: true };
  }
  if (mode === "warm") {
    return { stability: 0.42, similarity_boost: 0.85, style: 0.45, use_speaker_boost: true };
  }
  if (mode === "listening") {
    return { stability: 0.55, similarity_boost: 0.82, style: 0.2, use_speaker_boost: true };
  }
  return { stability: 0.5, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true };
}

function elevenVoiceIdForMode(mode: LumiVoiceMode): string | undefined {
  if (mode === "firm") {
    return process.env.ELEVENLABS_VOICE_ID_FIRM ?? process.env.ELEVENLABS_VOICE_ID;
  }
  if (mode === "warm") {
    return process.env.ELEVENLABS_VOICE_ID_WARM ?? process.env.ELEVENLABS_VOICE_ID;
  }
  if (mode === "listening") {
    return process.env.ELEVENLABS_VOICE_ID_LISTENING ?? process.env.ELEVENLABS_VOICE_ID;
  }
  return process.env.ELEVENLABS_VOICE_ID_BASELINE ?? process.env.ELEVENLABS_VOICE_ID;
}

function openAIVoiceForMode(mode: LumiVoiceMode): string {
  if (mode === "firm") {
    return process.env.OPENAI_TTS_VOICE_FIRM ?? "onyx";
  }
  if (mode === "warm") {
    return process.env.OPENAI_TTS_VOICE_WARM ?? "nova";
  }
  if (mode === "listening") {
    return process.env.OPENAI_TTS_VOICE_LISTENING ?? "shimmer";
  }
  return process.env.OPENAI_TTS_VOICE_BASELINE ?? "alloy";
}

async function synthWithElevenLabs(input: Required<TTSInput>): Promise<CacheRecord | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return null;
  }

  const voiceIdFromMode = elevenVoiceIdForMode(input.mode);
  const voiceId = input.voice.startsWith("eleven:")
    ? input.voice.replace("eleven:", "")
    : voiceIdFromMode;

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
      text: input.text,
      model_id: process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2",
      voice_settings: elevenVoiceSettings(input.mode),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs failed (${response.status}): ${errorText.slice(0, 240)}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  return {
    mimeType: "audio/mpeg",
    audioBase64: audioBuffer.toString("base64"),
  };
}

async function synthWithOpenAI(input: Required<TTSInput>): Promise<CacheRecord> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const openAIVoice = input.voice.startsWith("openai:")
    ? input.voice.replace("openai:", "")
    : openAIVoiceForMode(input.mode);

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts",
      voice: openAIVoice,
      input: input.text,
      format: "mp3",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI TTS failed (${response.status}): ${errorText.slice(0, 240)}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  return {
    mimeType: "audio/mpeg",
    audioBase64: audioBuffer.toString("base64"),
  };
}

async function synthesize(input: Required<TTSInput>): Promise<CacheRecord> {
  try {
    const eleven = await synthWithElevenLabs(input);
    if (eleven) {
      return eleven;
    }
  } catch (error) {
    console.warn("ElevenLabs synthesis failed, falling back to OpenAI.", error);
  }

  return synthWithOpenAI(input);
}

export async function prepareTTSAudio(input: Required<TTSInput>): Promise<{ audioUrl: string; cached: boolean; cacheKey: string }> {
  const cacheKey = buildCacheKey(input);
  const cachedAudio = await readCache(cacheKey);

  if (!cachedAudio) {
    const audio = await synthesize(input);
    await writeCache(cacheKey, audio);
    return { audioUrl: `/api/tts?key=${cacheKey}`, cached: false, cacheKey };
  }

  return { audioUrl: `/api/tts?key=${cacheKey}`, cached: true, cacheKey };
}

export async function resolveTTSAudioByKey(cacheKey: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const cached = await readCache(cacheKey);
  if (!cached) {
    return null;
  }

  return {
    buffer: Buffer.from(cached.audioBase64, "base64"),
    mimeType: cached.mimeType,
  };
}
