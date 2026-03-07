"use client";

import { useState } from "react";
import { LumiAvatar } from "../../components/LumiAvatar";
import { cancelLumiSpeak, lumiSpeak, type SpeakMode } from "../../lib/lumi/speak";
import type { GlowState, MouthState } from "../../lib/lumi/types";
import { modeToGlowState } from "../../lib/lumi/glowState";

const defaultText = "Hei. Olen Lumi. Täällä on turvallista.";

export default function VoiceTestPage() {
  const [text, setText] = useState(defaultText);
  const [mode, setMode] = useState<SpeakMode>("baseline");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mouthState, setMouthState] = useState<MouthState>(0);
  const [lightIntensity, setLightIntensity] = useState(0);
  const [error, setError] = useState("");
  const glowState: GlowState = modeToGlowState(mode);

  const handlePlay = async () => {
    setError("");
    try {
      await lumiSpeak(text, mode, {
        onSpeakingChange: setIsSpeaking,
        onMouthStateChange: setMouthState,
        onLightIntensityChange: setLightIntensity,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Playback failed");
    }
  };

  const handleStop = async () => {
    await cancelLumiSpeak();
    setIsSpeaking(false);
    setMouthState(0);
    setLightIntensity(0);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-6">
        <section className="bg-white rounded-3xl border border-slate-200 p-4 md:p-8 min-h-[65vh] flex items-center justify-center">
          <LumiAvatar
            isSpeaking={isSpeaking}
            mouthState={mouthState}
            audioIntensity={lightIntensity}
            glowState={glowState}
          />
        </section>

        <section className="bg-white rounded-3xl border border-slate-200 p-4 md:p-8 flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-slate-900">Lumi Voice Test</h1>
          <p className="text-sm text-slate-600">Finnish text + mode test with lip, blink, and glow sync.</p>

          <label className="text-sm font-medium text-slate-700" htmlFor="voice-text">
            Finnish Text
          </label>
          <textarea
            id="voice-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-40 rounded-2xl border-2 border-slate-300 p-4 text-base"
          />

          <label className="text-sm font-medium text-slate-700" htmlFor="voice-mode">
            Mode
          </label>
          <select
            id="voice-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as SpeakMode)}
            className="h-12 rounded-2xl border-2 border-slate-300 px-3 text-base"
          >
            <option value="baseline">baseline</option>
            <option value="listening">listening</option>
            <option value="firm">firm</option>
            <option value="warm">warm</option>
            <option value="regulation">regulation</option>
          </select>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void handlePlay()}
              className="h-12 rounded-2xl bg-indigo-600 text-white font-semibold"
            >
              Play
            </button>
            <button
              type="button"
              onClick={() => void handleStop()}
              className="h-12 rounded-2xl bg-slate-700 text-white font-semibold"
            >
              Stop
            </button>
          </div>

          <div className="rounded-2xl bg-slate-100 p-3 text-sm text-slate-700">
            <p>isSpeaking: {String(isSpeaking)}</p>
            <p>mouthState: {mouthState}</p>
            <p>lightIntensity: {lightIntensity.toFixed(2)}</p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
        </section>
      </div>
    </main>
  );
}
