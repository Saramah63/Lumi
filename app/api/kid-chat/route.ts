import { NextResponse } from "next/server";
import type { GlowState } from "../../../lib/lumi/types";

export const runtime = "nodejs";

type SpeakMode = "baseline" | "listening" | "firm" | "firm_calm" | "warm" | "regulation";

type KidChatRequest = {
  kidName?: string;
  question?: string;
  contextMode?: SpeakMode;
  history?: Array<{ role?: "kid" | "lumi"; text?: string }>;
};

type KidChatResponse = {
  answer: string;
  mode: SpeakMode;
  glowState: GlowState;
  source: "openai" | "fallback";
};

function normalizeName(value: string | undefined): string {
  const safe = (value ?? "").trim().replace(/[^A-Za-z0-9À-ÖØ-öø-ÿ\-\s']/g, "");
  return safe.slice(0, 24) || "ystävä";
}

function fallbackAnswer(kidName: string, question: string): KidChatResponse {
  const q = question.toLowerCase();

  if (q.includes("miksi") || q.includes("why")) {
    return {
      answer: `${kidName}, joskus tunne on iso. Hengitä sisään ja ulos. Sitten ymmärrämme paremmin yhdessä.`,
      mode: "regulation",
      glowState: "calm",
      source: "fallback",
    };
  }
  if (q.includes("pelk") || q.includes("scared")) {
    return {
      answer: `${kidName}, pelko on sallittu tunne. Olen tässä kanssasi. Kerrotaan turvalliselle aikuiselle yhdessä.`,
      mode: "warm",
      glowState: "calm",
      source: "fallback",
    };
  }
  if (q.includes("vih") || q.includes("angry") || q.includes("suutt")) {
    return {
      answer: `${kidName}, viha kertoo että jokin oli vaikeaa. Pysähdy. Hengitä sisään ja ulos. Sitten puhumme.`,
      mode: "firm",
      glowState: "strong",
      source: "fallback",
    };
  }
  if (q.includes("anteeksi") || q.includes("sorry")) {
    return {
      answer: `${kidName}, se on rohkeaa. Voit sanoa anteeksi. Nyt korjaamme yhdessä rauhallisesti.`,
      mode: "warm",
      glowState: "calm",
      source: "fallback",
    };
  }

  return {
    answer: `${kidName}, hyvä kysymys. Mietitään yhdessä. Pysähdytään, hengitetään ja kerrotaan aikuiselle jos tarvitset apua.`,
    mode: "listening",
    glowState: "alert",
    source: "fallback",
  };
}

function sanitizeAnswer(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Hyvä kysymys. Mietitään yhdessä rauhassa.";
  return cleaned.slice(0, 220);
}

function sanitizeHistory(
  history: Array<{ role?: "kid" | "lumi"; text?: string }> | undefined
): Array<{ role: "kid" | "lumi"; text: string }> {
  if (!history || history.length === 0) return [];
  return history
    .slice(-6)
    .map((item): { role: "kid" | "lumi"; text: string } => ({
      role: item.role === "lumi" ? "lumi" : "kid",
      text: (item.text ?? "").replace(/\s+/g, " ").trim().slice(0, 180),
    }))
    .filter((item) => item.text.length > 0);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as KidChatRequest;
    const kidName = normalizeName(body.kidName);
    const question = (body.question ?? "").trim();
    const contextMode = body.contextMode ?? "listening";
    const history = sanitizeHistory(body.history);

    if (!question) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(fallbackAnswer(kidName, question));
    }

    const systemPrompt =
      "You are Lumi, Finnish kindergarten emotional assistant for ages 4-6. " +
      "Always answer in simple Finnish, 1-2 short sentences, calm/safe tone, " +
      "use words like pysähdy, turvallinen, kerro aikuiselle, hengitä, yhdessä when relevant. " +
      "Never give unsafe advice.";

    const historyText =
      history.length > 0
        ? history
            .map((h) => `${h.role === "kid" ? "Lapsi" : "Lumi"}: ${h.text}`)
            .join("\n")
        : "Ei aiempaa keskusteluhistoriaa.";

    const userPrompt =
      `Lapsen nimi: ${kidName}\nTilanne: ${contextMode}\n` +
      `Viime keskustelu:\n${historyText}\n` +
      `Lapsen uusi kysymys: ${question}\n` +
      "Vastaa lyhyesti suomeksi.";

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!openaiRes.ok) {
      return NextResponse.json(fallbackAnswer(kidName, question));
    }

    const json = (await openaiRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const raw = json.choices?.[0]?.message?.content ?? "";
    const answer = sanitizeAnswer(raw);

    const fallback = fallbackAnswer(kidName, question);
    const response: KidChatResponse = {
      answer,
      mode: fallback.mode,
      glowState: fallback.glowState,
      source: "openai",
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Kid chat failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
