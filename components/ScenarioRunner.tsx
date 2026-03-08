"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LumiAvatar } from "./LumiAvatar";
import { cancelLumiSpeak, lumiSpeak, type SpeakMode } from "../lib/lumi/speak";
import { lumiSpeak as lumiSpeakFinnish } from "../lib/lumi/speakFinnish";
import { mouthStateFromRms } from "../lib/lumi/lipSync";
import { unlockAudio } from "../lib/lumi/audioUnlock";
import { buildTeacherSummaryFi, formatTeacherSummaryText, type SessionLog, type TeacherSummaryFi } from "../lib/lumi/teacherSummary";
import { scenarios, type ScenarioStep } from "../data/scenarios";
import type { GlowState, MouthState } from "../lib/lumi/types";
import { modeToGlowState } from "../lib/lumi/glowState";
import { askKidQuestion, type ConversationTurn } from "../lib/lumi/kidAssistant";

const emojis = [
  { id: "happy", label: "🙂", text: "Iloinen" },
  { id: "sad", label: "😢", text: "Surullinen" },
  { id: "angry", label: "😠", text: "Vihainen" },
  { id: "scared", label: "😨", text: "Pelokas" },
  { id: "confused", label: "😳", text: "Nolo / Hämmentynyt" },
];

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
type SoloStage = "ask_name" | "ask_safe_adult" | "ready";
type DetectedEmotion =
  | "happy"
  | "sad"
  | "angry"
  | "scared"
  | "ashamed"
  | "jealous"
  | "frustrated"
  | "confused"
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
  dominant: "happy" | "sad" | "angry" | "scared" | "confused";
  responseText: string;
  responseMode: SpeakMode;
  calmSupport: boolean;
  repeatStep: boolean;
  jumpMode: SpeakMode | null;
  message: string;
};

function isBreathingStep(step: ScenarioStep | undefined): boolean {
  if (!step) return false;
  if (step.mode !== "regulation") return false;
  return /(hengitä|hengitys|kolme hengitystä|sisään|ulos)/i.test(step.text);
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
  const scared = (votes.scared ?? 0) / total;
  const distress = sad + scared;

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

  if (/(pelk|pelottaa|scared|jännittää)/i.test(q)) {
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

function decideVoteAction(votes: Record<string, number>): VoteAction | null {
  const total = Object.values(votes).reduce((sum, n) => sum + n, 0);
  if (total < 2) return null;

  const counts = {
    happy: votes.happy ?? 0,
    sad: votes.sad ?? 0,
    angry: votes.angry ?? 0,
    scared: votes.scared ?? 0,
    confused: votes.confused ?? 0,
  };

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  const second = sorted[1];
  const tie = top && second && top[1] === second[1];
  const dominant = tie ? "confused" : ((top?.[0] as VoteAction["dominant"]) ?? "confused");

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
      responseText: "Kuulen surua. Olen tässä. Hengitetään yhdessä.",
      responseMode: "regulation",
      calmSupport: true,
      repeatStep: false,
      jumpMode: "regulation",
      message: "Surua huomattu, rauhoitutaan.",
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

  if (dominant === "scared") {
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

  if (dominant === "confused") {
    return {
      dominant: "confused",
      responseText: "Jos on noloa tai outoa, yritetään rauhassa uudestaan.",
      responseMode: "warm",
      calmSupport: true,
      repeatStep: true,
      jumpMode: null,
      message: "Hämmennys huomattu, hidastetaan.",
    };
  }

  return {
    dominant: "confused",
    responseText: "Tämä on hämmentävää. Sanon sen vielä lyhyesti.",
    responseMode: "listening",
    calmSupport: false,
    repeatStep: true,
    jumpMode: null,
    message: "Hämmennys huomattu, selkeytetään.",
  };
}

export function ScenarioRunner() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("turvataidot");
  const [scenarioMode, setScenarioMode] = useState<ScenarioMode>("random");
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
  const [teacherNotes, setTeacherNotes] = useState("");

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
  const [mouthState, setMouthState] = useState<MouthState>(0);
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
      setMouthState(0);
    }
  }, [isSpeaking]);

  useEffect(() => {
    if (animationSource !== "breath") {
      setForceBlink(false);
      return;
    }
    setMouthState(breathInhale ? 1 : 4);
    setForceBlink(true);
    const timer = window.setTimeout(() => setForceBlink(false), 140);
    return () => window.clearTimeout(timer);
  }, [animationSource, breathInhale]);

  const [votingMode, setVotingMode] = useState(true);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [emotionHistory, setEmotionHistory] = useState<string[]>([]);
  const [emotionTrend, setEmotionTrend] = useState<"happy" | "sad" | "angry" | "scared" | "confused" | null>(null);
  const [calmUsed, setCalmUsed] = useState(false);
  const [lastVoteAppliedStep, setLastVoteAppliedStep] = useState(-1);
  const [voteEffect, setVoteEffect] = useState("Odotetaan tunteita.");
  const [runError, setRunError] = useState<string | null>(null);

  const sessionMode: SessionMode = groupSize === 1 ? "solo_personalized" : "group_script";
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
    return created;
  }, [sessionMode, groupSize, scenarioId, scenario?.title, soloChildName, soloSafeAdultName]);

  const endSession = useCallback(() => {
    if (!sessionLog) return;
    const endedAt = new Date().toISOString();
    const durationSeconds = Math.max(0, Math.round((new Date(endedAt).getTime() - new Date(sessionLog.startedAt).getTime()) / 1000));
    const finalized = { ...sessionLog, endedAt, durationSeconds };
    const nextSummary = buildTeacherSummaryFi(finalized);
    setSessionLog(finalized);
    setSummary(nextSummary);
    setTeacherNotes(nextSummary.teacherNotes);
    setSummaryOpen(true);
  }, [sessionLog]);

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
  const awarenessGlowState = useMemo(
    () => decideAwarenessGlowState(step?.mode, votes, votingMode, theme),
    [step?.mode, votes, votingMode, theme]
  );
  const avatarMouthState: MouthState =
    animationSource === "breath" ? (breathInhale ? 1 : 4) : mouthState;

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
    setMouthState(0);
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
      setMouthState(0);
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
    setMouthState(0);
    setAudioIntensity(0);
  }, [voiceEnabled]);


  const startBreathingPractice = useCallback((durationMs = 7000) => {
    stopBreathingPractice();
    setAnimationSource("breath");
    setShowBreathCue(true);
    setBreathInhale(true);
    setForceBlink(true);
    const phaseDuration = 2000;
    const phaseStarted = performance.now();
    const animateGlow = (now: number) => {
      const elapsed = (now - phaseStarted) % (phaseDuration * 2);
      const progress = elapsed < phaseDuration ? elapsed / phaseDuration : (elapsed - phaseDuration) / phaseDuration;
      const inhale = elapsed < phaseDuration;
      setBreathInhale(inhale);
      setForceBlink(inhale);
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
      const glow =
        action.dominant === "angry" ? "strong" : action.dominant === "confused" ? "alert" : "calm";
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

  const playCurrentStep = useCallback(
    async (index: number) => {
      if (isPlayingStepRef.current) return;
      isPlayingStepRef.current = true;
      try {
        const current = activeScenario?.steps[index];
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
        emotionTrend: emotionTrend ?? undefined,
      });
      setSessionLog({ ...log });
      const breathingMode = isBreathingStep(current);
      let breathPhaseTimer: number | null = null;
      let breathRaf: number | null = null;
      const runGuidedBreathing = async () => {
        const cycles = 2;
        for (let i = 0; i < cycles; i += 1) {
          setBreathInhale(true);
          setForceBlink(true);
          setBreathGlow(0.12);
          await speakLine("Hengitä sisään", "warm");
          await new Promise((resolve) => window.setTimeout(resolve, 500));
          setBreathInhale(false);
          setForceBlink(false);
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
        setForceBlink(true);
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
          setForceBlink(inhale);
          const pulse = inhale ? progress : (1 - progress);
          setBreathGlow(0.04 + pulse * 0.08);
          breathRaf = requestAnimationFrame(animateGlow);
        };
        breathRaf = requestAnimationFrame(animateGlow);
        breathPhaseTimer = window.setInterval(() => {
          setBreathInhale((prev) => {
            const next = !prev;
            setForceBlink(next);
            return next;
          });
        }, phaseDuration);
      } else {
        setAnimationSource("audio");
        setShowBreathCue(false);
        setBreathGlow(0);
        setForceBlink(false);
      }

      await speakLine(current.text, current.mode as SpeakMode);
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
        setForceBlink(false);
      }

      const pauseMs = current.pauseMs ?? 500;
      await new Promise((resolve) => window.setTimeout(resolve, pauseMs));

      if (current.options && current.options.length > 0) {
        setIsRunning(false);
        setAwaitingChoice(true);
        return;
      }

      if (votingMode && lastVoteAppliedStep !== index) {
        const action = decideVoteAction(votes);
        if (action) {
          setLastVoteAppliedStep(index);
          await performVoteResponse(action, current.text);

          if (action.jumpMode) {
            const jumpTo = findNextStepByMode(activeScenario.steps, index + 1, action.jumpMode);
            if (jumpTo >= 0) {
              setVotes({});
              setSelectedEmoji(null);
              setStepIndex(jumpTo);
              return;
            }
          }

          setVotes({});
          setSelectedEmoji(null);
        }
      }

      if (index >= activeScenario.steps.length - 1) {
        setIsRunning(false);
        setDone(true);
        endSession();
        return;
      }

      if (
        teacherMode &&
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
        setIsRunning(false);
        setStepIndex((prev) => prev + 1);
        return;
      }

        setStepIndex((prev) => prev + 1);
      } finally {
        isPlayingStepRef.current = false;
      }
    },
    [activeScenario, votingMode, lastVoteAppliedStep, votes, sessionMode, ensureSessionLog, endSession, performVoteResponse, speakLine, teacherMode, awaitingChoice, glowPinned]
  );

  useEffect(() => {
    if (sessionMode !== "group_script") return;
    if (!isRunning || awaitingChoice || done) return;
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
    setScenarioId(chosenScenario.id);
    setStepIndex(0);
    setElapsedSec(0);
    setDone(false);
    setAwaitingChoice(false);
    setLastVoteAppliedStep(-1);
    setVoteEffect("Odotetaan tunteita.");
    setIsRunning(true);
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

  const handleStop = useCallback(async () => {
    await cancelLumiSpeak();
    setIsRunning(false);
    setAwaitingChoice(false);
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
  }, [sessionMode, resetAvatarState, ensureSessionLog, endSession]);

  const handleRestart = useCallback(async () => {
    await cancelLumiSpeak();
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
    setAwaitingChoice(false);
    setCustomScenario(groupSize === 1 ? customScenario : null);
    setConversationHistory([]);
    setCustomAssistantStatus("");
    setLastVoteAppliedStep(-1);
    setVoteEffect("Odotetaan tunteita.");
    setAwaitingTeacherContinue(false);
    teacherPendingStepRef.current = null;
    setIsRunning(true);
    setRunError(null);
    resetAvatarState();
  }, [resetAvatarState, groupSize, customScenario, sessionMode, ensureSessionLog]);

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

  const handleNextStep = useCallback(async () => {
    if (sessionMode !== "group_script") return;
    if (awaitingChoice || done) return;
    if (awaitingTeacherContinue && teacherPendingStepRef.current != null) {
      setAwaitingTeacherContinue(false);
      setAwaitingDiscussionNote(false);
      const next = teacherPendingStepRef.current;
      teacherPendingStepRef.current = null;
      setStepIndex(next);
    }
    await unlockAudio();
    setIsRunning(true);
    const log = ensureSessionLog();
    log.teacherActions.push({ type: "next", at: new Date().toISOString() });
    setSessionLog({ ...log });
  }, [sessionMode, awaitingChoice, done, awaitingTeacherContinue, ensureSessionLog]);

  const handleReplayScenario = useCallback(async () => {
    await cancelLumiSpeak();
    setRunError(null);
    setDone(false);
    setAwaitingChoice(false);
    setAwaitingTeacherContinue(false);
    setAwaitingDiscussionNote(false);
    teacherPendingStepRef.current = null;
    setLastVoteAppliedStep(-1);
    setVotes({});
    setSelectedEmoji(null);
    setStepIndex(0);
    setElapsedSec(0);
    setIsRunning(true);
  }, []);

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
    setAwaitingChoice(false);
    setDone(false);
    setAwaitingTeacherContinue(false);
    setAwaitingDiscussionNote(false);
    teacherPendingStepRef.current = null;
    setIsRunning(false);
    setStepIndex((prev) => Math.max(0, prev - 1));
  }, [sessionMode]);

  const handleOptionClick = async (next: number) => {
    await unlockAudio();
    setAwaitingChoice(false);
    setIsRunning(true);
    setStepIndex(next);
  };

  const handleVote = async (emojiId: string) => {
    if (!votingMode) return;
    setSelectedEmoji(emojiId);
    setVotes((prev) => ({ ...prev, [emojiId]: (prev[emojiId] ?? 0) + 1 }));
    setEmotionHistory((prev) => {
      const next = [...prev.slice(-9), emojiId];
      const freq = next.reduce<Record<string, number>>((acc, id) => ({ ...acc, [id]: (acc[id] ?? 0) + 1 }), {});
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
      const top = sorted[0];
      const second = sorted[1];
      const tie = top && second && top[1] === second[1];
      setEmotionTrend(tie ? "confused" : ((top?.[0] as any) ?? null));
      return next;
    });
    const log = ensureSessionLog();
    const totalVotes = Object.values(votes).reduce((sum, n) => sum + n, 0) + 1;
    log.votingEvents.push({ at: new Date().toISOString(), emoji: emojiId, countDelta: 1, totalVotes });
    setSessionLog({ ...log });
    const label = emojis.find((e) => e.id === emojiId)?.text ?? "Tunne";
    const supportive: Record<string, string> = {
      happy: "Iloista energiaa, hienoa!",
      sad: "Näen surua, olen tässä.",
      angry: "Huomaan kiukkua, hengitetään hitaasti.",
      scared: "On ok pelätä, olet turvassa.",
      confused: "Jos on noloa, kokeillaan yhdessä.",
    };
    const line = supportive[emojiId] ?? `Ääni: ${label}`;
    if (!glowPinned) {
      const glowMap: Record<string, GlowState> = { angry: "strong", scared: "alert", sad: "calm", happy: "calm", confused: "alert" };
      setGlowState(glowMap[emojiId] ?? "alert");
    }
    setVoteEffect(line);
    if (voiceEnabled) {
      const mode = emojiId === "angry" ? "firm_calm" : emojiId === "scared" ? "regulation" : "warm";
      await speakLine(line, mode);
      if (emojiId === "angry" || emojiId === "scared") {
        await speakLine("Hengitä sisään… ja ulos.", "regulation");
        setCalmUsed(true);
      }
    }
  };

  const totalVotes = Object.values(votes).reduce((sum, n) => sum + n, 0);
  const elapsedLabel = `${String(Math.floor(elapsedSec / 60)).padStart(2, "0")}:${String(elapsedSec % 60).padStart(2, "0")}`;
  const dominantEmotionText = emotionTrend ? (emojis.find((e) => e.id === emotionTrend)?.text ?? "—") : "—";
  const skillHighlight = scenarioSkill[scenarioId] ?? "Tunnetaitojen harjoittelu";
  const reflectionList = reflectionPrompts[scenarioId] ?? ["Mikä auttoi Lumi-ystävää?", "Mitä teemme, kun tunne on iso?"];

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
            setMouthState(0);
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
    <div className="mx-auto grid h-full min-h-0 w-full max-w-6xl gap-6 text-slate-100 lg:grid-cols-[1.4fr_1fr]">
      <section className="flex min-h-0 flex-col items-center justify-center overflow-hidden rounded-3xl border border-cyan-200/20 bg-white/[0.04] p-4 backdrop-blur-sm md:min-h-[66vh] md:p-8">
        <div className="aspect-square w-full max-w-[460px] md:max-w-[520px]">
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
          />
        </div>
        <div className="mt-4 min-w-0 overflow-hidden text-center">
          <p className="break-words text-sm font-semibold text-slate-50 [overflow-wrap:anywhere]">{activeScenario?.title ?? "-"} • {stepIndex + 1}/{activeScenario?.steps.length ?? 0}</p>
          {showBreathCue ? (
            <p className="mt-1 text-xs font-medium text-cyan-100">Hengitetään yhdessä</p>
          ) : null}
        </div>
      </section>

      <section className="flex min-h-0 min-w-0 flex-col gap-4 overflow-hidden rounded-3xl border border-cyan-200/20 bg-white/[0.04] p-4 backdrop-blur-sm md:min-h-[66vh] md:p-6">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-2xl border border-cyan-100/20 bg-slate-900/40 px-3 py-3 md:px-4">
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-slate-100 [overflow-wrap:anywhere]">Opettajan ohjaus</p>
                <p className="break-words text-xs text-slate-400 [overflow-wrap:anywhere]">Aika: {elapsedLabel}</p>
              </div>
        </div>

        <div className="min-h-0 min-w-0 space-y-4 overflow-y-auto pr-1">
          <div className="grid min-w-0 gap-3 overflow-hidden rounded-2xl border border-cyan-100/15 bg-slate-900/50 p-3 md:grid-cols-2 md:p-4">
            <div className="min-w-0 space-y-3 md:col-span-2">
              <p className="text-sm font-medium text-slate-200">Istunto</p>
              <div className="grid min-w-0 grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => void handleStartSession()}
                  disabled={isRunning || sessionMode !== "group_script"}
                  className="h-11 max-w-full rounded-xl bg-cyan-600 px-2 text-xs font-semibold leading-tight text-white disabled:opacity-60 md:text-sm"
                >
                  Aloita
                </button>
                <button
                  type="button"
                  onClick={() => void handleStop()}
                  disabled={sessionMode !== "group_script"}
                  className="h-11 max-w-full rounded-xl bg-slate-800 px-2 text-xs font-semibold leading-tight text-slate-100 disabled:opacity-60 md:text-sm"
                >
                  Lopeta
                </button>
                <button
                  type="button"
                  onClick={() => void handleRestart()}
                  disabled={sessionMode !== "group_script"}
                  className="h-11 max-w-full rounded-xl bg-slate-800 px-2 text-xs font-semibold leading-tight text-slate-100 disabled:opacity-60 md:text-sm"
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
              <p className="text-sm font-medium text-slate-200">Teema</p>
              <div className="grid min-w-0 grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("turvataidot")}
                  className={`h-11 max-w-full whitespace-normal break-words [overflow-wrap:anywhere] leading-tight rounded-xl border px-2 text-xs md:text-sm ${theme === "turvataidot" ? "border-cyan-300 bg-cyan-500/15" : "border-cyan-100/30 bg-slate-900/50"}`}
                >
                  Turvataidot
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("toveritaidot")}
                  className={`h-11 max-w-full whitespace-normal break-words [overflow-wrap:anywhere] leading-tight rounded-xl border px-2 text-xs md:text-sm ${theme === "toveritaidot" ? "border-cyan-300 bg-cyan-500/15" : "border-cyan-100/30 bg-slate-900/50"}`}
                >
                  Toveritaidot
                </button>
              </div>
            </div>

            <div className="min-w-0 space-y-3">
              <p className="text-sm font-medium text-slate-200">Skenaario</p>
              <div className="grid min-w-0 grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScenarioMode("random")}
                  className={`h-auto min-h-11 max-w-full whitespace-normal break-words rounded-xl border px-2 py-2 text-[11px] leading-tight [overflow-wrap:anywhere] md:text-sm ${scenarioMode === "random" ? "border-cyan-300 bg-cyan-500/15" : "border-cyan-100/30 bg-slate-900/50"}`}
                >
                  Satunnainen
                </button>
                <button
                  type="button"
                  onClick={() => setScenarioMode("manual")}
                  className={`h-auto min-h-11 max-w-full whitespace-normal break-words rounded-xl border px-2 py-2 text-[11px] leading-tight [overflow-wrap:anywhere] md:text-sm ${scenarioMode === "manual" ? "border-cyan-300 bg-cyan-500/15" : "border-cyan-100/30 bg-slate-900/50"}`}
                >
                  Manuaalinen
                </button>
              </div>
              <select
                value={scenarioId}
                onChange={(e) => void switchScenario(e.target.value)}
                disabled={scenarioMode === "random" || groupSize === 1}
                className="h-11 min-w-0 w-full max-w-full rounded-xl border border-cyan-100/30 bg-slate-900/60 px-3 text-sm text-slate-100 disabled:opacity-60"
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
                className={`h-11 w-full max-w-full whitespace-normal break-words [overflow-wrap:anywhere] rounded-xl px-2 text-xs font-semibold leading-tight md:text-sm ${voiceEnabled ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-100"}`}
              >
                {voiceEnabled ? "Ääni päällä" : "Ääni pois"}
              </button>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-2 self-end">
              <button
                type="button"
                onClick={() => void handleRepeatStep()}
                className="h-auto min-h-11 max-w-full whitespace-normal break-words [overflow-wrap:anywhere] rounded-xl bg-slate-800 px-2 py-2 text-xs font-semibold leading-tight text-white md:text-sm"
              >
                Toista vaihe
              </button>
              <button
                type="button"
                onClick={() => void handleCalmSupportLogged()}
                className="h-auto min-h-11 max-w-full whitespace-normal break-words [overflow-wrap:anywhere] rounded-xl bg-amber-600 px-2 py-2 text-xs font-semibold leading-tight text-white md:text-sm"
              >
                Rauhallinen tuki
              </button>
            </div>
          </div>
        )}

        {groupSize === 1 && (
          <div className="min-w-0 space-y-3 overflow-hidden rounded-2xl border border-cyan-100/15 bg-slate-900/50 p-3 md:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
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
                    <p className="break-words [overflow-wrap:anywhere]">{turn.text}</p>
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
                      className="h-11 w-full max-w-full whitespace-normal break-words [overflow-wrap:anywhere] rounded-xl bg-emerald-600 px-3 text-xs font-semibold leading-tight text-white disabled:opacity-60 md:text-sm"
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
                    { id: "scared", label: "Pelkään" },
                    { id: "confused", label: "Hämmentynyt" },
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
                    { label: "Minua pelottaa", id: "scared" },
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
            <p className="break-words text-xs text-cyan-200/90 [overflow-wrap:anywhere]">
              {customAssistantStatus || "Lumi kuuntelee ja vastaa henkilökohtaisesti."}
            </p>
          </div>
        )}

        {summary ? (
          <div className="print-summary min-w-0 space-y-3 overflow-hidden rounded-2xl border border-cyan-100/15 bg-slate-900/60 p-4">
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
            {summaryOpen ? (
              <div className="space-y-3">
                <div className="text-xs text-slate-300">
                  <div>Päivämäärä: {summary.header.dateISO}</div>
                  <div>Kesto: {summary.header.duration}</div>
                  <div>Skenaario: {summary.header.scenarioTitle}</div>
                  <div>Tila: {summary.header.appMode}</div>
                  <div>Ryhmäkoko: {summary.header.groupSize}</div>
                  {summary.header.childName ? <div>Lapsi: {summary.header.childName}</div> : null}
                  <div>Ääniä: {totalVotes}</div>
                  <div>Yleisin tunne: {dominantEmotionText}</div>
                  <div>Rauhoittava tuki: {calmUsed ? "Käytettiin" : "Ei käytetty"}</div>
                  <div>Istunto valmis: {done ? "Kyllä" : "Kesken"}</div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Mitä tapahtui</p>
                  <p className="break-words text-sm text-slate-100 [overflow-wrap:anywhere]">{summary.whatHappened}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Lumin toiminta</p>
                  <ul className="min-w-0 list-disc pl-5 text-sm text-slate-100">
                    {summary.whatLumiDid.map((item) => (
                      <li key={item} className="break-words [overflow-wrap:anywhere]">{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Harjoittelimme</p>
                  <ul className="min-w-0 list-disc pl-5 text-sm text-slate-100">
                    {summary.whatWePracticed.map((item) => (
                      <li key={item} className="break-words [overflow-wrap:anywhere]">{item}</li>
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
                      <li key={item} className="break-words [overflow-wrap:anywhere]">{item}</li>
                    ))}
                    {emotionTrend === "angry" ? <li className="break-words [overflow-wrap:anywhere]">Kokeile seuraavaksi rauhoittavaa tai vuorottelua tukevaa skenaariota.</li> : null}
                    {emotionTrend === "scared" ? <li className="break-words [overflow-wrap:anywhere]">Kokeile turva- tai rohkaisuskenaariota.</li> : null}
                    {emotionTrend === "sad" ? <li className="break-words [overflow-wrap:anywhere]">Valitse lohduttava tai ystävyysteemainen skenaario.</li> : null}
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
                      setSummary((prev) => (prev ? { ...prev, teacherNotes: value } : prev));
                    }}
                    className="mt-1 h-20 w-full rounded-lg border border-cyan-100/20 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
                    placeholder="Kirjoita omat muistiinpanot tähän"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
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
                    onClick={() => window.print()}
                    className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-100"
                  >
                    Tulosta
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!summary) return;
                      const blob = new Blob([JSON.stringify({ ...summary, teacherNotes }, null, 2)], { type: "application/json" });
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
              </div>
            ) : null}
          </div>
        ) : null}

        {sessionMode === "group_script" ? (
          <>
            <div className="min-w-0 overflow-hidden rounded-2xl border border-cyan-100/15 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Vaihe {Math.min(stepIndex + 1, activeScenario?.steps.length ?? 0)} / {activeScenario?.steps.length ?? 0}</p>
              <div className="mt-2 min-w-0 max-h-36 overflow-y-auto pr-1">
                <p className="break-words text-base leading-relaxed [overflow-wrap:anywhere] md:text-lg">{step?.text ?? "-"}</p>
                {step?.teacherHint ? (
                  <p className="mt-2 break-words text-xs text-cyan-200/80 [overflow-wrap:anywhere]">{step.teacherHint}</p>
                ) : null}
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-2 md:grid-cols-3">
              <button
                onClick={() => void handlePrevStep()}
                disabled={stepIndex === 0 || awaitingChoice || isRunning === false || sessionMode !== "group_script"}
                className="h-auto min-h-12 max-w-full whitespace-normal break-words [overflow-wrap:anywhere] rounded-2xl bg-slate-800 px-3 py-3 text-sm font-semibold leading-tight text-white md:min-h-14 md:text-base"
              >
                Edellinen
              </button>
              <button
                onClick={() => void handleNextStep()}
                disabled={isRunning || done}
                className="h-auto min-h-12 max-w-full whitespace-normal break-words [overflow-wrap:anywhere] rounded-2xl px-3 py-3 text-sm font-semibold leading-tight text-white disabled:opacity-60 md:min-h-14 md:text-base bg-indigo-600"
              >
                Seuraava
              </button>
              <button
                onClick={() => void handleRepeatStep()}
                className="h-auto min-h-12 max-w-full whitespace-normal break-words [overflow-wrap:anywhere] rounded-2xl bg-slate-800 px-3 py-3 text-sm font-semibold leading-tight text-white md:min-h-14 md:text-base"
              >
                Toista
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="min-w-0 break-words text-sm font-semibold text-slate-100 [overflow-wrap:anywhere]">Valitse tunne</p>
                  <p className="text-xs text-slate-300">Lapset valitsevat miltä tuntuu</p>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">Ääniä: {totalVotes}</span>
                  <button
                    type="button"
                    onClick={() => setVotingMode((v) => !v)}
                    className={`h-10 max-w-full whitespace-normal break-words [overflow-wrap:anywhere] rounded-xl px-3 text-xs font-semibold leading-tight md:text-sm ${
                      votingMode ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-100"
                    }`}
                  >
                    {votingMode ? "Päällä" : "Pois"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVotes({});
                      setSelectedEmoji(null);
                    }}
                    className="h-10 max-w-full whitespace-normal break-words [overflow-wrap:anywhere] rounded-xl bg-slate-800 px-3 text-xs font-semibold leading-tight text-slate-100 md:text-sm"
                  >
                    Tyhjennä
                  </button>
                </div>
              </div>

              <div className={`grid min-w-0 ${votingMode ? "grid-cols-3 md:grid-cols-5" : "grid-cols-5"} gap-2`}>
                {emojis.map((emoji) => (
                  <button
                    key={emoji.id}
                    className={`rounded-2xl border active:scale-95 ${
                      selectedEmoji === emoji.id
                        ? "border-cyan-300 bg-cyan-500/20"
                        : "border-cyan-100/30 bg-slate-900/50"
                    } ${votingMode ? "h-20 text-4xl" : "h-14 text-2xl"} ${votingMode ? "" : "opacity-50"}`}
                    aria-label={emoji.id}
                    type="button"
                    onClick={() => handleVote(emoji.id)}
                    disabled={!votingMode}
                  >
                    <span className="flex flex-col items-center justify-center gap-1 text-base">
                      <span className={votingMode ? "text-4xl" : "text-2xl"}>{emoji.label}</span>
                      <span className="text-[10px] text-slate-200">{emoji.text}</span>
                    </span>
                    {votingMode && (
                      <span className="ml-2 inline-block rounded-md bg-slate-900/60 px-2 py-0.5 text-xs align-middle">
                        {votes[emoji.id] ?? 0}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {selectedEmoji && (
                <p className="break-words text-xs text-slate-400 [overflow-wrap:anywhere]">
                  Viimeisin tunne: {emojis.find((e) => e.id === selectedEmoji)?.text}
                </p>
              )}
              <p className="break-words text-xs text-cyan-200/90 [overflow-wrap:anywhere]">{voteEffect}</p>
            </div>
          </>
        ) : null}

        {runError && (
          <div className="rounded-2xl border border-red-300/60 bg-red-500/10 p-3 text-sm text-red-200 break-words [overflow-wrap:anywhere]">
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
                className="h-auto min-h-14 w-full max-w-full whitespace-normal break-words [overflow-wrap:anywhere] rounded-2xl bg-sky-600 px-4 py-3 text-base font-semibold leading-snug text-white active:scale-[0.98] md:text-lg"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {sessionMode === "group_script" && done && (
          <div className="rounded-2xl border border-emerald-300/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 break-words [overflow-wrap:anywhere]">
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
                onClick={() => void handleReplayScenario()}
                className="rounded-xl bg-cyan-600 px-3 py-1 text-xs font-semibold text-white"
              >
                Toista alusta
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
    </div>
  );
}
