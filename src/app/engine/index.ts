import { lumiEngine, type LumiSpeakMode, type LumiSpeakOptions } from "./lumiEngine";

export async function speak(text: string, mode: LumiSpeakMode = "normal", options?: LumiSpeakOptions) {
  return lumiEngine.speak(text, mode, options);
}

export async function stopSpeaking() {
  return lumiEngine.stop();
}

export { lumiEngine };
export type { LumiSpeakMode, LumiSpeakOptions };
