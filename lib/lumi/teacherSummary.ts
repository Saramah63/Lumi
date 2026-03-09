export type TeacherActionType = "next" | "prev" | "repeat" | "calm_support" | "firm_boundary" | "reset" | "start";

export type SessionLog = {
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  locale: "fi";
  appMode: "group" | "solo";
  groupSize: number;
  scenarioId: string;
  scenarioTitle: string;
  stepsPlayed: Array<{ stepIndex: number; mode: string; text: string; startedAt: string }>;
  teacherActions: Array<{ type: TeacherActionType; at: string }>;
  votingEvents: Array<{ at: string; emoji: string; countDelta: number; totalVotes: number }>;
  microPractices: Array<{ type: "breathing" | "pause" | "repair_phrase" | "body_check"; at: string }>;
  safetyEvents: Array<{ level: "ok" | "escalate"; reason: string; at: string }>;
  soloContext?: { childName: string; safeAdultName: string };
  soloTurns?: Array<{ role: "child" | "lumi"; text: string; emotionGuess?: string; at: string }>;
};

export type TeacherSummaryFi = {
  header: { dateISO: string; duration: string; scenarioTitle: string; appMode: "group" | "solo"; groupSize: number; childName?: string };
  emotion: { start?: string; end?: string; votesTop?: string[] };
  whatHappened: string;
  whatLumiDid: string[];
  whatWePracticed: string[];
  nextSteps: string[];
  safety: { level: "ok" | "attention"; note: string };
  teacherNotes: string;
};

const PRACTICE_MAP: Record<string, string> = {
  breathing: "3 rauhallista hengitystä (sisään–ulos).",
  pause: "Taikatauko (3 hengitystä).",
  repair_phrase: "Korjauslause: 'Anteeksi. Yritetään uudelleen.'",
  body_check: "Keho-signaali: kädet tiukat/pehmeät, sydän nopea/hidas.",
};

const NEXT_STEPS: Record<string, string> = {
  hitting: "Harjoitelkaa 'Stop + kädet alas + hae aikuinen' -rutiini.",
  throwing: "Harjoitelkaa turvallinen käsien käyttö ja avun pyytäminen.",
  ruining_game: "Harjoitelkaa korjauslause ja yhdessä rakentaminen.",
  mean_words: "Harjoitelkaa 'ystävälliset sanat' ja 'minä-viesti'.",
  not_stopping: "Harjoitelkaa 'Lopeta, kiitos' + siirtyminen pois.",
  turn_taking: "Harjoitelkaa vuorottelua ja odottamisen sanoja.",
  secrets_safety: "Vahvista turvallista aikuista ja turvarutiinia.",
  fear_safety: "Vahvista turvallista aikuista ja turvarutiinia.",
};

function uniq<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function buildTeacherSummaryFi(log: SessionLog): TeacherSummaryFi {
  const start = new Date(log.startedAt);
  const end = log.endedAt ? new Date(log.endedAt) : new Date();
  const durationSec = log.durationSeconds ?? Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));
  const duration = `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, "0")}`;

  const modes = uniq(log.stepsPlayed.map((s) => s.mode));
  const whatLumiDid: string[] = [];
  if (modes.includes("listening")) whatLumiDid.push("Kuunteli ja auttoi nimeämään tunteita.");
  if (modes.includes("firm")) whatLumiDid.push("Asetti turvalliset rajat ja pysäytti tilanteen.");
  if (modes.includes("regulation")) whatLumiDid.push("Ohjasi rauhoittumista ja hengitystä.");
  if (modes.includes("warm")) whatLumiDid.push("Kannusti ja vahvisti ystävällisiä tekoja.");

  const practiced = uniq(log.microPractices.map((p) => PRACTICE_MAP[p.type] || p.type));

  const votesTop = (() => {
    if (log.votingEvents.length === 0) return undefined;
    const counts: Record<string, number> = {};
    log.votingEvents.forEach((v) => {
      counts[v.emoji] = (counts[v.emoji] ?? 0) + v.countDelta;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([emoji]) => emoji);
  })();

  const safetyAttention = log.safetyEvents.some((e) => e.level === "escalate");

  return {
    header: {
      dateISO: start.toISOString(),
      duration,
      scenarioTitle: log.scenarioTitle,
      appMode: log.appMode,
      groupSize: log.groupSize,
      childName: log.soloContext?.childName,
    },
    emotion: {
      votesTop,
    },
    whatHappened:
      log.appMode === "group"
        ? `Harjoittelimme tunnetaitoja tilanteessa: ${log.scenarioTitle}.`
        : `Keskustelimme ${log.soloContext?.childName ?? "lapsen"} kanssa tilanteesta: ${log.scenarioTitle}.`,
    whatLumiDid: whatLumiDid.length > 0 ? whatLumiDid : ["Tuki lasta turvallisesti ja rauhallisesti."],
    whatWePracticed: practiced.length > 0 ? practiced : ["Rauhallinen hengitys ja tunteen nimeäminen."],
    nextSteps: [NEXT_STEPS[log.scenarioId] ?? "Jatkakaa tunnetaitojen harjoittelua lyhyin askelin."].slice(0, 3),
    safety: {
      level: safetyAttention ? "attention" : "ok",
      note: safetyAttention
        ? "Ohjaa kertomaan turvalliselle aikuiselle ja seuraa päiväkodin käytäntöjä."
        : "Ei erityisiä turvallisuushuolia.",
    },
    teacherNotes: "",
  };
}

export function formatTeacherSummaryText(summary: TeacherSummaryFi): string {
  const lines: string[] = [];
  lines.push(`Päivämäärä: ${summary.header.dateISO}`);
  lines.push(`Kesto: ${summary.header.duration}`);
  lines.push(`Skenaario: ${summary.header.scenarioTitle}`);
  lines.push(`Tila: ${summary.header.appMode}`);
  lines.push(`Ryhmäkoko: ${summary.header.groupSize}`);
  if (summary.header.childName) lines.push(`Lapsi: ${summary.header.childName}`);
  lines.push("");
  lines.push(`Mitä tapahtui: ${summary.whatHappened}`);
  lines.push("Lumin toiminta:");
  summary.whatLumiDid.forEach((b) => lines.push(`- ${b}`));
  lines.push("Harjoittelimme:");
  summary.whatWePracticed.forEach((b) => lines.push(`- ${b}`));
  lines.push("Seuraavat askeleet:");
  summary.nextSteps.forEach((b) => lines.push(`- ${b}`));
  lines.push(`Turvallisuus: ${summary.safety.level === "ok" ? "OK" : "Huomio"}`);
  lines.push(summary.safety.note);
  if (summary.teacherNotes?.trim()) {
    lines.push("");
    lines.push("Opettajan muistiinpanot:");
    lines.push(summary.teacherNotes.trim());
  }
  return lines.join("\n");
}
