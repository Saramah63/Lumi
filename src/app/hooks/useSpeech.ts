import { useCallback, useState } from "react";
import { lumiEngine, type LumiLanguage, type LumiSpeakMode } from "../engine/lumiEngine";
import { useLumiEngineState } from "../engine/useLumiEngine";

type SpeakOptions = {
  lang?: LumiLanguage;
  voice?: string;
};

export function useSpeech() {
  const state = useLumiEngineState();
  const [isMuted, setIsMuted] = useState(lumiEngine.getMuted());

  const speak = useCallback(
    async (text: string, mode: LumiSpeakMode = "normal", options?: SpeakOptions) => {
      try {
        await lumiEngine.speak(text, mode, options);
      } catch (error) {
        console.error("Lumi speak failed", error);
      }
    },
    []
  );

  const speakLines = useCallback(
    async (lines: string[], mode: LumiSpeakMode = "normal", pauseDuration = 800) => {
      try {
        await lumiEngine.speakLines(lines, mode, pauseDuration);
      } catch (error) {
        console.error("Lumi speakLines failed", error);
      }
    },
    []
  );

  const cancel = useCallback(async () => {
    await lumiEngine.stop();
  }, []);

  const pause = useCallback(() => {
    // Audio element pause control can be added later if needed by ScenarioRunner.
  }, []);

  const resume = useCallback(() => {
    // Audio element resume control can be added later if needed by ScenarioRunner.
  }, []);

  const toggleMute = useCallback(() => {
    const next = lumiEngine.toggleMute();
    setIsMuted(next);
    return next;
  }, []);

  const setMute = useCallback((muted: boolean) => {
    lumiEngine.setMuted(muted);
    setIsMuted(muted);
  }, []);

  return {
    speak,
    speakLines,
    cancel,
    pause,
    resume,
    toggleMute,
    setMute,
    isSpeaking: state.isSpeaking,
    isMuted,
  };
}
