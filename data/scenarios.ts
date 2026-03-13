import type { SpeakMode } from "../lib/lumi/speak";

export type ScenarioOption = {
  label: string;
  next: number;
};

export type ScenarioStep = {
  mode: SpeakMode;
  text: string;
  pauseMs?: number;
  options?: ScenarioOption[];
  teacherHint?: string;
  metaphor?: string;
  bodyAction?: string;
};

export type Scenario = {
  id: string;
  title: string;
  durationTarget: string;
  steps: ScenarioStep[];
};

import hittingRaw from "../content/fi/scenarios/01_hitting.json";
import throwingRaw from "../content/fi/scenarios/02_throwing.json";
import ruiningGameRaw from "../content/fi/scenarios/03_ruining_game.json";
import meanWordsRaw from "../content/fi/scenarios/04_mean_words.json";
import notStoppingRaw from "../content/fi/scenarios/05_not_stopping.json";
import turnTakingRaw from "../content/fi/scenarios/06_turn_taking.json";
import secretsSafetyRaw from "../content/fi/scenarios/07_secrets_safety.json";
import fearSafetyRaw from "../content/fi/scenarios/08_fear_safety.json";

const hitting = hittingRaw as unknown as Scenario;
const throwing = throwingRaw as unknown as Scenario;
const ruiningGame = ruiningGameRaw as unknown as Scenario;
const meanWords = meanWordsRaw as unknown as Scenario;
const notStopping = notStoppingRaw as unknown as Scenario;
const turnTaking = turnTakingRaw as unknown as Scenario;
const secretsSafety = secretsSafetyRaw as unknown as Scenario;
const fearSafety = fearSafetyRaw as unknown as Scenario;

export const scenarios: Scenario[] = [
  hitting,
  throwing,
  ruiningGame,
  meanWords,
  notStopping,
  turnTaking,
  secretsSafety,
  fearSafety,
];
