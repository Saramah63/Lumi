import { NextResponse } from "next/server";
import crypto from "node:crypto";
import fs from "node:fs/promises";

type Mode = "baseline" | "listening" | "firm" | "firm_calm" | "warm" | "regulation";
type Lang = "fi-FI";

const VOICE_SETTINGS: Record<Mode, { stability: number; similarity_boost: number; style: number }> = {
  baseline: { stability: 0.55, similarity_boost: 0.8, style: 0.45 },
  listening: { stability: 0.6, similarity_boost: 0.8, style: 0.4 },
  firm: { stability: 0.65, similarity_boost: 0.8, style: 0.3 },
  firm_calm: { stability: 0.72, similarity_boost: 0.82, style: 0.22 },
  warm: { stability: 0.5, similarity_boost: 0.8, style: 0.55 },
  regulation: { stability: 0.6, similarity_boost: 0.8, style: 0.4 },
};

function hashKey(text: string, mode: Mode, lang: Lang, voice: string): string {
  return crypto.createHash("sha256").update(`${text}::${mode}::${lang}::${voice}`).digest("hex");
}

async function readTmpCache(path: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(path);
  } catch {
    return null;
  }
}

function openAiVoiceForMode(mode: Mode): string {
  if (mode === "firm" || mode === "firm_calm") return "ash";
  if (mode === "warm") return "nova";
  if (mode === "listening") return "sage";
  if (mode === "regulation") return "alloy";
  return "alloy";
}

const MODE_SPEED: Record<Mode, number> = {
  baseline: 0.9,
  listening: 0.95,
  firm: 0.95,
  firm_calm: 0.92,
  warm: 0.88,
  regulation: 0.9,
};

async function fetchWithTimeoutRetry(
  url: string,
  init: RequestInit,
  options?: { timeoutMs?: number; retries?: number }
): Promise<Response> {
  const timeoutMs = options?.timeoutMs ?? 10000;
  const retries = options?.retries ?? 1;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);

      if (res.ok) return res;
      if (attempt < retries && (res.status >= 500 || res.status === 429)) {
        continue;
      }
      return res;
    } catch (error) {
      clearTimeout(timer);
      lastError = error instanceof Error ? error : new Error("Network error");
      if (attempt >= retries) throw lastError;
    }
  }

  throw lastError ?? new Error("Request failed");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string; mode?: Mode; lang?: Lang; voice?: string };
    const text = body.text?.trim();
    const mode = body.mode ?? "baseline";
    const lang = body.lang ?? "fi-FI";
    const requestedVoice = body.voice?.trim() ?? "";

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }
    if (lang !== "fi-FI") {
      return NextResponse.json({ error: "Only fi-FI is supported" }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const elevenVoiceId = requestedVoice || process.env.ELEVENLABS_VOICE_ID || "";
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!apiKey && !openaiApiKey) {
      return NextResponse.json({ error: "Missing ELEVENLABS_API_KEY or OPENAI_API_KEY" }, { status: 500 });
    }

    const cacheKey = hashKey(text, mode, lang, requestedVoice || elevenVoiceId || "openai");
    const cachePath = `/tmp/lumi_tts_${cacheKey}.mp3`;
    const cached = await readTmpCache(cachePath);
    if (cached) {
      return new Response(new Uint8Array(cached), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
          "x-cache-hit": "1",
        },
      });
    }

    let audioBuffer: Buffer | null = null;
    const providerErrors: string[] = [];

    if (apiKey && elevenVoiceId) {
      const elevenUrl = `https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`;
      try {
        const upstream = await fetchWithTimeoutRetry(
          elevenUrl,
          {
            method: "POST",
            headers: {
              "xi-api-key": apiKey,
              "Content-Type": "application/json",
              Accept: "audio/mpeg",
            },
            body: JSON.stringify({
              text,
              model_id: "eleven_multilingual_v2",
              voice_settings: VOICE_SETTINGS[mode],
            }),
          },
          { timeoutMs: 9500, retries: 1 }
        );

        if (upstream.ok) {
          audioBuffer = Buffer.from(await upstream.arrayBuffer());
        } else {
          const details = await upstream.text();
          providerErrors.push(`ElevenLabs ${upstream.status}: ${details.slice(0, 240)}`);
        }
      } catch (error) {
        providerErrors.push(`ElevenLabs network/timeout: ${error instanceof Error ? error.message : "unknown"}`);
      }
    } else if (apiKey && !elevenVoiceId) {
      providerErrors.push("ELEVENLABS_VOICE_ID is missing.");
    }

    if (!audioBuffer && openaiApiKey) {
      try {
        const openaiResponse = await fetchWithTimeoutRetry(
          "https://api.openai.com/v1/audio/speech",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${openaiApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini-tts",
              voice: openAiVoiceForMode(mode),
              input: text,
              format: "mp3",
              speed: MODE_SPEED[mode] ?? 0.9,
            }),
          },
          { timeoutMs: 9500, retries: 1 }
        );

        if (openaiResponse.ok) {
          audioBuffer = Buffer.from(await openaiResponse.arrayBuffer());
        } else {
          const details = await openaiResponse.text();
          providerErrors.push(`OpenAI ${openaiResponse.status}: ${details.slice(0, 240)}`);
        }
      } catch (error) {
        providerErrors.push(`OpenAI network/timeout: ${error instanceof Error ? error.message : "unknown"}`);
      }
    }

    if (!audioBuffer) {
      return NextResponse.json(
        {
          error: "TTS provider failed. Configure ElevenLabs or OpenAI fallback correctly.",
          details: providerErrors.length > 0 ? providerErrors.join(" | ") : "No provider produced audio.",
        },
        { status: 500 }
      );
    }

    try {
      await fs.writeFile(cachePath, audioBuffer);
    } catch {
      // best-effort cache for /tmp
    }

    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "x-cache-hit": "0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "TTS route failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
