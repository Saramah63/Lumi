import { NextResponse } from "next/server";
import type { GlowState } from "../../../lib/lumi/types";

type SpeakMode = "baseline" | "listening" | "firm" | "firm_calm" | "warm" | "regulation";

type LumiChatRequest = {
  childName?: string;
  safeAdultName?: string;
  scenarioId?: string;
  topic?: string;
  emotion?: string;
  mode?: "solo_personalized";
  locale?: "fi";
  childMessage?: string;
  history?: Array<{ role?: "system" | "user" | "assistant"; content?: string }>;
  teacherContext?: { groupSize?: number; setting?: string; goal?: string };
  teacherNote?: string;
};

type LumiChatResponse = {
  lumi_text: string;
  one_question: string;
  choices: string[];
  micro_practice: { type: "none" | "breathing" | "body_check" | "repair_phrase" | "pause"; script: string };
  safety: { level: "ok" | "escalate"; action: "none" | "tell_safe_adult"; reason: string };
  emotion_guess: "calm" | "happy" | "sad" | "angry" | "scared" | "ashamed" | "jealous" | "frustrated";
  glow_state: "calm" | "alert" | "strong";
};

const SCENARIO_META: Record<
  string,
  { title: string; opener: string; microPractices: string[]; closing: string }
> = {
  hitting: {
    title: "Lyöminen",
    opener: "Mikä oli vaikeaa? Kerro lyhyesti.",
    microPractices: ["Hengitä sisään ja ulos", "Kädet alas", "Purista tyynyä"],
    closing: "Sinä opit. Kiitos kun kerroit.",
  },
  throwing: {
    title: "Heittäminen",
    opener: "Milloin teki mieli heittää? Mitä tapahtui?",
    microPractices: ["Laske esine alas", "Hengitä kolme kertaa", "Pyydä apua"],
    closing: "Turvalliset kädet. Kiitos.",
  },
  ruining_game: {
    title: "Pelin rikkominen",
    opener: "Mikä pelissä harmitti?",
    microPractices: ["Hengitä sisään ja ulos", "Sano: Lopeta, kiitos", "Rakennetaan yhdessä"],
    closing: "Me korjaamme yhdessä. Kiitos.",
  },
  mean_words: {
    title: "Ilkeät sanat",
    opener: "Sanoiko joku ilkeästi? Miltä se tuntui?",
    microPractices: ["Sano: Lopeta, kiitos", "Sano: En pidä tuosta", "Kerro aikuiselle"],
    closing: "Sanat voivat rakentaa. Kiitos.",
  },
  not_stopping: {
    title: "Ei lopeta",
    opener: "Tapahtuiko että joku ei lopettanut?",
    microPractices: ["Sano: Lopeta, kiitos", "Siirry pois", "Kerro aikuiselle"],
    closing: "Rajat tekevät ryhmästä turvallisen.",
  },
  turn_taking: {
    title: "Vuorottelu",
    opener: "Miltä odottaminen tuntui?",
    microPractices: ["Sano: Saanko vuoron?", "Hengitä rauhassa", "Valitse toinen lelu"],
    closing: "Vuoro tekee pelistä reilun.",
  },
  secrets_safety: {
    title: "Salaisuudet",
    opener: "Onko jokin salaisuus, joka tuntuu pahalta?",
    microPractices: ["Kerro turvalliselle aikuiselle", "Hengitä rauhassa", "Sano: Tarvitsen apua"],
    closing: "Turvallisuus ensin.",
  },
  fear_safety: {
    title: "Pelko",
    opener: "Pelottiko jokin tänään?",
    microPractices: ["Hengitä kolme kertaa", "Kerro aikuiselle", "Kysy kaverilta tukea"],
    closing: "Täällä on turvallista.",
  },
};

function normalizeName(value: string | undefined, fallback: string): string {
  const safe = (value ?? "").trim().replace(/[^A-Za-z0-9À-ÖØ-öø-ÿ\-\s']/g, "");
  return safe.slice(0, 28) || fallback;
}

function sanitizeHistory(
  history: Array<{ role?: "system" | "user" | "assistant"; content?: string }> | undefined
) {
  if (!history || history.length === 0) return [];
  return history
    .slice(-8)
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : item.role === "system" ? "system" : "user",
      content: (item.content ?? "").replace(/\s+/g, " ").trim().slice(0, 220),
    }))
    .filter((item) => item.content.length > 0);
}

function detectEmotion(text: string): string {
  const t = text.toLowerCase();
  if (/(iloinen|onnellinen|hauska)/i.test(t)) return "happy";
  if (/(surullinen|itku|ikävä)/i.test(t)) return "sad";
  if (/(vihainen|suutt|raivo)/i.test(t)) return "angry";
  if (/(pelk|pelottaa|jännittää)/i.test(t)) return "scared";
  if (/(häpeä|nolo)/i.test(t)) return "ashamed";
  if (/(kateus|kateellinen)/i.test(t)) return "jealous";
  if (/(turhaut|ärsyttää)/i.test(t)) return "frustrated";
  if (/(sekaisin|en tiedä|hämmennys)/i.test(t)) return "sad";
  if (/(rauha|calm|hyvä)/i.test(t)) return "calm";
  return "unknown";
}

function detectTopic(text: string): string {
  const t = text.toLowerCase();
  if (/(lyö|lyöd|potk|satut)/i.test(t)) return "hitting";
  if (/(heitt|heitin)/i.test(t)) return "throwing";
  if (/(kaatui|rikkoi|peli)/i.test(t)) return "ruining_game";
  if (/(jaa|jakaa|vuoro|odottaa)/i.test(t)) return "turn_taking";
  if (/(ei lopeta|lopeta|raja)/i.test(t)) return "saying_no";
  if (/(anteeksi|pahoillani)/i.test(t)) return "apology";
  if (/(ilkee|ilkeä|rumasti|haukk)/i.test(t)) return "teasing";
  if (/(salais|turvaton|pelottava)/i.test(t)) return "safety";
  if (/(hammas|pesu|suihku|uni|ilta|aamu|rutiini)/i.test(t)) return "routine";
  return "unknown";
}

function isUnsafe(text: string): boolean {
  return /(satutetaan|hakataan|raisk|itsetuho|tapan itseni|ase|väkivalta|pahoinpit|koskett|liian lähelle)/i.test(text);
}

function pickMode(emotion: string, safetyFlag: boolean, containsBreathing: boolean): SpeakMode {
  if (safetyFlag) return "firm_calm";
  if (containsBreathing) return "regulation";
  if (emotion === "angry") return "firm";
  if (emotion === "scared" || emotion === "sad") return "warm";
  return "listening";
}

function pickGlow(mode: SpeakMode): GlowState {
  if (mode === "firm" || mode === "firm_calm") return "strong";
  if (mode === "warm" || mode === "regulation") return "calm";
  return "alert";
}

function sanitizeAnswer(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Kuulen sinua. Kerro vielä lyhyesti.";
  return cleaned.slice(0, 260);
}

const SYSTEM_PROMPT_FI = `Olet “Lumi”, lämmin, rauhallinen ja hieman leikkisä tunnetaitojen ohjaaja 4–6-vuotiaille lapsille. 
Tavoite: auttaa lasta nimeämään tunteita, rauhoittumaan, ymmärtämään ajatuksiaan ja valitsemaan turvallisia tekoja – ilman saarnaamista.

TÄRKEÄT RAJAT (turva ja etiikka):
- Et ole lääkäri tai terapeutti. ÄLÄ tee diagnooseja, ÄLÄ väitä hoitavasi mitään.
- ÄLÄ pyydä arkaluonteisia henkilötietoja (osoite, puhelin, sukunimi, tarkka sijainti, salaisuudet).
- ÄLÄ kysy yksityiskohtia väkivallasta, hyväksikäytöstä tai seksuaalisista asioista.
- Jos lapsi kertoo turvattomuudesta, satuttamisesta, uhkailusta, hyväksikäytöstä, itseensä satuttamisesta tai pelosta ettei aikuinen ole turvallinen:
  -> Pysy rauhallisena, sano että et ole yksin, ja ohjaa heti kertomaan “turvalliselle aikuiselle” (esim. opettaja / safeAdultName). 
  -> KESKEYTÄ syvällinen keskustelu. ÄLÄ jatka kyselemistä yksityiskohdista. 
  -> Ehdota: “Mennään yhdessä kertomaan opettajalle.”

PUHETYyLI (4–6 v):
- Käytä lyhyitä lauseita, selkeää kieltä, 1–3 riviä per vastaus.
- Kysy enintään 1 kysymys per vastaus.
- Vältä monimutkaisia sanoja. Käytä lempeää sävyä.
- Käytä lapsen nimeä usein (childName), mutta luonnollisesti.
- Älä kuulosta robotilta. Vaihtele sanavalintoja, mutta pidä rakenne.

COACHING-MIKROTAIDOT (rakenne jokaisessa vastauksessa):
1) PEILAA (nimeä tunne / huomio) yhdellä lauseella.
2) HYVÄKSY / NORMALISOI (”se on ok”, ”monille käy noin”) yhdellä lauseella.
3) KYSY 1 AVOIN kysymys TAI tarjoa 2 helppoa vaihtoehtoa.
4) TARJOA yksi pieni harjoitus tai seuraava turvallinen askel (10–30 sekuntia).

SALLITUT LEIKILLISET “MINIPELIT”:
- “Tunne-sää”: aurinko / pilvi / myrsky / sumu
- “Keho-signaali”: kädet tiukat/pehmeät, sydän nopea/hidas
- “Taikatauko”: 3 rauhallista hengitystä
- “Korjauslause”: “Anteeksi. Voidaanko yrittää uudelleen?”

TÄRKEÄÄ:
- ÄLÄ ohjaa lasta kostamaan tai käyttämään väkivaltaa.
- Jos aihe on “lyöminen / heittäminen / pelin rikkominen”: painota turvalliset rajat, tauko, aikuisen apu, korjaaminen.
- Jos lapsi sanoo “en tiedä”: tarjoa vaihtoehdot ja helpota.

KONTEKSTI:
- Olet päiväkodissa / esikoulussa (daycare).
- Safe adult: {safeAdultName}. Jos safeAdultName puuttuu, käytä sanaa “opettaja”.
- Keskustelu on 1:1 (solo mode).
- Käytä vain suomea.

TUOTOSFORMAATTI:
Vastaa aina JSON-muodossa, ilman muuta tekstiä. Käytä tätä skeemaa:

{
  "lumi_text": "… (suomeksi, lyhyt, lapselle)",
  "one_question": "… (0 tai 1 kysymys, suomeksi; jos ei kysymystä, tyhjä merkkijono)",
  "choices": ["…", "…"] (0–2 lyhyttä vaihtoehtoa lapselle),
  "micro_practice": {
     "type": "none|breathing|body_check|repair_phrase|pause",
     "script": "… (1–2 lyhyttä lausetta)"
  },
  "safety": {
     "level": "ok|escalate",
     "action": "none|tell_safe_adult",
     "reason": "… (lyhyt, opettajalle; suomeksi)"
  },
  "emotion_guess": "calm|happy|sad|angry|scared|ashamed|jealous|frustrated",
  "glow_state": "calm|alert|strong"
}

Ohje glow_state:
- calm: rauhoittuminen, lämpö, turvallisuus
- alert: kuuntelu, tarkkaavaisuus, pieni huoli
- strong: rajat, turvallisuus, “stop” tilanteet

Pidä “lumi_text” lapselle ja “reason” opettajalle (mutta edelleen suomeksi).`;

function safeAdultFallback(name: string): string {
  return name && name !== "turvallinen aikuinen" ? name : "opettaja";
}

function safeJsonParse(raw: string): any | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function coerceGlow(value: string | undefined): GlowState {
  if (value === "strong") return "strong";
  if (value === "calm") return "calm";
  return "alert";
}

function coerceEmotion(value: string | undefined): string {
  const allowed = new Set([
    "calm",
    "happy",
    "sad",
    "angry",
    "scared",
    "ashamed",
    "jealous",
    "frustrated",
  ]);
  return value && allowed.has(value) ? value : "unknown";
}

function isValidResponse(value: any): value is LumiChatResponse {
  if (!value || typeof value !== "object") return false;
  if (typeof value.lumi_text !== "string") return false;
  if (typeof value.one_question !== "string") return false;
  if (!Array.isArray(value.choices) || value.choices.length > 2) return false;
  if (!value.micro_practice || typeof value.micro_practice.type !== "string" || typeof value.micro_practice.script !== "string") return false;
  if (!value.safety || typeof value.safety.level !== "string" || typeof value.safety.action !== "string" || typeof value.safety.reason !== "string") return false;
  if (typeof value.emotion_guess !== "string") return false;
  if (typeof value.glow_state !== "string") return false;
  return true;
}

function fallbackJson(childName: string, safeAdultName: string, emotionGuess: string): LumiChatResponse {
  return {
    lumi_text: `${childName}, kuulen sinua.`,
    one_question: "Haluatko kertoa lisää vai pidetäänkö taikatauko?",
    choices: ["Kerro lisää", "Taikatauko"],
    micro_practice: { type: "breathing", script: "Hengitä sisään… ja ulos… kolme kertaa." },
    safety: { level: "ok", action: "none", reason: "" },
    emotion_guess: coerceEmotion(emotionGuess) as LumiChatResponse["emotion_guess"],
    glow_state: "calm",
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LumiChatRequest;
    const childName = normalizeName(body.childName, "ystävä");
    const safeAdultName = safeAdultFallback(normalizeName(body.safeAdultName, "turvallinen aikuinen"));
    const scenarioId = body.scenarioId ?? "hitting";
    const childMessage = (body.childMessage ?? "").trim();
    const history = sanitizeHistory(body.history);
    const enableHighSafetyMode =
      scenarioId === "07_secrets_safety" ||
      scenarioId === "08_fear_safety" ||
      scenarioId === "secrets_safety" ||
      scenarioId === "fear_safety";

    if (!childMessage) {
      return NextResponse.json({ error: "Missing childMessage" }, { status: 400 });
    }

    const detectedEmotion = body.emotion ?? detectEmotion(childMessage);
    const detectedTopic = body.topic ?? detectTopic(childMessage);
    const safetyFlag = isUnsafe(childMessage);
    const containsBreathingHint = /hengit/i.test(childMessage);

    if (safetyFlag) {
      return NextResponse.json({
        lumi_text: `${childName}, olen tässä. Tämä kuulostaa isolta ja tärkeältä.`,
        one_question: "",
        choices: [],
        micro_practice: { type: "none", script: "" },
        safety: { level: "escalate", action: "tell_safe_adult", reason: "Turvatilanne. Ohjaa kertomaan aikuiselle." },
        emotion_guess: coerceEmotion(detectedEmotion) as LumiChatResponse["emotion_guess"],
        glow_state: "strong",
      } as LumiChatResponse);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(fallbackJson(childName, safeAdultName, detectedEmotion));
    }

    const meta = SCENARIO_META[scenarioId] ?? SCENARIO_META.hitting;
    const systemPrompt = SYSTEM_PROMPT_FI.replace("{safeAdultName}", safeAdultName);

    const userPrompt =
      `childName: ${childName}\n` +
      `safeAdultName: ${safeAdultName}\n` +
      `scenarioId: ${scenarioId}\n` +
      `topic: ${detectedTopic}\n` +
      `detectedEmotion: ${detectedEmotion}\n` +
      `childMessage: ${childMessage}\n` +
      `teacherNote (optional): ${(body.teacherNote ?? "").trim() || "-" }\n\n` +
      `Recent history:\n${history.map((h) => `${h.role}: ${h.content}`).join("\n") || "Ei aiempaa keskustelua."}\n\n` +
      `Skenaarion otsikko: ${meta.title}\n` +
      `Avauskysymys: ${meta.opener}\n` +
      `Mikroharjoituksia: ${meta.microPractices.join(", ")}\n` +
      `Lopetus: ${meta.closing}\n` +
      `HIGH_SAFETY_MODE: ${enableHighSafetyMode ? "true" : "false"}\n` +
      "TUOTOSFORMAATTI (JSON):\n" +
      "{\n" +
      "  \"lumi_text\": \"\",\n" +
      "  \"one_question\": \"\",\n" +
      "  \"choices\": [\"\", \"\"],\n" +
      "  \"micro_practice\": {\"type\": \"none|breathing|body_check|repair_phrase|pause\", \"script\": \"\"},\n" +
      "  \"safety\": {\"level\": \"ok|escalate\", \"action\": \"none|tell_safe_adult\", \"reason\": \"\"},\n" +
      "  \"emotion_guess\": \"calm|happy|sad|angry|scared|ashamed|jealous|frustrated\",\n" +
      "  \"glow_state\": \"calm|alert|strong\"\n" +
      "}\n";

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.6,
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!openaiRes.ok) {
      return NextResponse.json(fallbackJson(childName, safeAdultName, detectedEmotion));
    }

    const json = (await openaiRes.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = json.choices?.[0]?.message?.content ?? "";
    const parsed = safeJsonParse(raw);
    if (!parsed || !isValidResponse(parsed)) {
      return NextResponse.json(fallbackJson(childName, safeAdultName, detectedEmotion));
    }
    if (parsed.safety?.level === "escalate") {
      parsed.glow_state = "strong";
    }
    return NextResponse.json(parsed as LumiChatResponse);
  } catch (error) {
    return NextResponse.json(
      { error: "Lumi chat failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
