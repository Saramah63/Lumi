import { useMemo, useState } from "react";
import { Play, Square } from "lucide-react";
import { LumiAvatar } from "../components/lumi/LumiAvatar";
import { PrimaryButton } from "../components/lumi/PrimaryButton";
import { SecondaryButton } from "../components/lumi/SecondaryButton";
import { TeacherHUD } from "../components/lumi/TeacherHUD";
import { useSpeech } from "../hooks/useSpeech";
import type { LumiSpeakMode } from "../engine/lumiEngine";

const MODE_LABELS: Record<LumiSpeakMode, string> = {
  baseline: "Baseline",
  listening: "Listening",
  firm: "Firm",
  warm: "Warm",
};

const PRESET_TEXT: Record<LumiSpeakMode, string> = {
  baseline: "Hei ystävä. Hengitä rauhassa. Tehdään tämä yhdessä.",
  listening: "Kuulen sinut. Pysähdy hetkeksi. Kerro minulle lisää.",
  firm: "Pysähdy. Tämä ei ole turvallista. Kerro aikuiselle.",
  warm: "Hienoa työtä. Olet turvallinen. Kiitos, teit sen yhdessä.",
};

export function VoiceTest() {
  const { speak, cancel, isSpeaking } = useSpeech();
  const [mode, setMode] = useState<LumiSpeakMode>("baseline");
  const [text, setText] = useState(PRESET_TEXT.baseline);

  const modeHelp = useMemo(() => {
    if (mode === "listening") return "Hitaampi rytmi, kuunteleva tunne";
    if (mode === "firm") return "Rauhallinen mutta jämäkkä raja";
    if (mode === "warm") return "Lämmin lopetus tai korjaushetki";
    return "Perusääni: selkeä, ystävällinen, rauhallinen";
  }, [mode]);

  const handleModeChange = (nextMode: LumiSpeakMode) => {
    setMode(nextMode);
    if (!text.trim() || text === PRESET_TEXT[mode]) {
      setText(PRESET_TEXT[nextMode]);
    }
  };

  const handlePlay = async () => {
    await speak(text, mode, { lang: "fi-FI" });
  };

  const handleStop = async () => {
    await cancel();
  };

  return (
    <div className="min-h-screen bg-[var(--lumi-neutral-bg)] flex">
      <div className="w-[65%] flex flex-col items-center justify-center p-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(135,206,235,0.18),transparent_38%),radial-gradient(circle_at_85%_15%,rgba(255,179,102,0.14),transparent_32%)] pointer-events-none" />

        <div className="absolute top-6 left-6">
          <TeacherHUD elapsed="test" step="Voice Test" />
        </div>

        <div className="flex flex-col items-center gap-8">
          <LumiAvatar size="xxl" emotion="happy" speaking={isSpeaking} />
          <p className="text-sm text-[var(--lumi-text-secondary)]">
            Lip sync + blink + light sync näkyy tässä reaaliajassa.
          </p>
        </div>
      </div>

      <div className="w-[35%] bg-white/95 backdrop-blur-sm border-l border-[var(--lumi-border)] p-8 flex flex-col gap-6 shadow-[-8px_0_24px_rgba(43,58,74,0.08)]">
        <div>
          <h3 className="text-[var(--lumi-text-primary)] font-semibold mb-2">/voice-test</h3>
          <p className="text-sm text-[var(--lumi-text-secondary)]">Kirjoita suomeksi, valitse mode ja testaa puhe + animaatiosynkka.</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-[var(--lumi-text-secondary)]">Mode</p>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(MODE_LABELS) as LumiSpeakMode[]).map((item) => (
              <button
                key={item}
                onClick={() => handleModeChange(item)}
                className={`h-11 px-3 rounded-[1rem] border-2 transition-all focus-visible:ring-4 focus-visible:ring-[#0a7ec2]/25 ${
                  mode === item
                    ? "border-[var(--lumi-sky-blue)] bg-[var(--lumi-sky-blue)]/10"
                    : "border-[var(--lumi-border)] bg-white"
                }`}
              >
                {MODE_LABELS[item]}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--lumi-text-secondary)]">{modeHelp}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-[var(--lumi-text-secondary)]" htmlFor="voice-text">
            Finnish text
          </label>
          <textarea
            id="voice-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full rounded-[1rem] border-2 border-[var(--lumi-border)] bg-white px-4 py-3 text-[var(--lumi-text-primary)] focus-visible:ring-4 focus-visible:ring-[#0a7ec2]/25"
            placeholder="Kirjoita lyhyt suomenkielinen lause..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-auto">
          <PrimaryButton onClick={handlePlay} disabled={!text.trim()}>
            <span className="flex items-center justify-center gap-2">
              <Play className="w-4 h-4" />
              Play
            </span>
          </PrimaryButton>

          <SecondaryButton onClick={handleStop}>
            <span className="flex items-center justify-center gap-2">
              <Square className="w-4 h-4" />
              Stop
            </span>
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
