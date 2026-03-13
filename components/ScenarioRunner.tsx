"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { LumiAvatar } from "./LumiAvatar";
import { cancelLumiSpeak, lumiSpeak, type SpeakMode } from "../lib/lumi/speak";
import { lumiSpeak as lumiSpeakFinnish } from "../lib/lumi/speakFinnish";
import { mouthStateFromRms } from "../lib/lumi/lipSync";
import { unlockAudio } from "../lib/lumi/audioUnlock";
import { getAudioContext } from "../lib/lumi/audioContext";
import { buildTeacherSummaryFi, formatTeacherSummaryText, type SessionLog, type TeacherSummaryFi } from "../lib/lumi/teacherSummary";
import { scenarios, type ScenarioStep } from "../data/scenarios";
import type { GlowState, MouthState } from "../lib/lumi/types";
import { modeToGlowState } from "../lib/lumi/glowState";
import { askKidQuestion, type ConversationTurn } from "../lib/lumi/kidAssistant";
import {
  LUMI_EMOTIONS,
  emptyEmotionCounts,
  emotionLabelFi,
  normalizeEmotionKey,
  type LumiEmotionKey,
} from "../lib/lumi/emotions";

const emojis = LUMI_EMOTIONS.map((emotion) => ({
  id: emotion.key,
  label: emotion.emoji,
  text: emotion.labelFi,
}));

const scenarioSkill: Record<string, string> = {
  hitting: "Pysähtyminen ja anteeksipyyntö",
  throwing: "Turvallinen tekeminen ja rauhoittuminen",
  ruining_game: "Pettymyksen sietäminen ja korjaaminen",
  mean_words: "Ystävälliset sanat",
  not_stopping: "Rajan asettaminen ja kuunteleminen",
  turn_taking: "Vuorottelu ja odottaminen",
  secrets_safety: "Turvattomasta asiasta kertominen aikuiselle",
  fear_safety: "Pelon tunnistaminen ja turva-aikuisen hakeminen",
};

const reflectionPrompts: Record<string, string[]> = {
  hitting: ["Mikä auttoi, kun joku satutti?", "Mitä voimme sanoa, jotta kaveri tuntuu turvalliselta?"],
  throwing: ["Miksi sisällä ei heitetä?", "Miten voimme leikkiä turvallisesti?"],
  ruining_game: ["Miltä tuntuu, kun torni kaatuu?", "Miten voimme auttaa kaveria harmissa?"],
  mean_words: ["Mikä sana tuntuu hyvältä?", "Mitä voimme sanoa, jos kuulemme ilkeitä sanoja?"],
  not_stopping: ["Miksi on tärkeää lopettaa, kun joku sanoo 'Lopeta'?", "Mitä teet, jos joku ei kuuntele?"],
  turn_taking: ["Miltä tuntuu odottaa vuoroa?", "Miten voimme tehdä odottamisesta helpompaa?"],
  secrets_safety: ["Kenelle kerrot, jos salaisuus pelottaa?", "Miltä hyvä salaisuus tuntuu?"],
  fear_safety: ["Mikä auttaa, kun pelottaa?", "Kuka aikuinen on turva?"],
};

const themeScenarioIds = {
  turvataidot: ["hitting", "throwing", "not_stopping", "secrets_safety", "fear_safety"],
  toveritaidot: ["ruining_game", "mean_words", "turn_taking"],
} as const;

type Theme = keyof typeof themeScenarioIds;
type ScenarioMode = "random" | "manual";
type SessionLength = "6-8" | "10-12";
type SessionMode = "group_script" | "solo_personalized";
type SessionPhase =
  | "idle"
  | "pre_checkin"
  | "pre_reflection"
  | "scenario"
  | "post_checkin"
  | "post_reflection"
  | "complete";
type SoloStage = "ask_name" | "ask_safe_adult" | "ready";
type DetectedEmotion =
  | "happy"
  | "sad"
  | "angry"
  | "afraid"
  | "ashamed"
  | "jealous"
  | "frustrated"
  | "calm"
  | "unknown";
type DetectedTopic =
  | "hitting"
  | "throwing"
  | "ruining_game"
  | "sharing"
  | "turn_taking"
  | "saying_no"
  | "apology"
  | "teasing"
  | "safety"
  | "routine"
  | "unknown";

type SoloQuickButtons = {
  emotions: Array<{ id: DetectedEmotion; label: string }>;
  phrases: Array<{ id: string; label: string }>;
};
type VoteAction = {
  dominant: "happy" | "sad" | "angry" | "afraid" | "mixed";
  responseText: string;
  responseMode: SpeakMode;
  calmSupport: boolean;
  repeatStep: boolean;
  jumpMode: SpeakMode | null;
  message: string;
};

type SupportCard = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
};

type InteractionCue = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  prompt: string;
};

function getInteractionCue(step: ScenarioStep | undefined): InteractionCue | null {
  if (!step) return null;

  const bodyAction = (step.bodyAction ?? "").trim();
  const metaphor = (step.metaphor ?? "").trim();
  const cueKey = bodyAction || metaphor;

  switch (cueKey) {
    case "stopHands":
      return {
        id: "stopHands",
        icon: "✋",
        title: "Stop-kädet",
        subtitle: "Näytä avoimet kämmenet",
        prompt: "Näytä stop-kädet.",
      };
    case "braveHeart":
      return {
        id: "braveHeart",
        icon: "💛",
        title: "Rohkea sydän",
        subtitle: "Käsi sydämelle",
        prompt: "Laita käsi sydämelle.",
      };
    case "trafficLight":
      return {
        id: "trafficLight",
        icon: "🚦",
        title: "Liikennevalo",
        subtitle: "Pysähdy ja liiku",
        prompt: "Pysähdy hetkeksi. Sitten jatketaan.",
      };
    default:
      return null;
  }
}

function isBreathingStep(step: ScenarioStep | undefined): boolean {
  if (!step) return false;
  if (step.mode !== "regulation") return false;
  return /(hengitä|hengitys|kolme hengitystä|sisään|ulos)/i.test(step.text);
}

function getSupportCardsForStep(step: ScenarioStep | undefined): SupportCard[] {
  if (!step) return [];

  const source = `${step.text ?? ""} ${step.teacherHint ?? ""}`.toLowerCase();
  const cards: SupportCard[] = [];
  const push = (card: SupportCard) => {
    if (!cards.some((item) => item.id === card.id)) cards.push(card);
  };

  if (/hengitä|hengitys|sisään|ulos/.test(source)) {
    push({ id: "breathing", icon: "🌬️", title: "Hengitys", subtitle: "Sisään ja ulos" });
  }
  if (/halaus/.test(source)) {
    push({ id: "hug", icon: "🤗", title: "Halaus", subtitle: "Turvaa ja lohtua" });
  }
  if (/\btila\b|omaa tilaa|haluan tilaa/.test(source)) {
    push({ id: "space", icon: "🫧", title: "Oma tila", subtitle: "Vähän rauhaa" });
  }
  if (/aikuinen|turva-aikuinen/.test(source)) {
    push({ id: "adult", icon: "🧑", title: "Aikuinen", subtitle: "Pyydä lähelle" });
  }
  if (/vesi/.test(source)) {
    push({ id: "water", icon: "💧", title: "Vesi", subtitle: "Pieni tauko" });
  }
  if (/kaveri/.test(source)) {
    push({ id: "friend", icon: "🧒", title: "Kaveri", subtitle: "Yhdessä helpompi" });
  }
  if (/rauhallinen paikka|rauhallinen/.test(source)) {
    push({ id: "calm_place", icon: "🛋️", title: "Rauhallinen paikka", subtitle: "Mennään hetkeksi" });
  }
  if (/anteeksi/.test(source)) {
    push({ id: "apology", icon: "💛", title: "Anteeksi", subtitle: "Korjataan yhdessä" });
  }

  if ((step.teacherHint ?? "").toLowerCase().includes("need cards") && cards.length === 0) {
    push({ id: "choice", icon: "🖼️", title: "Tunnekortit", subtitle: "Valitse mikä auttaa" });
  }

  return cards;
}

function decideAwarenessGlowState(
  mode: SpeakMode | undefined,
  votes: Record<string, number>,
  votingMode: boolean,
  theme: Theme
): GlowState {
  const base = modeToGlowState(mode ?? "baseline");
  if (!votingMode) {
    if (mode === "baseline" || mode === "listening") {
      return theme === "turvataidot" ? "calm" : "alert";
    }
    return base;
  }

  const total = Object.values(votes).reduce((sum, n) => sum + n, 0);
  if (total < 2) return base;

  const angry = (votes.angry ?? 0) / total;
  const sad = (votes.sad ?? 0) / total;
  const afraid = (votes.afraid ?? 0) / total;
  const distress = sad + afraid;

  if (angry >= 0.35) return "strong";
  if (distress >= 0.4) return "calm";
  if (mode === "baseline" || mode === "listening") {
    return theme === "turvataidot" ? "calm" : "alert";
  }
  return base;
}

function normalizeKidName(input: string | null): string {
  const trimmed = (input ?? "").trim();
  if (!trimmed) return "ystävä";
  return trimmed.replace(/[^A-Za-z0-9À-ÖØ-öø-ÿ\-\s']/g, "").slice(0, 24) || "ystävä";
}

function normalizeAdultName(input: string | null): string {
  const trimmed = (input ?? "").trim();
  if (!trimmed) return "turvallinen aikuinen";
  return trimmed.replace(/[^A-Za-z0-9À-ÖØ-öø-ÿ\-\s']/g, "").slice(0, 28) || "turvallinen aikuinen";
}

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognitionLike)
  | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

async function captureKidSpeechFiFi(): Promise<string> {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    throw new Error("Puheentunnistus ei ole saatavilla tässä selaimessa.");
  }

  return new Promise<string>((resolve, reject) => {
    const recognition = new Ctor();
    recognition.lang = "fi-FI";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      recognition.stop();
      reject(new Error("En kuullut kysymystä."));
    }, 12000);

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() ?? "";
      if (!transcript) {
        if (!settled) {
          settled = true;
          window.clearTimeout(timeoutId);
          reject(new Error("En kuullut kysymystä."));
        }
        return;
      }
      if (!settled) {
        settled = true;
        window.clearTimeout(timeoutId);
        resolve(transcript);
      }
    };
    recognition.onerror = () => {
      if (!settled) {
        settled = true;
        window.clearTimeout(timeoutId);
        reject(new Error("Kuuntelu epäonnistui."));
      }
    };
    recognition.onend = () => {
      if (!settled) {
        settled = true;
        window.clearTimeout(timeoutId);
        reject(new Error("Kuuntelu päättyi."));
      }
    };

    recognition.start();
  });
}

function answerKidQuestion(question: string, kidName: string): string {
  const q = question.toLowerCase();
  const pick = (items: string[]) => items[Math.floor(Math.random() * items.length)];

  const empathy = pick([
    `${kidName}, kiitos kun kerroit. Tunne on ok.`,
    `${kidName}, kuulen sinua. Otetaan hetki rauhassa.`,
    `${kidName}, ymmärrän että tämä on tärkeää sinulle.`,
  ]);

  const safeAdult = pick([
    "Kenen turvallisen aikuisen luo voit mennä nyt? Kuka se on?",
    "Kerro turvalliselle aikuiselle. Kuka on sinun turvallinen aikuinen?",
    "Voimmeko kertoa tästä turvalliselle aikuiselle? Kuka se olisi?",
  ]);

  if (/(rakastan|tykkään|pidän|love|ihanaa|ihana)/i.test(q)) {
    return `${empathy} Minäkin välitän sinusta. Voimme näyttää ystävällisyyttä sanoilla.`;
  }

  if (/(anteeksi|pahoillani|sorry)/i.test(q)) {
    return `${empathy} Voit sanoa: "Anteeksi." Voit kysyä: "Onko sinulla ok?"`;
  }

  if (/(pelk|pelottaa|afraid|jännittää)/i.test(q)) {
    return `${empathy} Hengitetään sisään ja ulos. ${safeAdult}`;
  }

  if (/(vih|suutt|angry|raivo)/i.test(q)) {
    return `${empathy} Pysähdy. Kädet alas. Hengitä sisään ja ulos. Voit puristaa tyynyä.`;
  }

  if (/(surull|itku|ikävä|sad|yksin)/i.test(q)) {
    return `${empathy} Voit sanoa: "Minua harmittaa." ${safeAdult}`;
  }

  if (/(lyö|lyöd|potk|työnt|heitt|satut)/i.test(q)) {
    return `${empathy} Turvalliset kädet. Ei lyödä eikä heitetä. Mitä kädet voivat tehdä turvallisesti?`;
  }

  if (/(ilkee|ilkeä|rumasti|haukk|mean|paha sana)/i.test(q)) {
    return `${empathy} Voit sanoa: "Lopeta, kiitos." "En pidä tuosta." ${safeAdult}`;
  }

  if (/(salais|secrets|uhka|pelottava)/i.test(q)) {
    return `${empathy} Turvaton salaisuus kerrotaan aikuiselle. ${safeAdult}`;
  }

  if (/(suihku|pesu|hamp|vaate|siisteys|pissa|kakka|wc)/i.test(q)) {
    return `${empathy} Pidetään kehosta huolta: pese kädet, harjaa hampaat, vaihda vaatteet tarvittaessa.`;
  }

  if (/(nukk|uni|ilta|aamu|rutiini)/i.test(q)) {
    return `${empathy} Iltarutiini auttaa: iltasatu, hampaat, rauhallinen hengitys ja nukkumaan.`;
  }

  if (/(leikki|peli|vuoro|jakaa|odottaa)/i.test(q)) {
    return `${empathy} Voit sanoa: "Saanko vuoron?" ja "Kun sinä olet valmis." Leikki on reilua, kun odotetaan vuoroa.`;
  }

  if (/(miksi|why)/i.test(q)) {
    return `${empathy} Joskus tunne on iso. Hengitetään yhdessä ja mietitään rauhassa.`;
  }

  return `${empathy} Kerro lisää yhdellä lauseella. ${safeAdult}`;
}

function buildCustomScenario(kidName: string, kidQuestion: string | null) {
  const steps: ScenarioStep[] = [
    { mode: "warm", text: `Hei ${kidName}. Olen Lumi.` },
    { mode: "baseline", text: "Nyt olemme kahdestaan turvallisesti yhdessä." },
    { mode: "listening", text: `${kidName}, mitä sinulle kuuluu juuri nyt?` },
    { mode: "listening", text: "Näytä tunne emojilla tai kerro aikuiselle." },
    { mode: "regulation", text: "Otetaan yksi rauhallinen hengitys. Sisään… ja ulos." },
  ];

  const normalizedQuestion = (kidQuestion ?? "").trim();
  if (normalizedQuestion) {
    steps.push({ mode: "listening", text: `${kidName}, kuulin kysymyksesi.` });
    steps.push({ mode: "warm", text: answerKidQuestion(normalizedQuestion, kidName) });
  }

  steps.push(
    { mode: "baseline", text: "Jos jokin ei tunnu turvalliselta, kerro heti aikuiselle." },
    { mode: "warm", text: `${kidName}, sinä osaat jo paljon. Olen ylpeä sinusta.` }
  );

  return {
    id: "custom_1to1",
    title: `Yksilötila: ${kidName}`,
    durationTarget: "3-4 min",
    steps,
  };
}

function isScenarioInTheme(theme: Theme, scenarioId: string): boolean {
  return (themeScenarioIds[theme] as readonly string[]).includes(scenarioId);
}

function randomItem<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  const idx = Math.floor(Math.random() * items.length);
  return items[idx] ?? null;
}

function getSoloOpener(scenarioId: string): string {
  switch (scenarioId) {
    case "hitting":
      return "Mikä oli tänään vaikeaa? Kerro yhdellä lauseella.";
    case "throwing":
      return "Milloin teki mieli heittää? Mitä silloin tapahtui?";
    case "ruining_game":
      return "Mikä pelissä harmitti? Kerro lyhyesti.";
    case "mean_words":
      return "Sanoiko joku ilkeästi? Miltä se tuntui?";
    case "not_stopping":
      return "Tapahtuiko niin, että joku ei lopettanut? Miltä se tuntui?";
    case "turn_taking":
      return "Odotitko vuoroa? Miltä odottaminen tuntui?";
    case "secrets_safety":
      return "Onko jokin salaisuus, joka tuntuu pahalta? Kerro turvallisesti.";
    case "fear_safety":
      return "Pelottiko jokin tänään? Kerro lyhyesti.";
    default:
      return "Mitä sinulle kuuluu juuri nyt?";
  }
}

function findNextStepByMode(steps: ScenarioStep[], startIndex: number, mode: SpeakMode): number {
  for (let i = startIndex; i < steps.length; i += 1) {
    if (steps[i]?.mode === mode) return i;
  }
  return -1;
}

function countVotesMap(v: Record<string, number>): Record<string, number> {
  return {
    happy: v.happy ?? 0,
    sad: v.sad ?? 0,
    angry: v.angry ?? 0,
    afraid: v.afraid ?? 0,
  };
}

function dominantEmotions(counts: Record<string, number>) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, c]) => s + c, 0);
  const top = entries[0];
  const second = entries[1];
  return { entries, total, top, second };
}

function selectGroupResponse(counts: Record<string, number>): string[] {
  const { total, top, second } = dominantEmotions(counts);
  if (!total || !top || top[1] === 0) {
    return ["Voit näyttää tunteen, kun olet valmis.", "Aloitetaan rauhassa yhdessä."];
  }

  const diff = top[1] - (second?.[1] ?? 0);
  const dominantShare = top[1] / total;

  const lineFor = (key: string): string[] => {
    switch (key) {
      case "happy":
        return ["Näen paljon iloisia tunteita.", "Se on ihanaa.", "Aloitetaan yhdessä."];
      case "sad":
        return ["Näen surullisia tunteita.", "Olen tässä teitä varten.", "Harjoitellaan yhdessä lempeästi."];
      case "angry":
        return ["Näen, että monella on vihainen olo.", "Viha on iso tunne.", "Harjoitellaan yhdessä rauhoittumista."];
      case "afraid":
        return ["Näen pelokkaita tunteita.", "Pelko on tärkeä tunne.", "Täällä on turvallista."];
      default:
        return ["Näen monta erilaista tunnetta.", "Jotkut ovat iloisia, jotkut surullisia tai vihaisia.", "Kaikki tunteet ovat sallittuja.", "Harjoitellaan yhdessä."];
    }
  };

  const mixedTwo = (a: string, b: string, lines: string[]) => lines;

  if (dominantShare >= 0.5 && diff >= 2) {
    return lineFor(top[0]);
  }

  if (second && top[1] >= 1 && Math.abs(top[1] - second[1]) <= 1) {
    const pair = new Set([top[0], second[0]]);
    if (pair.has("happy") && pair.has("sad")) return mixedTwo("happy", "sad", ["Näen iloisia ja surullisia tunteita.", "Ryhmässä voi olla monta tunnetta.", "Kaikki tunteet ovat sallittuja."]);
    if (pair.has("angry") && pair.has("sad")) return mixedTwo("angry", "sad", ["Näen vihaisia ja surullisia tunteita.", "Ne ovat isoja tunteita.", "Olen tässä. Otetaan rauhassa yhdessä."]);
    if (pair.has("angry") && pair.has("afraid")) return mixedTwo("angry", "afraid", ["Näen vihaisia ja pelokkaita tunteita.", "Joskus vaikea tilanne tuntuu isona.", "Harjoitellaan yhdessä turvallisesti."]);
    if (pair.has("happy") && pair.has("angry")) return mixedTwo("happy", "angry", ["Näen iloisia ja vihaisia tunteita.", "Ryhmässä voi olla monta tunnetta.", "Harjoitellaan yhdessä."]);
  }

  return [
    "Näen monta erilaista tunnetta.",
    "Jotkut ovat iloisia, jotkut surullisia, vihaisia tai pelokkaita.",
    "Kaikki tunteet ovat sallittuja.",
    "Harjoitellaan yhdessä.",
  ];
}

function aggregateBeforeAfter(events: SessionLog["votingEvents"], half: "first" | "second"): Record<string, number> {
  if (!events.length) return emptyEmotionCounts();
  const mid = Math.max(1, Math.floor(events.length / 2));
  const slice = half === "first" ? events.slice(0, mid) : events.slice(mid);
  const counts = emptyEmotionCounts();
  slice.forEach((e) => {
    const key = normalizeEmotionKey(e.emoji);
    if (key) counts[key] += e.countDelta;
  });
  return counts;
}

function selectClosingResponse(before: Record<string, number>, after: Record<string, number>): string[] {
  const negKeys = ["angry", "sad", "afraid"];
  const negBefore = negKeys.reduce((s, k) => s + (before[k] ?? 0), 0);
  const negAfter = negKeys.reduce((s, k) => s + (after[k] ?? 0), 0);
  const happyBefore = before.happy ?? 0;
  const happyAfter = after.happy ?? 0;

  if (negAfter < negBefore && happyAfter >= happyBefore) {
    return ["Nyt näen rauhallisempia tunteita.", "Hyvä harjoittelu.", "Kiitos."];
  }
  if (happyAfter > happyBefore + 1) {
    return ["Nyt näen enemmän iloisia tunteita.", "Hienoa.", "Harjoittelimme yhdessä."];
  }
  if (negAfter >= negBefore && negAfter > 0) {
    return ["Näen, että osa tunteista on vielä isoja.", "Se on ihan okei.", "Voimme hengittää vielä yhdessä tai pyytää aikuista lähelle."];
  }
  return ["Nytkin ryhmässä on monta tunnetta.", "Kaikki tunteet ovat sallittuja.", "Kiitos, kun harjoittelitte yhdessä."];
}

function decideVoteAction(votes: Record<string, number>): VoteAction | null {
  const total = Object.values(votes).reduce((sum, n) => sum + n, 0);
  if (total < 2) return null;

  const counts = {
    happy: votes.happy ?? 0,
    sad: votes.sad ?? 0,
    angry: votes.angry ?? 0,
    afraid: votes.afraid ?? 0,
  };

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  const second = sorted[1];
  const tie = top && second && top[1] === second[1];
  const dominant = tie ? null : ((top?.[0] as VoteAction["dominant"]) ?? null);

  if (dominant === "happy") {
    return {
      dominant,
      responseText: "Kuulen iloa. Hienoa! Jatketaan rauhassa yhdessä.",
      responseMode: "warm",
      calmSupport: false,
      repeatStep: false,
      jumpMode: "warm",
      message: "Ilo huomattu, jatketaan.",
    };
  }

  if (dominant === "sad") {
    return {
      dominant,
      responseText: "Kuulen surua. Olen tässä. Saat olla surullinen.",
      responseMode: "warm",
      calmSupport: true,
      repeatStep: false,
      jumpMode: "warm",
      message: "Surua huomattu, tuetaan lempeästi.",
    };
  }

  if (dominant === "angry") {
    return {
      dominant,
      responseText: "Huomaan kiukkua. Pysähdytään ja hengitetään.",
      responseMode: "firm",
      calmSupport: true,
      repeatStep: false,
      jumpMode: "regulation",
      message: "Kiukku huomattu, rauhoitutaan.",
    };
  }

  if (dominant === "afraid") {
    return {
      dominant,
      responseText: "Kuulen pelkoa. Olet turvassa. Hengitetään yhdessä.",
      responseMode: "warm",
      calmSupport: true,
      repeatStep: false,
      jumpMode: "regulation",
      message: "Pelko huomattu, rauhoitutaan.",
    };
  }

  return {
    dominant: "mixed",
    responseText: "Nyt on monta tunnetta. Otetaan rauhassa.",
    responseMode: "warm",
    calmSupport: true,
    repeatStep: false,
    jumpMode: null,
    message: "Sekoitus tunteita, rauhoitetaan.",
  };
}

function EmotionList({ counts }: { counts?: Record<string, number> }) {
  const data = counts ?? emptyEmotionCounts();
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-200">
      {LUMI_EMOTIONS.map((emotion) => (
        <div key={emotion.key} className="flex items-center gap-2">
          <span className="text-sm">{emotion.emoji}</span>
          <span className="min-w-0 flex-1 break-words">{emotion.labelFi}</span>
          <span className="rounded bg-white/10 px-2 py-[1px] text-[11px] text-white">{data[emotion.key] ?? 0}</span>
        </div>
      ))}
    </div>
  );
}

export function ScenarioRunner() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("turvataidot");
  const [scenarioMode] = useState<ScenarioMode>("manual");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sessionLength, setSessionLength] = useState<SessionLength>("6-8");
  const [groupSize, setGroupSize] = useState(15);
  const [customKidName, setCustomKidName] = useState("ystävä");
  const [customQuestionInput, setCustomQuestionInput] = useState("");
  const [customAssistantStatus, setCustomAssistantStatus] = useState("");
  const [autoListen, setAutoListen] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [isListeningQuestion, setIsListeningQuestion] = useState(false);
  const [isAnsweringQuestion, setIsAnsweringQuestion] = useState(false);
  const [isStartingCustomTalk, setIsStartingCustomTalk] = useState(false);
  const [soloStage, setSoloStage] = useState<SoloStage>("ask_name");
  const [soloChildName, setSoloChildName] = useState("");
  const [soloSafeAdultName, setSoloSafeAdultName] = useState("");
  const [soloChildMessage, setSoloChildMessage] = useState("");
  const [soloHistory, setSoloHistory] = useState<ConversationTurn[]>([]);
  const [soloLlmHistory, setSoloLlmHistory] = useState<Array<{ role: "system" | "user" | "assistant"; content: string }>>([]);
  const [lastDetectedEmotion, setLastDetectedEmotion] = useState<DetectedEmotion>("unknown");
  const [lastDetectedTopic, setLastDetectedTopic] = useState<DetectedTopic>("unknown");
  const [soloBusy, setSoloBusy] = useState(false);
  const [soloButtons, setSoloButtons] = useState<SoloQuickButtons | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [soloSafetyAlert, setSoloSafetyAlert] = useState(false);
  const [sessionLog, setSessionLog] = useState<SessionLog | null>(null);
  const [summary, setSummary] = useState<TeacherSummaryFi | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [isPrintingSummary, setIsPrintingSummary] = useState(false);
  const [teacherNotes, setTeacherNotes] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveErrorRef = useRef<string | null>(null);
  const printSummaryRef = useRef<HTMLDivElement | null>(null);
  const [engagement, setEngagement] = useState<"low" | "medium" | "high">("medium");
  const closingResponseSentRef = useRef(false);
  const votePromptStageRef = useRef<"before" | "after" | null>(null);
  const autoVoteResolutionRef = useRef<"before" | "after" | null>(null);

  const sessionLogRef = useRef<SessionLog | null>(null);

  useEffect(() => {
    sessionLogRef.current = sessionLog;
  }, [sessionLog]);

  const [customScenario, setCustomScenario] = useState<{
    id: string;
    title: string;
    durationTarget: string;
    steps: ScenarioStep[];
  } | null>(null);

  const [elapsedSec, setElapsedSec] = useState(0);
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "hitting");
  const [stepIndex, setStepIndex] = useState(0);
  const [awaitingChoice, setAwaitingChoice] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mouthState, setMouthState] = useState<MouthState>(4);
  const [audioIntensity, setAudioIntensity] = useState(0);
  const [glowState, setGlowState] = useState<GlowState>("alert");
  const [glowPinned, setGlowPinned] = useState<GlowState | null>(null);
  const [animationSource, setAnimationSource] = useState<"audio" | "breath">("audio");
  const [breathInhale, setBreathInhale] = useState(true);
  const [breathGlow, setBreathGlow] = useState(0);
  const [forceBlink, setForceBlink] = useState(false);
  const [blinkNowTick, setBlinkNowTick] = useState(0);
  const [showBreathCue, setShowBreathCue] = useState(false);
  const breathPracticeTimerRef = useRef<number | null>(null);
  const breathPracticeRafRef = useRef<number | null>(null);
  const [svgMismatchWarning, setSvgMismatchWarning] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [teacherMode, setTeacherMode] = useState(false);
  const teacherPauseBetweenSteps = true;
  const [awaitingTeacherContinue, setAwaitingTeacherContinue] = useState(false);
  const teacherPendingStepRef = useRef<number | null>(null);
  const [awaitingDiscussionNote, setAwaitingDiscussionNote] = useState(false);

  useEffect(() => {
    if (!isSpeaking) {
      setMouthState(4);
    }
  }, [isSpeaking]);

  useEffect(() => {
    if (animationSource !== "breath") {
      setForceBlink(false);
      return;
    }
    setMouthState(breathInhale ? 1 : 4);
    setForceBlink(false);
  }, [animationSource, breathInhale]);

  const [votingMode, setVotingMode] = useState(true);
  const [sessionVoteStage, setSessionVoteStage] = useState<"before" | "after" | null>(null);
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>("idle");
  const [introVotePending, setIntroVotePending] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<LumiEmotionKey | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>(emptyEmotionCounts());
  const [emotionHistory, setEmotionHistory] = useState<string[]>([]);
  const [emotionTrend, setEmotionTrend] = useState<"happy" | "sad" | "angry" | "afraid" | null>(null);
  const [calmUsed, setCalmUsed] = useState(false);
  const [lastVoteAppliedStep, setLastVoteAppliedStep] = useState(-1);
  const [voteEffect, setVoteEffect] = useState("Odotetaan tunteita.");
  const [runError, setRunError] = useState<string | null>(null);
  const supportSequenceRef = useRef(0);
  const [reactionTick, setReactionTick] = useState(0);
  const [interactionCue, setInteractionCue] = useState<InteractionCue | null>(null);
  const lastGroupResponseRef = useRef<{ step: number; trend: "happy" | "sad" | "angry" | "afraid" | null; total: number }>({
    step: -1,
    trend: null,
    total: 0,
  });
  const speechBusyRef = useRef(false);
  const lastSpeechAtRef = useRef(0);
  const lastEmojiAtRef = useRef(0);

  const sessionMode: SessionMode = groupSize === 1 ? "solo_personalized" : "group_script";
  const canCollectVotes = votingMode && sessionMode === "group_script" && sessionVoteStage !== null;
  const childLanguage = "fi";
  const showDevTools = false;

  const scenario = useMemo(
    () => scenarios.find((s) => s.id === scenarioId) ?? scenarios[0],
    [scenarioId]
  );

  const ensureSessionLog = useCallback((): SessionLog => {
    const existing = sessionLogRef.current;
    if (existing && !existing.endedAt) return existing;
    const created: SessionLog = {
      sessionId: crypto.randomUUID(),
      startedAt: new Date().toISOString(),
      locale: "fi",
      appMode: sessionMode === "solo_personalized" ? "solo" : "group",
      groupSize,
      scenarioId: scenarioId ?? "hitting",
      scenarioTitle: scenario?.title ?? "Skenaario",
      stepsPlayed: [],
      teacherActions: [],
      votingEvents: [],
      microPractices: [],
      safetyEvents: [],
      soloContext: groupSize === 1 ? { childName: soloChildName || "ystävä", safeAdultName: soloSafeAdultName || "opettaja" } : undefined,
      soloTurns: [],
    };
    sessionLogRef.current = created;
    setSessionLog(created);
    setSummary(null);
    setSummaryOpen(false);
    setTeacherNotes("");
    setEngagement("medium");
    closingResponseSentRef.current = false;
    return created;
  }, [sessionMode, groupSize, scenarioId, scenario?.title, soloChildName, soloSafeAdultName]);

  const endSession = useCallback(() => {
    if (!sessionLog) return;
    const endedAt = new Date().toISOString();
    const durationSeconds = Math.max(0, Math.round((new Date(endedAt).getTime() - new Date(sessionLog.startedAt).getTime()) / 1000));
    const finalized = { ...sessionLog, endedAt, durationSeconds };
    const nextSummary = buildTeacherSummaryFi(finalized);
    setSessionLog(finalized);
    setSummary({ ...nextSummary, engagement });
    setTeacherNotes(nextSummary.teacherNotes);
    setSummaryOpen(true);
  }, [sessionLog, engagement]);

  const availableScenarios = useMemo(
    () => scenarios.filter((s) => isScenarioInTheme(theme, s.id)),
    [theme]
  );

  const isPlayingStepRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let unlocked = false;
    const onUserGesture = () => {
      if (unlocked) return;
      unlocked = true;
      void unlockAudio();
      window.removeEventListener("pointerdown", onUserGesture);
      window.removeEventListener("keydown", onUserGesture);
    };
    window.addEventListener("pointerdown", onUserGesture);
    window.addEventListener("keydown", onUserGesture);
    return () => {
      window.removeEventListener("pointerdown", onUserGesture);
      window.removeEventListener("keydown", onUserGesture);
    };
  }, []);

  useEffect(() => {
    if (teacherMode) return;
    setAwaitingTeacherContinue(false);
    teacherPendingStepRef.current = null;
    setAwaitingDiscussionNote(false);
  }, [teacherMode]);

  useEffect(() => {
    if (sessionMode !== "solo_personalized") return;
    if (soloHistory.length > 0) return;
    setIsRunning(false);
    setAwaitingChoice(false);
    setDone(false);
    setAutoListen(false);
    setCustomAssistantStatus("");
    setConversationHistory([]);
    setSoloStage("ask_name");
    setSoloChildName("");
    setSoloSafeAdultName("");
    setSoloChildMessage("");
    setSoloLlmHistory([]);
    setLastDetectedEmotion("unknown");
    setLastDetectedTopic("unknown");
    setSoloHistory([{ role: "lumi" as const, text: "Hei! Minä olen Lumi. Mikä sinun nimesi on?" }]);
  }, [sessionMode, soloHistory.length]);

  useEffect(() => {
    if (sessionMode !== "solo_personalized") return;
    let cancelled = false;
    const loadButtons = async () => {
      try {
        const res = await fetch("/content/fi/solo_quick_buttons.json");
        if (!res.ok) return;
        const json = (await res.json()) as { default?: SoloQuickButtons; [key: string]: SoloQuickButtons | undefined };
        if (cancelled) return;
        setSoloButtons(json[scenarioId] ?? json.default ?? null);
      } catch {
        if (!cancelled) setSoloButtons(null);
      }
    };
    void loadButtons();
    return () => {
      cancelled = true;
    };
  }, [sessionMode, scenarioId]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const files = [
        "/lumi_full/Lumi_REST.svg",
        "/lumi_full/Lumi_OPEN.svg",
        "/lumi_full/Lumi_WIDE.svg",
        "/lumi_full/Lumi_ROUND.svg",
        "/lumi_full/Lumi_CLOSED.svg",
        "/lumi_fx/Eyelids.svg",
      ];
      try {
        const texts = await Promise.all(files.map((p) => fetch(p).then((r) => (r.ok ? r.text() : ""))));
        if (cancelled) return;
        const read = (svg: string) => {
          const vb = svg.match(/viewBox\\s*=\\s*\"([^\"]+)\"/i)?.[1] ?? "";
          const w = svg.match(/width\\s*=\\s*\"([^\"]+)\"/i)?.[1] ?? "";
          const h = svg.match(/height\\s*=\\s*\"([^\"]+)\"/i)?.[1] ?? "";
          return { vb, w, h };
        };
        const metas = texts.map(read);
        const base = metas[0];
        const mismatch = metas.some((m) => m.vb !== base.vb || (m.w && base.w && m.w !== base.w) || (m.h && base.h && m.h !== base.h));
        setSvgMismatchWarning(
          mismatch ? "SVG exports are inconsistent. Re-export all Lumi_* and Eyelids from same 1024x1024 frame." : null
        );
      } catch {
        if (!cancelled) setSvgMismatchWarning("Unable to validate SVG framing.");
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (customScenario) return;
    const hasScenario = availableScenarios.some((s) => s.id === scenarioId);
    if (hasScenario) return;
    const nextId = availableScenarios[0]?.id ?? scenarios[0]?.id;
    if (!nextId || nextId === scenarioId) return;
    setScenarioId(nextId);
    setStepIndex(0);
    setDone(false);
    setAwaitingChoice(false);
  }, [availableScenarios, scenarioId, customScenario]);

  const activeScenario = customScenario ?? scenario;
  const step = activeScenario?.steps[stepIndex];
  const stepTextClean = step?.text ? step.text.replace(/\)\}/g, "").trim() : step?.text;
  const currentSupportCards = useMemo(() => getSupportCardsForStep(step), [step]);
  const awarenessGlowState = useMemo(
    () => decideAwarenessGlowState(step?.mode, votes, votingMode, theme),
    [step?.mode, votes, votingMode, theme]
  );
  const avatarMouthState: MouthState = mouthState;
  const breathPulse = animationSource === "breath" && showBreathCue;

  const selectRandomScenario = useCallback(() => {
    const pool = availableScenarios.length > 0 ? availableScenarios : scenarios;
    if (!pool.length) return;
    const pick = randomItem(pool);
    if (!pick) return;
    setCustomScenario(null);
    setConversationHistory([]);
    setCustomAssistantStatus("");
    setScenarioId(pick.id);
    setStepIndex(0);
    setDone(false);
    setAwaitingChoice(false);
  }, [availableScenarios, scenarios]);

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [isRunning]);

  useEffect(() => {
    if (groupSize > 1 && customScenario) {
      setCustomScenario(null);
      setConversationHistory([]);
      setCustomAssistantStatus("");
    }
  }, [groupSize, customScenario]);

  useEffect(() => {
    if (sessionMode === "solo_personalized") return;
    if (glowPinned) return;
    setGlowState(awarenessGlowState);
  }, [awarenessGlowState, glowPinned, sessionMode]);

  const resetAvatarState = useCallback(() => {
    setIsSpeaking(false);
    setMouthState(4);
    setAudioIntensity(0);
    setAnimationSource("audio");
    setBreathInhale(true);
    setBreathGlow(0);
    setForceBlink(false);
    setShowBreathCue(false);
    setGlowState(awarenessGlowState);
  }, [awarenessGlowState]);

  const stopBreathingPractice = useCallback(() => {
    if (breathPracticeTimerRef.current) window.clearTimeout(breathPracticeTimerRef.current);
    if (breathPracticeRafRef.current) cancelAnimationFrame(breathPracticeRafRef.current);
    breathPracticeTimerRef.current = null;
    breathPracticeRafRef.current = null;
    setAnimationSource("audio");
    setShowBreathCue(false);
    setBreathGlow(0);
    setForceBlink(false);
  }, []);

  const speakLine = useCallback(
    async (text: string, mode: SpeakMode) => {
      if (voiceEnabled) {
        await lumiSpeak(text, mode, {
          onSpeakingChange: setIsSpeaking,
          onMouthStateChange: setMouthState,
          onLightIntensityChange: setAudioIntensity,
        });
        return;
      }
      setIsSpeaking(false);
      setMouthState(4);
      setAudioIntensity(0);
      const silentMs = Math.max(900, Math.min(2500, text.length * 40));
      await new Promise((resolve) => window.setTimeout(resolve, silentMs));
    },
    [voiceEnabled]
  );

  useEffect(() => {
    if (voiceEnabled) return;
    void cancelLumiSpeak();
    setIsSpeaking(false);
    setMouthState(4);
    setAudioIntensity(0);
  }, [voiceEnabled]);


  const startBreathingPractice = useCallback((durationMs = 7000) => {
    stopBreathingPractice();
    setAnimationSource("breath");
    setShowBreathCue(true);
    setBreathInhale(true);
    const phaseDuration = 2000;
    const phaseStarted = performance.now();
    const animateGlow = (now: number) => {
      const elapsed = (now - phaseStarted) % (phaseDuration * 2);
      const progress = elapsed < phaseDuration ? elapsed / phaseDuration : (elapsed - phaseDuration) / phaseDuration;
      const inhale = elapsed < phaseDuration;
      setBreathInhale(inhale);
      const pulse = inhale ? progress : 1 - progress;
      setBreathGlow(0.04 + pulse * 0.08);
      if (now - phaseStarted < durationMs) {
        breathPracticeRafRef.current = requestAnimationFrame(animateGlow);
      }
    };
    breathPracticeRafRef.current = requestAnimationFrame(animateGlow);
    breathPracticeTimerRef.current = window.setTimeout(stopBreathingPractice, durationMs);
  }, [stopBreathingPractice]);

  const performVoteResponse = useCallback(
    async (action: VoteAction, currentText: string | undefined) => {
      setVoteEffect(action.message);
      const glow = action.dominant === "angry" ? "strong" : action.dominant === "afraid" ? "alert" : "calm";
      setGlowPinned(glow);
      setGlowState(glow);

      if (action.calmSupport) {
        startBreathingPractice();
        const logNow = ensureSessionLog();
        logNow.microPractices.push({ type: "breathing", at: new Date().toISOString() });
        setSessionLog({ ...logNow });
      }

      await speakLine(action.responseText, action.responseMode);

      if (action.repeatStep && currentText) {
        await speakLine(currentText, "baseline");
      }

      setGlowPinned(null);
      setGlowState(awarenessGlowState);
    },
    [speakLine, startBreathingPractice, ensureSessionLog, awarenessGlowState]
  );

  const speakSupport = useCallback(
    async (text: string, mode: SpeakMode = "warm") => {
      console.debug("[Lumi] support speech", { text, mode, stepIndex, sessionVoteStage, sessionPhase });
      setVoteEffect(text);
      if (!voiceEnabled) return;
      if (speechBusyRef.current) {
        await cancelLumiSpeak();
        speechBusyRef.current = false;
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      speechBusyRef.current = true;
      lastSpeechAtRef.current = Date.now();
      try {
        await speakLine(text, mode);
      } finally {
        speechBusyRef.current = false;
      }
    },
    [speakLine, voiceEnabled, stepIndex, sessionVoteStage, sessionPhase]
  );

  useEffect(() => {
    if (sessionVoteStage === null) {
      votePromptStageRef.current = null;
      return;
    }
    if (votePromptStageRef.current === sessionVoteStage) return;
    votePromptStageRef.current = sessionVoteStage;
    console.debug("[Lumi] vote stage entered", { sessionVoteStage, sessionPhase });
    if (sessionVoteStage === "after") {
      const prompt = "Entä nyt? Näytä tunne.";
      setVoteEffect(prompt);
      console.debug("[Lumi] post_checkin prompt spoken", { prompt });
      void speakSupport(prompt, "warm");
      return;
    }
    setVoteEffect("Näytä tunne.");
    console.debug("[Lumi] pre_checkin prompt spoken", { prompt: "Näytä tunne." });
    void speakSupport("Näytä tunne.", "warm");
  }, [sessionVoteStage, speakSupport, sessionPhase]);

  const playCurrentStep = useCallback(
    async (index: number) => {
      if (isPlayingStepRef.current) return;
      isPlayingStepRef.current = true;
      try {
        const current = activeScenario?.steps[index];
        console.debug("[Lumi] playback step", {
          scenarioId: activeScenario?.id,
          index,
          text: current?.text ?? null,
        });
        if (!activeScenario || !current) {
          setIsRunning(false);
          setDone(true);
          endSession();
          return;
        }

        const emotionalGlow = modeToGlowState(current.mode ?? "baseline");
        if (!glowPinned) {
          setGlowState(emotionalGlow);
        }

      setRunError(null);
      setDone(false);
      setAwaitingChoice(false);
      const log = ensureSessionLog();
      log.stepsPlayed.push({
        stepIndex: index,
        mode: current.mode,
        text: current.text,
        startedAt: new Date().toISOString(),
      });
      setSessionLog({ ...log });
      const breathingMode = isBreathingStep(current);
      const stepInteractionCue = getInteractionCue(current);
      let breathPhaseTimer: number | null = null;
      let breathRaf: number | null = null;
        const runGuidedBreathing = async () => {
          const cycles = 2;
          for (let i = 0; i < cycles; i += 1) {
            setBreathInhale(true);
            setBreathGlow(0.12);
            await speakLine("Hengitä sisään", "warm");
            await new Promise((resolve) => window.setTimeout(resolve, 500));
            setBreathInhale(false);
            setBreathGlow(0.06);
            await speakLine("Puhalla ulos", "regulation");
            await new Promise((resolve) => window.setTimeout(resolve, 600));
          }
          setBreathGlow(0.05);
        setBreathInhale(false);
        setCalmUsed(true);
      };
      if (breathingMode) {
        setAnimationSource("breath");
        setShowBreathCue(true);
        setBreathInhale(true);
        const logNow = ensureSessionLog();
        logNow.microPractices.push({ type: "breathing", at: new Date().toISOString() });
        setSessionLog({ ...logNow });

        const phaseStarted = performance.now();
        const phaseDuration = 2000;
        const animateGlow = (now: number) => {
          const elapsed = (now - phaseStarted) % (phaseDuration * 2);
          const progress = elapsed < phaseDuration ? elapsed / phaseDuration : (elapsed - phaseDuration) / phaseDuration;
          const inhale = elapsed < phaseDuration;
          setBreathInhale(inhale);
          const pulse = inhale ? progress : (1 - progress);
          setBreathGlow(0.04 + pulse * 0.08);
          breathRaf = requestAnimationFrame(animateGlow);
        };
        breathRaf = requestAnimationFrame(animateGlow);
        breathPhaseTimer = window.setInterval(() => {
          setBreathInhale((prev) => {
            const next = !prev;
            return next;
          });
        }, phaseDuration);
      } else {
        setAnimationSource("audio");
        setShowBreathCue(false);
        setBreathGlow(0);
      }

      setInteractionCue(stepInteractionCue);
      if (stepInteractionCue) {
        await speakLine(stepInteractionCue.prompt, "warm");
        await new Promise((resolve) => window.setTimeout(resolve, 350));
      }

      const spokenText = current.text ? current.text.replace(/\)\}/g, "").trim() : current.text;
      await speakLine(spokenText ?? current.text ?? "", current.mode as SpeakMode);
      if (breathingMode) {
        await runGuidedBreathing();
      }
      if (breathingMode) {
        setGlowState("calm");
        await speakLine("Olen tässä. Hyvä rauha.", "warm");
      }

      if (breathPhaseTimer) window.clearInterval(breathPhaseTimer);
      if (breathRaf) cancelAnimationFrame(breathRaf);
      if (breathingMode) {
        setAnimationSource("audio");
        setShowBreathCue(false);
        setBreathGlow(0);
      }
      setInteractionCue(null);

      const pauseMs = current.pauseMs ?? 500;
      await new Promise((resolve) => window.setTimeout(resolve, pauseMs));

      if (current.options && current.options.length > 0) {
        setAwaitingChoice(true);
        setIsRunning(false);
        return;
      }

      if (index >= activeScenario.steps.length - 1) {
        setIsRunning(false);
        setSessionPhase("post_checkin");
        setSessionVoteStage("after");
        setVotingMode(true);
        setVoteEffect("Entä nyt? Näytä tunne.");
        console.debug("[Lumi] post_checkin entered");
        return;
      }

      if (
        teacherPauseBetweenSteps &&
        sessionMode === "group_script" &&
        !awaitingChoice
      ) {
        teacherPendingStepRef.current = index + 1;
        setAwaitingTeacherContinue(true);
        setAwaitingDiscussionNote(true);
        setIsRunning(false);
        return;
      }

      if (sessionMode === "group_script") {
        setStepIndex((prev) => prev + 1);
        return;
      }

        setStepIndex((prev) => prev + 1);
      } finally {
        isPlayingStepRef.current = false;
      }
    },
    [activeScenario, sessionMode, ensureSessionLog, speakLine, awaitingChoice, glowPinned]
  );

  useEffect(() => {
    if (sessionMode !== "group_script") return;
    if (!isRunning || done) return;
    let active = true;

    const run = async () => {
    try {
      await playCurrentStep(stepIndex);
    } catch (error) {
      if (!active) return;
      setIsRunning(false);
      setAnimationSource("audio");
      setShowBreathCue(false);
      setForceBlink(false);
      setBreathGlow(0);
      setRunError(error instanceof Error ? error.message : "Playback failed");
    }
    };

    void run();

    return () => {
      active = false;
      void cancelLumiSpeak();
    };
  }, [isRunning, awaitingChoice, done, stepIndex, playCurrentStep, sessionMode]);

  const switchScenario = useCallback(
    async (id: string) => {
      await cancelLumiSpeak();
      setScenarioId(id);
      setStepIndex(0);
      setElapsedSec(0);
      setIsRunning(false);
      setDone(false);
      setSessionVoteStage(null);
      setIntroVotePending(false);
      setAwaitingChoice(false);
      setCustomScenario(null);
      setConversationHistory([]);
      setCustomAssistantStatus("");
      setLastVoteAppliedStep(-1);
      setVoteEffect("Odotetaan tunteita.");
      setRunError(null);
      setAwaitingTeacherContinue(false);
      teacherPendingStepRef.current = null;
      setEmotionHistory([]);
      setEmotionTrend(null);
      setCalmUsed(false);
      resetAvatarState();
    },
    [resetAvatarState]
  );

  const handleStartSession = useCallback(async () => {
    await cancelLumiSpeak();
    speechBusyRef.current = false;
    votePromptStageRef.current = null;
    autoVoteResolutionRef.current = null;
    console.debug("[Lumi] queue cleared before start");
    await unlockAudio();
    if (sessionMode === "solo_personalized") {
      setIsRunning(false);
      return;
    }

    const log = ensureSessionLog();
    log.teacherActions.push({ type: "start", at: new Date().toISOString() });
    setSessionLog({ ...log });
    setAwaitingTeacherContinue(false);
    setEmotionHistory([]);
    setEmotionTrend(null);
    setCalmUsed(false);
    teacherPendingStepRef.current = null;

    let chosenScenario = scenario;

    if (groupSize === 1) {
      const kidName = normalizeKidName(customKidName);
      const kidQuestion = customQuestionInput.trim();
      const oneToOne = buildCustomScenario(kidName, kidQuestion);
      setCustomScenario(oneToOne);
      setCustomKidName(kidName);
      setConversationHistory([]);
      setCustomAssistantStatus("");
      chosenScenario = oneToOne;
    } else {
      const candidatePool = availableScenarios.length > 0 ? availableScenarios : scenarios;
      const picked = scenarioMode === "random" ? randomItem(candidatePool) : scenario;
      if (!picked) {
        setRunError("No scenarios available.");
        return;
      }
      setCustomScenario(null);
      setConversationHistory([]);
      setCustomAssistantStatus("");
      chosenScenario = picked;
    }

    setRunError(null);
    setSessionPhase("pre_checkin");
    console.debug("[Lumi] session started");
    console.debug("[Lumi] scenario selected", {
      scenarioId: chosenScenario.id,
      firstStep: chosenScenario.steps?.[0]?.text ?? null,
    });
    setScenarioId(chosenScenario.id);
    setStepIndex(0);
    setElapsedSec(0);
    setDone(false);
    setSessionVoteStage(sessionMode === "group_script" ? "before" : null);
    setIntroVotePending(false);
    setVotingMode(true);
    setAwaitingChoice(false);
    setLastVoteAppliedStep(-1);
    setVotes(emptyEmotionCounts());
    setSelectedEmoji(null);
    lastEmojiAtRef.current = 0;
    setVoteEffect("Näytä tunne.");
    setIsRunning(false);
    resetAvatarState();
  }, [
    availableScenarios,
    scenarioMode,
    scenario,
    groupSize,
    sessionMode,
    customKidName,
    customQuestionInput,
    resetAvatarState,
  ]);

  const handleRestart = useCallback(async () => {
    await cancelLumiSpeak();
    speechBusyRef.current = false;
    votePromptStageRef.current = null;
    autoVoteResolutionRef.current = null;
    if (sessionMode === "solo_personalized") {
      setIsRunning(false);
      return;
    }
    const log = ensureSessionLog();
    log.teacherActions.push({ type: "reset", at: new Date().toISOString() });
    setSessionLog({ ...log });
    setStepIndex(0);
    setElapsedSec(0);
    setDone(false);
    setSessionPhase("pre_checkin");
    setSessionVoteStage(sessionMode === "group_script" ? "before" : null);
    setIntroVotePending(false);
    setVotingMode(true);
    setAwaitingChoice(false);
    setCustomScenario(groupSize === 1 ? customScenario : null);
    setConversationHistory([]);
    setCustomAssistantStatus("");
    setLastVoteAppliedStep(-1);
    setVotes(emptyEmotionCounts());
    setSelectedEmoji(null);
    lastEmojiAtRef.current = 0;
    setVoteEffect("Näytä tunne.");
    setAwaitingTeacherContinue(false);
    teacherPendingStepRef.current = null;
    setIsRunning(false);
    setRunError(null);
    resetAvatarState();
    console.debug("[Lumi] session restarted", { scenarioId: activeScenario?.id, firstStep: activeScenario?.steps?.[0]?.text ?? null });
  }, [resetAvatarState, groupSize, customScenario, sessionMode, ensureSessionLog, setCustomScenario, scenarioId, availableScenarios, activeScenario]);

  const handleRepeatStep = useCallback(async () => {
    if (!step) return;
    setRunError(null);
    const log = ensureSessionLog();
    log.teacherActions.push({ type: "repeat", at: new Date().toISOString() });
    setSessionLog({ ...log });
    await unlockAudio();

    try {
      await speakLine(step.text, step.mode as SpeakMode);
      if (!voiceEnabled) {
        setGlowState(awarenessGlowState);
      }
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "Repeat failed");
    }
  }, [step, voiceEnabled, awarenessGlowState, speakLine]);

  const handleTeacherContinue = useCallback(() => {
    if (!awaitingTeacherContinue) return;
    const next = teacherPendingStepRef.current;
    if (next == null) return;
    setRunError(null);
    setAwaitingTeacherContinue(false);
    setAwaitingDiscussionNote(false);
    teacherPendingStepRef.current = null;
    setStepIndex(next);
    setIsRunning(true);
  }, [awaitingTeacherContinue]);

  const empathyLines: Record<string, string[]> = {
    happy: ["Ihana kuulla!", "Sinä olet iloinen.", "Ilo tuntuu hyvältä."],
    sad: ["Olen tässä.", "Saat olla surullinen.", "Et ole yksin."],
    angry: ["Huomaan kiukun.", "Hengitetään yhdessä.", "Rauhassa nyt."],
    afraid: ["Olet turvassa.", "Minä olen täällä.", "Pidän sinusta huolta."],
  };

  const encouragementLines: Record<string, string[]> = {
    happy: ["Hienoa!", "Jatketaan ilolla.", "Kiitos jakamisesta."],
    sad: ["Hyvin kerrottu.", "Olen kanssasi.", "Otetaan tämä rauhassa."],
    angry: ["Hyvä pysähdys.", "Kiitos kun kerroit.", "Hengitys auttaa."],
    afraid: ["Olet turvassa.", "Hyvin kerroit.", "Ollaan rauhassa."],
  };

  const totalVotes = Object.values(votes).reduce((sum, n) => sum + n, 0);

  const respondToGroupVotes = useCallback(async () => {
    const counts = countVotesMap(votes);
    console.debug("[Lumi] votes collected", { stage: "before", counts });
    const lines = selectGroupResponse(counts);
    for (const line of lines) {
      await speakSupport(line, "warm");
    }
    const total = Object.values(counts).reduce((s, n) => s + n, 0);
    lastGroupResponseRef.current = { step: stepIndex, trend: "group" as any, total };
  }, [votes, speakSupport, stepIndex]);

  const respondToClosingVotes = useCallback(async () => {
    const log = sessionLogRef.current;
    if (!log || log.votingEvents.length === 0) return;
    const before = aggregateBeforeAfter(log.votingEvents, "first");
    const after = aggregateBeforeAfter(log.votingEvents, "second");
    console.debug("[Lumi] votes collected", { stage: "after", before, after });
    const lines = selectClosingResponse(before, after);
    for (const line of lines) {
      await speakSupport(line, "warm");
    }
  }, [speakSupport]);

  const finalizeBeforeVotes = useCallback(async () => {
    setSessionPhase("pre_reflection");
    console.debug("[Lumi] pre_reflection spoken");
    await respondToGroupVotes();
    setVotes(emptyEmotionCounts());
    setSelectedEmoji(null);
    setSessionVoteStage(null);
    setIntroVotePending(false);
    setAwaitingTeacherContinue(false);
    teacherPendingStepRef.current = null;
    lastEmojiAtRef.current = 0;
    setStepIndex(0);
    await unlockAudio();
    setSessionPhase("scenario");
    setIsRunning(true);
    console.debug("[Lumi] scenario started");
  }, [respondToGroupVotes, activeScenario]);

  const finalizeAfterVotes = useCallback(async () => {
    setSessionPhase("post_reflection");
    console.debug("[Lumi] post_reflection spoken");
    closingResponseSentRef.current = true;
    await respondToClosingVotes();
    setVotes(emptyEmotionCounts());
    setSelectedEmoji(null);
    setSessionVoteStage(null);
    lastEmojiAtRef.current = 0;
    setDone(true);
    setSessionPhase("complete");
    endSession();
  }, [respondToClosingVotes, endSession]);

  useEffect(() => {
    if (done && summary) {
      setSummaryOpen(true);
      if (!closingResponseSentRef.current) {
        closingResponseSentRef.current = true;
        void respondToClosingVotes();
      }
    }
  }, [done, summary, respondToClosingVotes]);

  useEffect(() => {
    if (sessionVoteStage === null) {
      autoVoteResolutionRef.current = null;
      return;
    }
    if (isRunning || done || groupSize <= 0) return;
    if (totalVotes < groupSize) {
      autoVoteResolutionRef.current = null;
      return;
    }
    if (autoVoteResolutionRef.current === sessionVoteStage) return;
    autoVoteResolutionRef.current = sessionVoteStage;

    const run = async () => {
      if (sessionVoteStage === "before") {
        await finalizeBeforeVotes();
        return;
      }
      await finalizeAfterVotes();
    };

    void run();
  }, [sessionVoteStage, totalVotes, groupSize, isRunning, done, finalizeBeforeVotes, finalizeAfterVotes]);

  const dominantFromCounts = (counts?: Record<string, number>) => {
    if (!counts) return null;
    const normalized = emptyEmotionCounts();
    Object.entries(counts).forEach(([rawKey, value]) => {
      const key = normalizeEmotionKey(rawKey);
      if (key) normalized[key] += value ?? 0;
    });
    const entries = Object.entries(normalized).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
    if (!entries.length || entries[0][1] === 0) return null;
    const top = entries[0];
    const second = entries[1];
    if (second && second[1] === top[1]) return null;
    return top[0];
  };

  const mapEmotionsForSave = (counts?: Record<string, number>) => {
    const normalized = emptyEmotionCounts();
    Object.entries(counts ?? {}).forEach(([rawKey, value]) => {
      const key = normalizeEmotionKey(rawKey);
      if (key) normalized[key] += value ?? 0;
    });
    return normalized;
  };

  const handleNextStep = useCallback(async () => {
    if (sessionMode !== "group_script") return;
    if (done) return;
    if (isRunning) return;
    const currentTotal = Object.values(votes).reduce((sum, n) => sum + n, 0);
    const log = ensureSessionLog();
    log.teacherActions.push({ type: "next", at: new Date().toISOString() });
    setSessionLog({ ...log });

    if (sessionVoteStage === "before") {
      if (currentTotal <= 0) {
        setVoteEffect("Näytä tunne ennen aloitusta.");
        return;
      }
      await finalizeBeforeVotes();
      return;
    }

    if (sessionVoteStage === "after") {
      if (currentTotal <= 0) {
        setVoteEffect("Näytä tunne vielä lopuksi.");
        return;
      }
      await finalizeAfterVotes();
      return;
    }

    if (awaitingTeacherContinue && teacherPendingStepRef.current != null) {
      setAwaitingTeacherContinue(false);
      setAwaitingDiscussionNote(false);
      const next = teacherPendingStepRef.current;
      teacherPendingStepRef.current = null;
      await unlockAudio();
      setStepIndex(next);
      setIsRunning(true);
      return;
    }

    if (awaitingChoice) {
      setAwaitingChoice(false);
      setVotes(emptyEmotionCounts());
      setSelectedEmoji(null);
      await unlockAudio();
      setStepIndex((prev) => Math.min(prev + 1, activeScenario?.steps.length ?? prev + 1));
      setIsRunning(true);
      return;
    }

    if (activeScenario) {
      await unlockAudio();
      setStepIndex((prev) => Math.min(prev + 1, activeScenario.steps.length - 1));
      setIsRunning(true);
    }
  }, [sessionMode, awaitingChoice, done, awaitingTeacherContinue, activeScenario, ensureSessionLog, votingMode, votes, stepIndex, sessionVoteStage, isRunning, finalizeBeforeVotes, finalizeAfterVotes]);

  const handleStop = useCallback(async () => {
    await cancelLumiSpeak();
    setIsRunning(false);
    setAwaitingChoice(false);
    setSessionVoteStage(null);
    setSessionPhase("complete");
    setSaveState("idle");
    saveErrorRef.current = null;
    if (sessionMode === "group_script") {
      setConversationHistory([]);
      setCustomAssistantStatus("");
    }
    const log = ensureSessionLog();
    log.teacherActions.push({ type: "reset", at: new Date().toISOString() });
    setSessionLog({ ...log });
    setRunError(null);
    resetAvatarState();
    setAwaitingTeacherContinue(false);
    teacherPendingStepRef.current = null;
    endSession();
    void respondToClosingVotes();
  }, [sessionMode, resetAvatarState, ensureSessionLog, endSession, respondToClosingVotes]);

  const handleReplayScenario = useCallback(async () => {
    await cancelLumiSpeak();
    speechBusyRef.current = false;
    votePromptStageRef.current = null;
    autoVoteResolutionRef.current = null;
    setRunError(null);
    setDone(false);
    setSaveState("idle");
    saveErrorRef.current = null;
    setAwaitingChoice(false);
    setAwaitingTeacherContinue(false);
    setAwaitingDiscussionNote(false);
    teacherPendingStepRef.current = null;
    setLastVoteAppliedStep(-1);
    setVotes(emptyEmotionCounts());
    setSelectedEmoji(null);
    setSessionPhase("pre_checkin");
    setSessionVoteStage(sessionMode === "group_script" ? "before" : null);
    setIntroVotePending(false);
    setVotingMode(true);
    lastEmojiAtRef.current = 0;
    setVoteEffect("Näytä tunne.");
    setStepIndex(0);
    setElapsedSec(0);
    setIsRunning(false);
    console.debug("[Lumi] session replayed", { scenarioId: activeScenario?.id, firstStep: activeScenario?.steps?.[0]?.text ?? null });
  }, [sessionMode, activeScenario]);

  const handleFirmBoundary = useCallback(async () => {
    if (sessionMode !== "group_script") return;
    setRunError(null);
    await unlockAudio();
    const log = ensureSessionLog();
    log.teacherActions.push({ type: "firm_boundary", at: new Date().toISOString() });
    setSessionLog({ ...log });
    try {
      setGlowPinned("strong");
      setGlowState("strong");
      if (voiceEnabled) {
        await lumiSpeak("Pysähdy. Ei tehdä noin. Turvalliset kädet.", "firm", {
          onSpeakingChange: setIsSpeaking,
          onMouthStateChange: setMouthState,
          onLightIntensityChange: setAudioIntensity,
        });
      }
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "Firm boundary failed");
    } finally {
      setGlowPinned(null);
      setGlowState(awarenessGlowState);
    }
  }, [sessionMode, voiceEnabled, awarenessGlowState]);

  const handleCalmSupport = useCallback(async () => {
    setRunError(null);
    await unlockAudio();

    try {
      if (voiceEnabled) {
        setGlowPinned("strong");
        setGlowState("strong");
        await lumiSpeak("Pysähdy. Tämä ei ole turvallista. Kerro aikuiselle.", "firm_calm", {
          onSpeakingChange: setIsSpeaking,
          onMouthStateChange: setMouthState,
          onLightIntensityChange: setAudioIntensity,
        });
      } else {
        setGlowPinned("strong");
        setGlowState("strong");
        await new Promise((resolve) => window.setTimeout(resolve, 1000));
      }
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "Calm support failed");
    } finally {
      setGlowPinned(null);
      setGlowState(awarenessGlowState);
    }
  }, [awarenessGlowState, voiceEnabled]);

  const handleCalmSupportLogged = useCallback(async () => {
    const log = ensureSessionLog();
    log.teacherActions.push({ type: "calm_support", at: new Date().toISOString() });
    setSessionLog({ ...log });
    setCalmUsed(true);
    await handleCalmSupport();
  }, [ensureSessionLog, handleCalmSupport]);

  const handlePrevStep = useCallback(async () => {
    if (sessionMode !== "group_script") return;
    await cancelLumiSpeak();
    setRunError(null);
    const log = ensureSessionLog();
    log.teacherActions.push({ type: "prev", at: new Date().toISOString() });
    setSessionLog({ ...log });
    setAwaitingChoice(false);
    setDone(false);
    setAwaitingTeacherContinue(false);
    setAwaitingDiscussionNote(false);
    teacherPendingStepRef.current = null;
    setIsRunning(false);
    setStepIndex((prev) => Math.max(0, prev - 1));
  }, [sessionMode, ensureSessionLog]);

  const handleOptionClick = async (next: number) => {
    await unlockAudio();
    setAwaitingChoice(false);
    setIsRunning(true);
    setStepIndex(next);
  };

  const playSfx = useCallback(
    async (kind: string) => {
      const ctx = await getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const base =
        kind === "happy" ? 720 :
        kind === "sad" ? 420 :
        kind === "angry" ? 260 :
        kind === "afraid" ? 340 : 600;
      osc.frequency.setValueAtTime(base, now);
      osc.type = "sine";
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.002, now + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    },
    []
  );

  const handleVote = async (emojiId: LumiEmotionKey) => {
    if (!canCollectVotes) return;
    const now = Date.now();
    if (now - lastEmojiAtRef.current < 250) return;
    const totalBefore = Object.values(votes).reduce((sum, n) => sum + n, 0);
    if (totalBefore >= groupSize) return;
    lastEmojiAtRef.current = now;
    setSelectedEmoji(emojiId);
    setReactionTick((v) => v + 1);
    void playSfx(emojiId);
    setVotes((prev) => ({ ...prev, [emojiId]: (prev[emojiId] ?? 0) + 1 }));
    setEmotionHistory((prev) => {
      const next = [...prev.slice(-9), emojiId];
      const freq = next.reduce<Record<string, number>>((acc, id) => ({ ...acc, [id]: (acc[id] ?? 0) + 1 }), {});
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
      const top = sorted[0];
      const second = sorted[1];
      const tie = top && second && top[1] === second[1];
      setEmotionTrend(tie ? null : ((top?.[0] as any) ?? null));
      return next;
    });
    const log = ensureSessionLog();
    const totalVotes = totalBefore + 1;
    log.votingEvents.push({ at: new Date().toISOString(), emoji: emojiId, countDelta: 1, totalVotes });
    setSessionLog({ ...log });
    const label = emojis.find((e) => e.id === emojiId)?.text ?? "Tunne";
    const empathyPick = randomItem(empathyLines[emojiId]) || `Ääni: ${label}`;
    const encouragePick = randomItem(encouragementLines[emojiId]);
    setVoteEffect(empathyPick);
    lastGroupResponseRef.current = { step: stepIndex, trend: emojiId as any, total: totalVotes };
    if (!glowPinned) {
      const glowMap: Record<string, GlowState> = { angry: "strong", afraid: "alert", sad: "calm", happy: "calm" };
      setGlowState(glowMap[emojiId] ?? "alert");
    }
    setAnimationSource("audio");
  };

  const elapsedLabel = `${String(Math.floor(elapsedSec / 60)).padStart(2, "0")}:${String(elapsedSec % 60).padStart(2, "0")}`;
  const dominantEmotionText = emotionTrend ? emotionLabelFi(emotionTrend) : "—";
  const skillHighlight = scenarioSkill[scenarioId] ?? "Tunnetaitojen harjoittelu";
  const reflectionList = reflectionPrompts[scenarioId] ?? ["Mikä auttoi Lumi-ystävää?", "Mitä teemme, kun tunne on iso?"];
  const emotionTone: "happy" | "sad" | "angry" | "afraid" | "idle" =
    (selectedEmoji as any) ??
    (emotionTrend as any) ??
    "idle";
  const avatarEmotionTone: "idle" | "happy" | "sad" | "angry" | "scared" =
    emotionTone === "afraid" ? "scared" : emotionTone;
  const haloTone: Record<typeof emotionTone, { glow: string; ring: string }> = {
    happy: { glow: "rgba(250,212,112,0.28)", ring: "rgba(250,212,112,0.18)" },
    sad: { glow: "rgba(126,187,255,0.26)", ring: "rgba(126,187,255,0.14)" },
    angry: { glow: "rgba(255,149,130,0.3)", ring: "rgba(255,149,130,0.18)" },
    afraid: { glow: "rgba(190,170,255,0.28)", ring: "rgba(190,170,255,0.16)" },
    idle: { glow: "rgba(126,231,255,0.24)", ring: "rgba(126,231,255,0.14)" },
  };
  const halo = haloTone[emotionTone] ?? haloTone.idle;

  const persistSummary = useCallback(
    async (auto = false) => {
      if (!summary) return;
      try {
        setSaveState((prev) => (prev === "saved" && auto ? prev : "saving"));
        const emotionsBefore = mapEmotionsForSave(summary.emotion.before);
        const emotionsAfter = mapEmotionsForSave(summary.emotion.after);
        const payload = {
          sessionId: sessionLogRef.current?.sessionId ?? null,
          sessionDate: summary.header.dateISO,
          scenarioId: summary.header.scenarioId,
          scenarioTitle: summary.header.scenarioTitle,
          mode: summary.header.appMode,
          groupSize: summary.header.groupSize,
          participants: summary.participants.count,
          durationSeconds: summary.header.durationSeconds,
          durationLabel: summary.header.duration,
          emotionsBefore,
          emotionsAfter,
          dominantEmotionBefore: dominantFromCounts(emotionsBefore),
          dominantEmotionAfter: dominantFromCounts(emotionsAfter),
          engagementLevel: summary.engagement,
          calmingSupportUsed: calmUsed,
          sessionCompleted: done,
          practicedSkill: skillHighlight,
          nextSteps: summary.nextSteps?.[0] ?? null,
          safetyNotes: summary.safety.note,
          teacherNotes,
        };
        const res = await fetch("/api/lumi/session-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`save_failed_${res.status}`);
        setSaveState("saved");
        saveErrorRef.current = null;
      } catch (error) {
        saveErrorRef.current = error instanceof Error ? error.message : "save_failed";
        setSaveState("error");
      }
    },
    [summary, calmUsed, done, skillHighlight, teacherNotes]
  );

  const handlePrintSummary = useCallback(() => {
    console.debug("[Lumi] print button clicked", { hasSummary: Boolean(summary) });
    if (!summary) return;
    flushSync(() => {
      setSummaryOpen(true);
      setIsPrintingSummary(true);
    });
    const runPrint = () => {
      const container = document.getElementById("lumi-session-summary-print") as HTMLDivElement | null;
      const textLength = container?.textContent?.trim().length ?? 0;
      console.debug("[Lumi] print container check", {
        found: Boolean(container),
        textLength,
      });
      if (!container || textLength === 0) {
        window.setTimeout(() => {
          const retryContainer = document.getElementById("lumi-session-summary-print") as HTMLDivElement | null;
          const retryLength = retryContainer?.textContent?.trim().length ?? 0;
          console.debug("[Lumi] print retry check", {
            found: Boolean(retryContainer),
            textLength: retryLength,
          });
          if (retryContainer && retryLength > 0) {
            console.debug("[Lumi] print function called");
            window.print();
          } else {
            setIsPrintingSummary(false);
          }
        }, 80);
        return;
      }
      console.debug("[Lumi] print function called");
      window.print();
    };
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(runPrint);
    });
  }, [summary]);

  useEffect(() => {
    const handleAfterPrint = () => setIsPrintingSummary(false);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  useEffect(() => {
    if (summary && done && saveState === "idle") {
      void persistSummary(true);
    }
  }, [summary, done, saveState, persistSummary]);

  const handleListenQuestion = useCallback(async () => {
    setIsListeningQuestion(true);
    setCustomAssistantStatus("Kuuntelen kysymystä...");
    try {
      const transcript = await captureKidSpeechFiFi();
      setCustomQuestionInput(transcript);
      setCustomAssistantStatus("Kysymys tunnistettu.");
    } catch (error) {
      setCustomAssistantStatus(error instanceof Error ? error.message : "Kuuntelu epäonnistui.");
    } finally {
      setIsListeningQuestion(false);
    }
  }, []);

  const generateAndSpeakAnswer = useCallback(async (questionOverride?: string) => {
    if (groupSize !== 1) return;

    const kidName = normalizeKidName(customKidName);
    const question = (questionOverride ?? customQuestionInput).trim();
    if (!question) {
      setCustomAssistantStatus("Kirjoita tai puhu kysymys ensin.");
      return;
    }

    setIsAnsweringQuestion(true);
    setRunError(null);
    try {
      const reply = await askKidQuestion({
        kidName,
        question,
        contextMode: (step?.mode as SpeakMode | undefined) ?? "listening",
        history: conversationHistory,
      });

      setCustomAssistantStatus(reply.source === "openai" ? "Älykäs vastaus valmis." : "Perusvastaus valmis.");
      setGlowPinned(reply.glowState);
      setGlowState(reply.glowState);

      if (voiceEnabled) {
        await lumiSpeak(reply.answer, reply.mode, {
          onSpeakingChange: setIsSpeaking,
          onMouthStateChange: setMouthState,
          onLightIntensityChange: setAudioIntensity,
        });
      }
      setConversationHistory((prev): ConversationTurn[] => {
        const kidTurn: ConversationTurn = { role: "kid", text: question };
        const lumiTurn: ConversationTurn = { role: "lumi", text: reply.answer };
        return [...prev, kidTurn, lumiTurn].slice(-6);
      });
    } catch (error) {
      const fallback = answerKidQuestion(question, kidName);
      setCustomAssistantStatus("Käytetään paikallista varavastausta.");
      setGlowPinned("calm");
      setGlowState("calm");
      if (voiceEnabled) {
        await lumiSpeak(fallback, "warm", {
          onSpeakingChange: setIsSpeaking,
          onMouthStateChange: setMouthState,
          onLightIntensityChange: setAudioIntensity,
        });
      }
      setConversationHistory((prev): ConversationTurn[] => {
        const kidTurn: ConversationTurn = { role: "kid", text: question };
        const lumiTurn: ConversationTurn = { role: "lumi", text: fallback };
        return [...prev, kidTurn, lumiTurn].slice(-6);
      });
      setRunError(error instanceof Error ? error.message : "Answer generation failed");
    } finally {
      setGlowPinned(null);
      setGlowState(awarenessGlowState);
      setIsAnsweringQuestion(false);
    }
  }, [
    groupSize,
    customKidName,
    customQuestionInput,
    conversationHistory,
    step?.mode,
    voiceEnabled,
    awarenessGlowState,
  ]);

  const handleStartCustomTalk = useCallback(async () => {
    if (groupSize !== 1) return;
    const kidName = normalizeKidName(customKidName);
    setIsStartingCustomTalk(true);
    setRunError(null);
    try {
      setCustomAssistantStatus("Lumi aloittaa keskustelun...");
      setGlowPinned("calm");
      setGlowState("calm");
      const opening = `Hei ${kidName}. Olen Lumi. Voit kysyä minulta mitä vain. Kuuntelen sinua nyt.`;
      if (voiceEnabled) {
        await lumiSpeak(
          opening,
          "warm",
          {
            onSpeakingChange: setIsSpeaking,
            onMouthStateChange: setMouthState,
            onLightIntensityChange: setAudioIntensity,
          }
        );
      }
      setConversationHistory((prev): ConversationTurn[] => {
        const lumiTurn: ConversationTurn = { role: "lumi", text: opening };
        return [...prev, lumiTurn].slice(-6);
      });
      setAutoListen(true);
      setCustomAssistantStatus("Keskustelu käynnissä. Kuuntelen jatkuvasti.");
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "Custom talk start failed");
    } finally {
      setGlowPinned(null);
      setGlowState(awarenessGlowState);
      setIsStartingCustomTalk(false);
    }
  }, [groupSize, customKidName, voiceEnabled, awarenessGlowState]);

  const handleListenAndReply = useCallback(async () => {
    if (groupSize !== 1) return;
    setRunError(null);
    setIsListeningQuestion(true);
    setCustomAssistantStatus("Kuuntelen lasta...");
    try {
      const transcript = await captureKidSpeechFiFi();
      setCustomQuestionInput(transcript);
      setCustomAssistantStatus("Ymmärsin kysymyksen. Lumi vastaa...");
      await generateAndSpeakAnswer(transcript);
    } catch (error) {
      setCustomAssistantStatus(error instanceof Error ? error.message : "Kuuntelu/vastaus epäonnistui.");
      setRunError(error instanceof Error ? error.message : "Listen and reply failed");
    } finally {
      setIsListeningQuestion(false);
    }
  }, [groupSize, generateAndSpeakAnswer]);

  const handleSoloSend = useCallback(async (messageOverride?: string, meta?: { topic?: string; emotion?: DetectedEmotion; teacherNote?: string }) => {
    if (sessionMode !== "solo_personalized") return;
    await unlockAudio();
    const raw = (messageOverride ?? soloChildMessage).trim();
    if (!raw) return;

    const appendKid = { role: "kid" as const, text: raw };
    setSoloHistory((prev) => [...prev, appendKid].slice(-16));
    setSoloChildMessage("");

    if (soloStage === "ask_name") {
      const name = normalizeKidName(raw);
      setSoloChildName(name);
      const reply = `Kiitos, ${name}. Kuka on sinun turvallinen aikuinen täällä? Esimerkiksi opettaja tai vanhempi.`;
      setSoloHistory((prev) => [...prev, { role: "lumi" as const, text: reply }].slice(-16));
      setSoloStage("ask_safe_adult");
      return;
    }

    if (soloStage === "ask_safe_adult") {
      const safeAdult = normalizeAdultName(raw);
      setSoloSafeAdultName(safeAdult);
      const opener = getSoloOpener(scenarioId);
      const reply =
        `Me voimme puhua tunteista ja siitä, mitä tehdä. ` +
        `Jos jokin tuntuu turvattomalta, pyydämme apua ${safeAdult}:ltä. ${opener}`;
      setSoloHistory((prev) => [...prev, { role: "lumi" as const, text: reply }].slice(-16));
      setSoloStage("ready");
      return;
    }

    setSoloBusy(true);
    setRunError(null);
    try {
      setCustomAssistantStatus("Lumi miettii...");
      const response = await fetch("/api/lumi-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: soloChildName || "ystävä",
          safeAdultName: soloSafeAdultName || "turvallinen aikuinen",
          scenarioId,
          mode: "solo_personalized",
          locale: childLanguage,
          childMessage: raw,
          topic: meta?.topic ?? scenarioId,
          emotion: meta?.emotion,
          teacherNote: meta?.teacherNote,
          history: soloLlmHistory,
          teacherContext: { groupSize: 1, setting: "daycare", goal: "emotional skills" },
        }),
      });

      if (!response.ok) {
        const details = await response.text().catch(() => "");
        throw new Error(details || `Solo chat failed (${response.status})`);
      }

      const json = (await response.json()) as {
        lumi_text: string;
        one_question: string;
        choices: string[];
        micro_practice: { type: "none" | "breathing" | "body_check" | "repair_phrase" | "pause"; script: string };
        safety: { level: "ok" | "escalate"; action: "none" | "tell_safe_adult"; reason: string };
        emotion_guess: DetectedEmotion;
        glow_state: GlowState;
      };

      const logSession = ensureSessionLog();
      if (logSession.teacherActions.length === 0) {
        logSession.teacherActions.push({ type: "start", at: new Date().toISOString() });
        setSessionLog({ ...logSession });
      }

      const speakParts = [json.lumi_text, json.one_question].filter(Boolean);
      if (json.choices && json.choices.length > 0) {
        speakParts.push(`Voit valita: ${json.choices.join(" tai ")}.`);
      }
      if (json.micro_practice?.script) {
        speakParts.push(json.micro_practice.script);
      }
      const speakText = speakParts.join(" ");

      const safetyEscalate = json.safety?.level === "escalate";
      setCustomAssistantStatus(safetyEscalate ? "Turvaviestissä. Kerrotaan aikuiselle." : "Kuuntelen sinua.");
      setSoloSafetyAlert(safetyEscalate);
      setLastDetectedEmotion(json.emotion_guess ?? "unknown");
      setLastDetectedTopic((meta?.topic as DetectedTopic) ?? (scenarioId as DetectedTopic) ?? lastDetectedTopic);
      setGlowState(safetyEscalate ? "strong" : json.glow_state);
      if (safetyEscalate) {
        const logNow = ensureSessionLog();
        logNow.safetyEvents.push({ level: "escalate", reason: json.safety?.reason ?? "", at: new Date().toISOString() });
        setSessionLog({ ...logNow });
      }

      if (json.micro_practice?.type === "breathing") {
        startBreathingPractice();
        const logNow = ensureSessionLog();
        logNow.microPractices.push({ type: "breathing", at: new Date().toISOString() });
        setSessionLog({ ...logNow });
      } else if (json.micro_practice?.type && json.micro_practice.type !== "none") {
        const logNow = ensureSessionLog();
        logNow.microPractices.push({ type: json.micro_practice.type, at: new Date().toISOString() });
        setSessionLog({ ...logNow });
      }

      if (voiceEnabled) {
        await lumiSpeakFinnish(speakText, safetyEscalate ? "firm_calm" : "warm", {
          onStart: () => setIsSpeaking(true),
          onFrame: (mouthOpen, lightIntensity) => {
            setMouthState(mouthStateFromRms(mouthOpen));
            setAudioIntensity(lightIntensity);
          },
          onEnd: () => {
            setIsSpeaking(false);
            setMouthState(4);
            setAudioIntensity(0);
          },
        });
      }
      setSoloHistory((prev) => [...prev, { role: "lumi" as const, text: speakText }].slice(-16));
      const logNow = ensureSessionLog();
      logNow.soloContext = { childName: soloChildName || "ystävä", safeAdultName: soloSafeAdultName || "opettaja" };
      const nextSoloTurns: NonNullable<SessionLog["soloTurns"]> = [
        ...(logNow.soloTurns ?? []),
        { role: "child" as const, text: raw.slice(0, 120), emotionGuess: json.emotion_guess ?? undefined, at: new Date().toISOString() },
        { role: "lumi" as const, text: speakText.slice(0, 160), emotionGuess: json.emotion_guess ?? undefined, at: new Date().toISOString() },
      ].slice(-12);
      logNow.soloTurns = nextSoloTurns;
      setSessionLog({ ...logNow });
      setSoloLlmHistory((prev) => [
        ...prev,
        { role: "user" as const, content: raw },
        { role: "assistant" as const, content: speakText },
      ].slice(-12));
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "Solo chat failed");
      const fallback = answerKidQuestion(raw, soloChildName || "ystävä");
      setSoloHistory((prev) => [...prev, { role: "lumi" as const, text: fallback }].slice(-16));
    } finally {
      setSoloBusy(false);
    }
  }, [
    sessionMode,
    soloChildMessage,
    soloStage,
    soloChildName,
    soloSafeAdultName,
    scenarioId,
    childLanguage,
    soloLlmHistory,
    voiceEnabled,
    startBreathingPractice,
    lastDetectedTopic,
    ensureSessionLog,
  ]);

  useEffect(() => {
    if (groupSize !== 1) return;
    if (!autoListen) return;
    if (isListeningQuestion || isAnsweringQuestion || isStartingCustomTalk) return;
    const id = window.setTimeout(() => {
      void handleListenAndReply();
    }, 600);
    return () => window.clearTimeout(id);
  }, [
    autoListen,
    groupSize,
    isListeningQuestion,
    isAnsweringQuestion,
    isStartingCustomTalk,
    handleListenAndReply,
  ]);

  if (!mounted) {
    return (
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.35fr_1fr]">
        <section className="min-h-[66vh] rounded-3xl border border-cyan-200/20 bg-white/[0.04] p-4 backdrop-blur-sm md:p-8" />
        <section className="min-h-[66vh] rounded-3xl border border-cyan-200/20 bg-white/[0.04] p-4 backdrop-blur-sm md:p-8" />
      </div>
    );
  }

  return (
    <div className="print-page-root mx-auto grid h-full min-h-0 w-full max-w-7xl gap-8 text-slate-100 lg:grid-cols-[1.2fr_1fr]">
      <section className="print-hide relative flex min-h-0 flex-col items-center justify-center overflow-visible rounded-[34px] border border-transparent bg-transparent p-7 shadow-none md:min-h-[66vh] md:p-12">
        <div
          className="pointer-events-none absolute inset-0 rounded-[34px]"
          style={{
            background: `radial-gradient(48% 48% at 50% 50%, ${halo.glow} 0%, transparent 68%)`,
            filter: "blur(24px)",
          }}
        />
        <div
          className={`relative aspect-square w-full max-w-[520px] md:max-w-[580px] overflow-visible ${breathPulse ? "animate-[breathPulse_4.2s_ease-in-out_infinite]" : ""}`}
          style={{
            boxShadow:
              glowState === "calm"
                ? "0 0 68px 34px rgba(126, 231, 255, 0.32)"
                : glowState === "alert"
                  ? "0 0 74px 38px rgba(255, 188, 120, 0.32)"
                  : "0 0 78px 40px rgba(255, 140, 140, 0.34)",
            transition: "box-shadow 320ms ease, filter 320ms ease",
            WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 72%, transparent 100%)",
            maskImage: "radial-gradient(circle at 50% 50%, black 72%, transparent 100%)",
          }}
        >
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.18),transparent_58%)] blur-3xl" />
          <div
            className="absolute inset-[-18%] animate-[pulseGlow_9s_ease-in-out_infinite] rounded-full"
            style={{
              background: `radial-gradient(circle, ${halo.glow} 0%, ${halo.ring} 28%, transparent 68%)`,
            }}
          />
          <div
            className="pointer-events-none absolute inset-[-10%] rounded-full mix-blend-screen"
            style={{
              background:
                glowState === "calm"
                  ? "radial-gradient(circle at 50% 42%, rgba(126,231,255,0.16) 0%, rgba(0,0,0,0) 64%)"
                  : glowState === "alert"
                    ? "radial-gradient(circle at 50% 42%, rgba(255,188,120,0.16) 0%, rgba(0,0,0,0) 64%)"
                    : "radial-gradient(circle at 50% 42%, rgba(255,140,140,0.16) 0%, rgba(0,0,0,0) 64%)",
              filter: "blur(22px)",
              opacity: 0.9,
              transition: "opacity 260ms ease, background 260ms ease",
            }}
          />
          {animationSource === "breath" && (
            <div
              className="pointer-events-none absolute inset-[-14%] rounded-full bg-[radial-gradient(circle,rgba(126,231,255,0.18)_0%,rgba(182,156,255,0.14)_38%,rgba(255,188,120,0.08)_54%,rgba(126,231,255,0)_74%)] opacity-85 animate-[breathAura_3.8s_ease-in-out_infinite]"
              style={{
                WebkitMaskImage: "radial-gradient(circle at 50% 50%, white 68%, transparent 100%)",
                maskImage: "radial-gradient(circle at 50% 50%, white 68%, transparent 100%)",
              }}
            />
          )}
          <LumiAvatar
            isSpeaking={isSpeaking}
            mouthState={avatarMouthState}
            audioIntensity={audioIntensity}
            glowState={glowState}
            animationSource={animationSource}
            breathGlow={breathGlow}
            forceBlink={forceBlink}
            blinkNowTick={blinkNowTick}
            debugOverlay={false}
            glowDisabled={false}
            regulationActive={animationSource === "breath"}
            emotionTone={avatarEmotionTone}
            reactionTick={reactionTick}
          />
        </div>
        <div className="mt-6 min-w-0 overflow-hidden text-center">
          <p className="break-words text-base font-semibold text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]">{activeScenario?.title ?? "-"} • {stepIndex + 1}/{activeScenario?.steps.length ?? 0}</p>
          {showBreathCue ? (
            <p className="mt-1 text-sm font-medium text-cyan-100">Hengitetään yhdessä</p>
          ) : null}
        </div>
      </section>

      <section className="print-report-shell flex min-h-0 min-w-0 flex-col gap-5 overflow-hidden rounded-[34px] border border-white/10 bg-[rgba(20,25,50,0.65)] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.42)] backdrop-blur-[12px] md:min-h-[66vh] md:p-8">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/12 bg-white/6 px-4 py-3 shadow-inner shadow-black/30">
              <div className="min-w-0">
                <p className="break-words text-base font-semibold text-white drop-shadow-sm">Opettajan ohjaus</p>
                <p className="break-words text-xs font-medium text-cyan-100/80">Aika: {elapsedLabel}</p>
              </div>
        </div>

        <div className="min-h-0 min-w-0 space-y-4 overflow-y-auto pr-1">
          <div className="grid min-w-0 gap-3 overflow-hidden rounded-2xl border border-cyan-100/15 bg-slate-900/50 p-3 md:grid-cols-2 md:p-4">
            <div className="min-w-0 space-y-3 md:col-span-2">
              <p className="text-sm font-medium text-slate-200">Istunto</p>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 rounded-xl border border-cyan-100/20 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-100">
                  Ryhmäkoko
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={groupSize}
                    onChange={(e) => setGroupSize(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
                    className="h-8 w-16 rounded-lg border border-cyan-200/40 bg-slate-950/70 px-2 text-center text-xs font-semibold text-slate-100 outline-none focus:border-cyan-300"
                  />
                </label>
              </div>
              <div className="grid min-w-0 grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => void handleStartSession()}
                  disabled={isRunning || sessionMode !== "group_script"}
                  className="h-12 max-w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-3 text-sm font-semibold leading-tight text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:translate-y-[-1px] disabled:opacity-60 md:text-base"
                >
                  Aloita
                </button>
                <button
                  type="button"
                  onClick={() => void handleStop()}
                  disabled={sessionMode !== "group_script"}
                  className="h-12 max-w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-3 text-sm font-semibold leading-tight text-white shadow-lg shadow-indigo-500/30 transition hover:translate-y-[-1px] disabled:opacity-60 md:text-base"
                >
                  Lopeta
                </button>
                <button
                  type="button"
                  onClick={() => void handleRestart()}
                  disabled={sessionMode !== "group_script"}
                  className="h-12 max-w-full rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 px-3 text-sm font-semibold leading-tight text-slate-900 shadow-lg shadow-orange-400/30 transition hover:translate-y-[-1px] disabled:opacity-60 md:text-base"
                >
                  Alusta
                </button>
              </div>
              {awaitingDiscussionNote && (
                <p className="text-xs text-amber-200">Opettajan tauko: keskustele hetki, jatka kun ryhmä on valmis.</p>
              )}
              <p className="text-xs text-slate-400">
                {sessionMode !== "group_script"
                  ? "Yksilötila on käytössä."
                  : done
                    ? "Istunto valmis. Voit aloittaa uuden."
                    : isRunning
                      ? "Istunto käynnissä."
                      : "Valmiina aloittamaan."}
              </p>
            </div>
            <div className="min-w-0 space-y-3">
              <p className="text-sm font-semibold text-white">Teema</p>
              <div className="grid min-w-0 grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("turvataidot")}
                  className={`h-12 max-w-full whitespace-normal break-words leading-tight rounded-2xl border px-3 text-sm font-semibold shadow-sm transition ${theme === "turvataidot" ? "border-cyan-300 bg-cyan-100/70 text-slate-900" : "border-white/15 bg-white/5 text-slate-100 hover:border-cyan-200/60"}`}
                >
                  Turvataidot
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("toveritaidot")}
                  className={`h-12 max-w-full whitespace-normal break-words leading-tight rounded-2xl border px-3 text-sm font-semibold shadow-sm transition ${theme === "toveritaidot" ? "border-pink-200 bg-pink-100/80 text-slate-900" : "border-white/15 bg-white/5 text-slate-100 hover:border-pink-200/60"}`}
                >
                  Toveritaidot
                </button>
              </div>
            </div>

            <div className="min-w-0 space-y-3">
              <p className="text-sm font-semibold text-white">Skenaario</p>
              <select
                value={scenarioId}
                onChange={(e) => void switchScenario(e.target.value)}
                disabled={groupSize === 1}
                className="h-11 min-w-0 w-full max-w-full rounded-2xl border border-white/12 bg-white/6 px-3 text-sm font-semibold text-white outline-none ring-0 focus:border-cyan-300 focus:bg-white/10 disabled:opacity-60"
              >
                {availableScenarios.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0 space-y-3">
              <p className="text-sm font-medium text-slate-200">Ääni</p>
              <button
                type="button"
                onClick={() => setVoiceEnabled((v) => !v)}
                className={`h-12 w-full max-w-full whitespace-normal break-words rounded-2xl px-3 text-sm font-semibold leading-tight shadow-md transition hover:translate-y-[-1px] md:text-base ${voiceEnabled ? "bg-gradient-to-r from-emerald-400 to-lime-300 text-slate-900 shadow-emerald-400/30" : "bg-white/8 text-white border border-white/10"}`}
              >
                {voiceEnabled ? "Ääni päällä" : "Ääni pois"}
              </button>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-2 self-end">
              <button
                type="button"
                onClick={() => void handleRepeatStep()}
                className="h-auto min-h-11 max-w-full whitespace-normal break-words rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-400 px-3 py-2 text-sm font-semibold leading-tight text-slate-900 shadow-md shadow-sky-400/30 transition hover:translate-y-[-1px] md:text-base"
              >
                Toista vaihe
              </button>
              <button
                type="button"
                onClick={() => void handleCalmSupportLogged()}
                className="h-auto min-h-11 max-w-full whitespace-normal break-words rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 px-3 py-2 text-sm font-semibold leading-tight text-slate-900 shadow-md shadow-orange-300/40 transition hover:translate-y-[-1px] md:text-base"
              >
                Rauhallinen tuki
              </button>
            </div>
          </div>

        {groupSize === 1 && (
          <div className="print-hide min-w-0 space-y-3 overflow-hidden rounded-2xl border border-cyan-100/15 bg-slate-900/50 p-3 md:p-4">
            <div className="print-controls flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-200">Yksilötila (1:1)</p>
              <span className="rounded-full border border-cyan-200/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-200">1:1</span>
            </div>
            <p className="text-xs text-slate-400">Skenaario: {scenario?.title ?? "Yksilötila"}</p>
            <div className="rounded-xl border border-cyan-100/20 bg-slate-950/50 p-3">
              <div className="max-h-44 space-y-2 overflow-y-auto pr-1 text-sm text-slate-200">
                {soloHistory.map((turn, idx) => (
                  <div
                    key={`${turn.role}-${idx}`}
                    className={`rounded-xl px-3 py-2 ${turn.role === "kid" ? "bg-slate-800/70 text-slate-100" : "bg-cyan-500/10 text-cyan-100"}`}
                  >
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">{turn.role === "kid" ? "Lapsi" : "Lumi"}</p>
                    <p className="break-words">{turn.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid min-w-0 gap-2">
              <button
                type="button"
                onClick={() => setShowManualInput((v) => !v)}
                className="w-full rounded-xl border border-cyan-100/20 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-100"
              >
                {showManualInput ? "Piilota tarkka syöte" : "Tarkka syöte (valinnainen)"}
              </button>
              {showManualInput ? (
                <div className="grid min-w-0 gap-2 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-300">Lapsi sanoo</label>
                    <input
                      value={soloChildMessage}
                      onChange={(e) => setSoloChildMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void handleSoloSend();
                      }}
                      className="mt-1 h-11 min-w-0 w-full rounded-xl border border-cyan-100/30 bg-slate-900/60 px-3 text-sm text-slate-100"
                      placeholder="Kirjoita lapsen vastaus"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => void handleSoloSend()}
                      disabled={soloBusy}
                      className="h-11 w-full max-w-full whitespace-normal break-words rounded-xl bg-emerald-600 px-3 text-xs font-semibold leading-tight text-white disabled:opacity-60 md:text-sm"
                    >
                      {soloBusy ? "Lumi miettii..." : "Lähetä"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="grid min-w-0 gap-2 md:grid-cols-3">
              <div className="rounded-xl border border-cyan-100/15 bg-slate-900/60 p-3">
                <p className="text-xs font-semibold text-slate-300">Tunne</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(soloButtons?.emotions ?? [
                    { id: "happy", label: "Iloinen" },
                    { id: "sad", label: "Surullinen" },
                    { id: "angry", label: "Vihainen" },
                    { id: "afraid", label: "Pelkään" },
                    { id: "frustrated", label: "Turhautunut" },
                    { id: "calm", label: "Rauhallinen" },
                  ]).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        void handleSoloSend(item.label, { emotion: item.id as DetectedEmotion });
                      }}
                      className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] text-slate-100"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-cyan-100/15 bg-slate-900/60 p-3 md:col-span-2">
                <p className="text-xs font-semibold text-slate-300">Tapahtui</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(soloButtons?.phrases ?? [
                    { label: "Hän löi minua", id: "hit" },
                    { label: "Hän heitti", id: "threw" },
                    { label: "Hän otti leluni", id: "took_toy" },
                    { label: "Hän sanoi ilkeästi", id: "mean_words" },
                    { label: "Minä sanoin ei", id: "said_no" },
                    { label: "Minua pelottaa", id: "afraid" },
                    { label: "Olen yksin", id: "alone" },
                    { label: "Haluan halauksen", id: "want_hug" },
                    { label: "Haluan tilaa", id: "want_space" },
                    { label: "Tarvitsen aikuisen", id: "need_adult" },
                  ]).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        void handleSoloSend(item.label, { topic: scenarioId });
                      }}
                      className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] text-slate-100"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Lapsen nimi: {soloChildName || "—"}</span>
              <span>Turvallinen aikuinen: {soloSafeAdultName || "—"}</span>
              <span>Tunne: {lastDetectedEmotion}</span>
              <span>Aihe: {lastDetectedTopic}</span>
              {soloSafetyAlert ? (
                <span className="rounded-full border border-red-300/60 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-200">
                  Turvailmoitus
                </span>
              ) : null}
            </div>
            <p className="break-words text-xs text-cyan-200/90">
              {customAssistantStatus || "Lumi kuuntelee ja vastaa henkilökohtaisesti."}
            </p>
          </div>
        )}

        {summary ? (
          <div className="print-summary print-hide min-w-0 space-y-3 overflow-hidden rounded-2xl border border-cyan-100/15 bg-slate-900/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-200">Opettajan yhteenveto</p>
              <button
                type="button"
                onClick={() => setSummaryOpen((v) => !v)}
                className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-100"
              >
                {summaryOpen ? "Piilota yhteenveto" : "Näytä yhteenveto"}
              </button>
            </div>
            {summaryOpen || isPrintingSummary ? (
              <div className="space-y-3">
                <div className="text-xs text-slate-300">
                  <div>Päivämäärä: {summary.header.dateISO}</div>
                  <div>Kesto: {summary.header.duration}</div>
                  <div>Skenaario: {summary.header.scenarioTitle}</div>
                  <div>Tila: {summary.header.appMode}</div>
                  <div>Ryhmäkoko: {summary.header.groupSize}</div>
                  <div>Osallistuneet lapset: {summary.participants.count} / {summary.participants.of}</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span>Lasten osallistuminen:</span>
                    {["low", "medium", "high"].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => {
                          setEngagement(lvl as any);
                          setSummary((prev) => (prev ? { ...prev, engagement: lvl as any } : prev));
                        }}
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          summary.engagement === lvl
                            ? "bg-emerald-300 text-slate-900"
                            : "bg-white/10 text-slate-100"
                        }`}
                      >
                        {lvl === "low" ? "Matala" : lvl === "medium" ? "Keskitaso" : "Korkea"}
                      </button>
                    ))}
                  </div>
                  {summary.header.childName ? <div>Lapsi: {summary.header.childName}</div> : null}
                  <div className="space-y-1 pt-2">
                    <p className="text-xs font-semibold text-slate-200">Tunteet ennen istuntoa</p>
                    <EmotionList counts={summary.emotion.before} />
                    <p className="text-xs font-semibold text-slate-200">Tunteet jälkeen</p>
                    <EmotionList counts={summary.emotion.after} />
                  </div>
                  <div className="pt-1">Yleisin tunne: {dominantEmotionText}</div>
                  <div>Rauhoittava tuki: {calmUsed ? "Käytettiin" : "Ei käytetty"}</div>
                  <div>Istunto valmis: {done ? "Kyllä" : "Kesken"}</div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Mitä tapahtui</p>
                  <p className="break-words text-sm text-slate-100">{summary.whatHappened}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Lumin toiminta</p>
                  <ul className="min-w-0 list-disc pl-5 text-sm text-slate-100">
                    {summary.whatLumiDid.map((item) => (
                      <li key={item} className="break-words">{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Harjoittelimme</p>
                  <ul className="min-w-0 list-disc pl-5 text-sm text-slate-100">
                    {summary.whatWePracticed.map((item) => (
                      <li key={item} className="break-words">{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Harjoiteltu taito</p>
                  <p className="text-sm text-slate-100">{skillHighlight}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Seuraavat askeleet</p>
                  <ul className="min-w-0 list-disc pl-5 text-sm text-slate-100">
                    {summary.nextSteps.map((item) => (
                      <li key={item} className="break-words">{item}</li>
                    ))}
                    {emotionTrend === "angry" ? <li className="break-words">Kokeile seuraavaksi rauhoittavaa tai vuorottelua tukevaa skenaariota.</li> : null}
                    {emotionTrend === "afraid" ? <li className="break-words">Kokeile turva- tai rohkaisuskenaariota.</li> : null}
                    {emotionTrend === "sad" ? <li className="break-words">Valitse lohduttava tai ystävyysteemainen skenaario.</li> : null}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Turvallisuus</p>
                  <p className="text-sm text-slate-100">{summary.safety.note}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Opettajan muistiinpanot</label>
                  <textarea
                    value={teacherNotes}
                    onChange={(e) => {
                      const value = e.target.value;
                      setTeacherNotes(value);
                      setSaveState("idle");
                      setSummary((prev) => (prev ? { ...prev, teacherNotes: value } : prev));
                    }}
                    className="mt-1 h-20 w-full rounded-lg border border-cyan-100/20 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
                    placeholder="Kirjoita omat muistiinpanot tähän"
                  />
                </div>
                <div className="print-controls flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void persistSummary(false)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold shadow transition ${
                      saveState === "saved"
                        ? "bg-emerald-300 text-slate-900 shadow-emerald-300/40"
                        : "bg-gradient-to-r from-sky-300 to-cyan-400 text-slate-900 shadow-cyan-300/40 hover:translate-y-[-1px]"
                    }`}
                  >
                    {saveState === "saved" ? "Tallennettu" : saveState === "saving" ? "Tallennetaan..." : "Tallenna raportti"}
                  </button>
                  {saveState === "error" ? (
                    <span className="text-xs text-rose-200">Tallennus epäonnistui. Yritä uudelleen.</span>
                  ) : null}
                  <button
                    type="button"
                    onClick={async () => {
                      if (!summary) return;
                      const text = formatTeacherSummaryText({ ...summary, teacherNotes });
                      await navigator.clipboard.writeText(text);
                    }}
                    className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-100"
                  >
                    Kopioi
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintSummary}
                    className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-100"
                  >
                    Tulosta
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!summary) return;
                      const exportObj = {
                        date: summary.header.dateISO,
                        duration: summary.header.duration,
                        scenario: summary.header.scenarioTitle,
                        scenario_id: summary.header.scenarioId,
                        group_size: summary.header.groupSize,
                        participants: summary.participants.count,
                        emotions_before: summary.emotion.before,
                        emotions_after: summary.emotion.after,
                        engagement: summary.engagement,
                        teacher_notes: teacherNotes,
                        safety: summary.safety.level,
                      };
                      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `lumi_summary_${summary.header.dateISO}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-100"
                  >
                    Lataa JSON
                  </button>
                </div>
                <div className="space-y-1 rounded-lg border border-cyan-100/20 bg-slate-950/50 p-3">
                  <p className="text-xs font-semibold text-slate-200">Luokkakeskustelun ideat</p>
                  <ul className="list-disc pl-5 text-xs text-slate-100">
                    {reflectionList.slice(0, 2).map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-slate-400">Lumi on varhaiskasvatuksen tunneopas: tukee tunnetaitoja, turvaa, empatiaa ja rauhoittumista.</p>
                </div>
                <p className="text-[11px] text-slate-400">
                  Ei henkilötietoja tallenneta. Kaikki havainnot kerätään vain ryhmätasolla. / No personal child data is stored. All observations are collected at group level only.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {summary ? (
          <div
            id="lumi-session-summary-print"
            ref={printSummaryRef}
            aria-hidden="true"
            className="hidden print:block print-only-summary"
          >
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-semibold">Lumi Classroom Session Report</h1>
                <p className="mt-1 text-sm">Social-Emotional Learning Micro Session</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Session information</p>
                <div className="mt-2 grid grid-cols-[160px_1fr] gap-x-6 gap-y-2 text-sm">
                  <div>Date</div>
                  <div>{summary.header.dateISO}</div>
                  <div>Duration</div>
                  <div>{summary.header.duration}</div>
                  <div>Scenario</div>
                  <div>{summary.header.scenarioTitle}</div>
                  <div>Group size</div>
                  <div>{summary.header.groupSize}</div>
                  <div>Participants</div>
                  <div>{summary.participants.count}</div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold">Emotional climate</p>
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr>
                      <th className="border border-slate-300 px-3 py-2 font-semibold">Emotion</th>
                      <th className="border border-slate-300 px-3 py-2 font-semibold">Before</th>
                      <th className="border border-slate-300 px-3 py-2 font-semibold">After</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 px-3 py-2">🙂 Cheerful</td>
                      <td className="border border-slate-300 px-3 py-2">{summary.emotion.before?.happy ?? 0}</td>
                      <td className="border border-slate-300 px-3 py-2">{summary.emotion.after?.happy ?? 0}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-3 py-2">😢 Sad</td>
                      <td className="border border-slate-300 px-3 py-2">{summary.emotion.before?.sad ?? 0}</td>
                      <td className="border border-slate-300 px-3 py-2">{summary.emotion.after?.sad ?? 0}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-3 py-2">😠 Angry</td>
                      <td className="border border-slate-300 px-3 py-2">{summary.emotion.before?.angry ?? 0}</td>
                      <td className="border border-slate-300 px-3 py-2">{summary.emotion.after?.angry ?? 0}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-3 py-2">😨 Fearful</td>
                      <td className="border border-slate-300 px-3 py-2">{summary.emotion.before?.afraid ?? 0}</td>
                      <td className="border border-slate-300 px-3 py-2">{summary.emotion.after?.afraid ?? 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <p className="text-sm font-semibold">Classroom emotional climate shift</p>
                <p className="mt-1 text-sm">
                  {(summary.emotion.after?.happy ?? 0) > (summary.emotion.before?.happy ?? 0) ||
                  ((summary.emotion.after?.sad ?? 0) + (summary.emotion.after?.angry ?? 0) + (summary.emotion.after?.afraid ?? 0)) <
                    ((summary.emotion.before?.sad ?? 0) + (summary.emotion.before?.angry ?? 0) + (summary.emotion.before?.afraid ?? 0))
                    ? "Positive shift observed"
                    : "Mixed emotional shift observed"}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold">Scenario impact</p>
                <p className="mt-1 text-sm">
                  {summary.engagement === "high" ? "High engagement" : summary.engagement === "medium" ? "Moderate engagement" : "Low engagement"}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold">Practiced skill</p>
                <p className="mt-1 text-sm">{skillHighlight}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Regulation practice</p>
                <p className="mt-1 text-sm">{summary.whatWePracticed[0] ?? "3 calm breaths"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Next steps</p>
                <p className="mt-1 text-sm">{summary.nextSteps[0] ?? "Reinforce safety routine"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Teacher usability</p>
                <p className="mt-1 text-sm">Easy</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Teacher notes</p>
                {teacherNotes.trim() ? (
                  <p className="mt-1 whitespace-pre-wrap text-sm">{teacherNotes.trim()}</p>
                ) : (
                  <div className="mt-2 space-y-3 text-sm">
                    <div className="border-b border-slate-400 pb-4" />
                    <div className="border-b border-slate-400 pb-4" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">Discussion questions</p>
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {reflectionList.slice(0, 2).map((item) => (
                    <li key={`print-reflection-${item}`} className="break-words">{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold">Lumi facilitation</p>
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {summary.whatLumiDid.map((item) => (
                    <li key={`print-lumi-${item}`} className="break-words">{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold">Privacy note</p>
                <p className="mt-1 text-sm">No personal child data is stored. All observations are collected only at classroom group level.</p>
              </div>
            </div>
          </div>
        ) : null}

        {sessionMode === "group_script" ? (
          <>
            <div className="min-w-0 overflow-hidden rounded-2xl border border-cyan-100/15 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Vaihe {Math.min(stepIndex + 1, activeScenario?.steps.length ?? 0)} / {activeScenario?.steps.length ?? 0}</p>
              <div className="mt-2 min-w-0 max-h-36 overflow-y-auto pr-1">
                <p className="break-words text-base leading-relaxed md:text-lg">{stepTextClean ?? "-"}</p>
                {step?.teacherHint ? (
                  <p className="mt-2 break-words text-xs text-cyan-200/80">{step.teacherHint}</p>
                ) : null}
                {currentSupportCards.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                    {currentSupportCards.map((card) => (
                      <div
                        key={card.id}
                        className="rounded-2xl border border-cyan-200/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(12,22,45,0.5))] p-3 text-center shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                      >
                        <div className="text-3xl" aria-hidden="true">
                          {card.icon}
                        </div>
                        <p className="mt-2 text-xs font-semibold text-slate-100">{card.title}</p>
                        <p className="mt-1 text-[11px] text-slate-300">{card.subtitle}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                {interactionCue ? (
                  <div className="mt-3 rounded-2xl border border-cyan-200/25 bg-[linear-gradient(180deg,rgba(126,231,255,0.16),rgba(12,22,45,0.45))] p-3 text-center shadow-[0_12px_28px_rgba(0,0,0,0.16)]">
                    <div className="text-3xl" aria-hidden="true">{interactionCue.icon}</div>
                    <p className="mt-2 text-sm font-semibold text-white">{interactionCue.title}</p>
                    <p className="mt-1 text-xs text-cyan-100">{interactionCue.subtitle}</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-2 md:grid-cols-3">
              <button
                onClick={() => void handlePrevStep()}
                disabled={stepIndex === 0 || awaitingChoice || sessionMode !== "group_script"}
                className="h-auto min-h-12 max-w-full whitespace-normal break-words rounded-2xl bg-white/8 px-3 py-3 text-sm font-semibold leading-tight text-white shadow-inner md:min-h-14 md:text-base disabled:opacity-50"
              >
                Edellinen
              </button>
              <button
                onClick={() => void handleNextStep()}
                disabled={done || isRunning}
                className="h-auto min-h-12 max-w-full whitespace-normal break-words rounded-2xl bg-gradient-to-r from-indigo-400 to-fuchsia-500 px-3 py-3 text-sm font-semibold leading-tight text-white shadow-lg shadow-fuchsia-500/30 transition hover:translate-y-[-1px] disabled:opacity-60 md:min-h-14 md:text-base"
              >
                Seuraava
              </button>
              <button
                onClick={() => void handleRepeatStep()}
                className="h-auto min-h-12 max-w-full whitespace-normal break-words rounded-2xl bg-gradient-to-r from-sky-300 to-cyan-400 px-3 py-3 text-sm font-semibold leading-tight text-slate-900 shadow-lg shadow-cyan-300/30 transition hover:translate-y-[-1px] md:min-h-14 md:text-base"
              >
                Toista
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="min-w-0 break-words text-sm font-semibold text-slate-100">
                    {sessionVoteStage === "after" ? "Entä nyt? Näytä tunne" : "Näytä tunne"}
                  </p>
                  <p className="text-xs text-slate-300">
                    {sessionVoteStage === "after" ? "Valitse kuva joka näyttää tunteesi nyt" : "Valitse kuva joka näyttää tunteesi"}
                  </p>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">Ääniä: {totalVotes}</span>
                  <button
                    type="button"
                    onClick={() => setVotingMode((v) => !v)}
                    className={`h-10 max-w-full whitespace-normal break-words rounded-xl px-3 text-xs font-semibold leading-tight shadow transition md:text-sm ${
                      votingMode ? "bg-gradient-to-r from-emerald-300 to-cyan-400 text-slate-900 shadow-emerald-300/30" : "bg-white/10 text-white border border-white/15"
                    }`}
                  >
                    {votingMode ? "Päällä" : "Pois"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVotes(emptyEmotionCounts());
                      setSelectedEmoji(null);
                    }}
                    className="h-10 max-w-full whitespace-normal break-words rounded-xl bg-white/10 px-3 text-xs font-semibold leading-tight text-white border border-white/15 md:text-sm"
                  >
                    Tyhjennä
                  </button>
                </div>
              </div>

              <div className={`grid min-w-0 ${canCollectVotes ? "grid-cols-3 md:grid-cols-5" : "grid-cols-5"} gap-2`}>
                {emojis.map((emoji) => {
                  const isSelected = selectedEmoji === emoji.id;
                  return (
                    <button
                      key={emoji.id}
                      className={`rounded-2xl border active:scale-95 transition shadow-sm ${
                      isSelected
                        ? "border-cyan-200/70 bg-[radial-gradient(circle_at_50%_38%,rgba(126,231,255,0.38),rgba(182,156,255,0.34)),linear-gradient(135deg,rgba(126,231,255,0.32),rgba(182,156,255,0.28))] text-slate-900 shadow-[0_12px_28px_rgba(126,231,255,0.28),0_0_0_1px_rgba(255,255,255,0.4)]"
                        : "border-white/14 bg-[radial-gradient(circle_at_50%_26%,rgba(255,255,255,0.08),rgba(255,255,255,0.02)),rgba(12,22,45,0.55)] text-white hover:border-cyan-200/35 hover:shadow-[0_10px_24px_rgba(126,231,255,0.14)]"
                    } ${canCollectVotes ? "h-[92px] text-4xl" : "h-14 text-2xl"} ${canCollectVotes ? "" : "opacity-60"}`}
                      aria-label={emoji.id}
                      type="button"
                    onClick={() => handleVote(emoji.id)}
                    disabled={!canCollectVotes}
                  >
                    <span className="flex flex-col items-center justify-center gap-1 text-base">
                      <span className={`${canCollectVotes ? "text-4xl" : "text-2xl"} ${isSelected ? "text-slate-900" : ""}`}>{emoji.label}</span>
                      <span className={`text-[10px] ${isSelected ? "text-slate-800" : "text-slate-200"}`}>{emoji.text}</span>
                    </span>
                    {canCollectVotes && (
                      <span
                        className={`ml-2 inline-block rounded-md px-2 py-0.5 text-xs align-middle ${
                          isSelected
                            ? "bg-white/80 text-slate-900 shadow-sm shadow-cyan-200/40"
                            : "bg-slate-900/65 text-slate-100"
                        }`}
                      >
                        {votes[emoji.id] ?? 0}
                      </span>
                    )}
                  </button>
                  );
                })}
              </div>
              {selectedEmoji && (
                <p className="break-words text-xs text-slate-400">
                  Viimeisin tunne: {emojis.find((e) => e.id === selectedEmoji)?.text}
                </p>
              )}
              <p className="break-words text-xs text-cyan-200/90">{voteEffect}</p>
            </div>
          </>
        ) : null}

        {runError && (
          <div className="rounded-2xl border border-red-300/60 bg-red-500/10 p-3 text-sm text-red-200 break-words">
            {runError}
          </div>
        )}

        {sessionMode === "group_script" && awaitingChoice && step?.options && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-200">Valitse seuraava vaihe</p>
            {step.options.map((opt) => (
              <button
                key={`${opt.label}-${opt.next}`}
                onClick={() => handleOptionClick(opt.next)}
                className="h-auto min-h-14 w-full max-w-full whitespace-normal break-words rounded-2xl bg-sky-600 px-4 py-3 text-base font-semibold leading-snug text-white active:scale-[0.98] md:text-lg"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {sessionMode === "group_script" && done && (
          <div className="rounded-2xl border border-emerald-300/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 break-words">
            <p>Istunto valmis. Voit aloittaa uuden istunnon.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleStartSession()}
                className="rounded-xl bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
              >
                Aloita uusi
              </button>
              <button
                type="button"
                onClick={() => setSummaryOpen(true)}
                className="rounded-xl bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100"
              >
                Näytä yhteenveto
              </button>
            </div>
          </div>
        )}
        </div>
      </section>
      <style jsx global>{`
        @keyframes breathPulse {
          0% {
            transform: scale(0.98);
            box-shadow: 0 0 0 0 rgba(134, 239, 255, 0.35);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 0 0 22px rgba(134, 239, 255, 0.02);
          }
          100% {
            transform: scale(0.98);
            box-shadow: 0 0 0 0 rgba(134, 239, 255, 0.35);
          }
        }
      `}</style>
    </div>
  );
}
