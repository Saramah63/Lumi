import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { LumiAvatar } from "../components/lumi/LumiAvatar";
import { PrimaryButton } from "../components/lumi/PrimaryButton";
import { TeacherHUD } from "../components/lumi/TeacherHUD";
import { useSpeech } from "../hooks/useSpeech";
import { fiPhrases } from "../../../lib/lumi/fiPhrases";

export function BreathSync() {
  const navigate = useNavigate();
  const { speak } = useSpeech();
  const [cycles, setCycles] = useState(0);
  const targetCycles = 4;

  useEffect(() => {
    // Lumi speaks instructions
    speak(fiPhrases.regulation[0], "baseline");
    
    // Breathing cycle timer (6 seconds per cycle: 3s in, 3s out)
    const interval = setInterval(() => {
      setCycles((prev) => {
        if (prev >= targetCycles - 1) {
          clearInterval(interval);
          return prev + 1;
        }
        return prev + 1;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleContinue = () => {
    navigate("/scenario");
  };

  return (
    <div className="min-h-screen bg-[var(--lumi-neutral-bg)] flex">
      {/* Left Side - Kid-Facing Stage (65%) */}
      <div className="w-[65%] flex flex-col items-center justify-center p-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(135,206,235,0.18),transparent_38%),radial-gradient(circle_at_85%_15%,rgba(255,179,102,0.14),transparent_32%)] pointer-events-none" />
        {/* Teacher HUD */}
        <div className="absolute top-6 left-6">
          <TeacherHUD elapsed="2:48" step="Hengityshetki" />
        </div>

        <div className="flex flex-col items-center gap-12">
          {/* Lumi with breathing animation */}
          <LumiAvatar size="xl" emotion="calm" breathing />

          {/* Minimal instruction text */}
          <div className="text-center">
            <p className="text-[var(--lumi-text-primary)] text-xl opacity-70">
              {/* Voice guides breathing - minimal text */}
            </p>
          </div>

          <div className="w-72 h-3 bg-white/80 border border-[var(--lumi-border)] rounded-full overflow-hidden shadow-sm">
            <div
              className="h-full bg-[var(--lumi-sky-blue)] transition-all duration-500"
              style={{ width: `${Math.min((cycles / targetCycles) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right Side - Teacher Control Panel (35%) */}
      <div className="w-[35%] bg-white/95 backdrop-blur-sm border-l border-[var(--lumi-border)] p-8 flex flex-col gap-6 shadow-[-8px_0_24px_rgba(43,58,74,0.08)]">
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-[var(--lumi-text-primary)] font-semibold mb-2">Hengityshetki</h3>
              <p className="text-sm text-[var(--lumi-text-secondary)]">
                Lumi ohjaa rauhallista hengitystä. Seuraa Lumin hohdon rytmiä.
              </p>
            </div>

            {/* Breathing guidance for teacher */}
            <div className="space-y-4 p-4 bg-[var(--lumi-neutral-bg)] border border-[var(--lumi-border)] rounded-[1.5rem]">
              <div className="space-y-2">
                <p className="text-sm text-[var(--lumi-text-secondary)]">Ohje:</p>
                <ul className="space-y-2 text-sm text-[var(--lumi-text-primary)]">
                  <li>• Sisäänhengitys: 4 sekuntia</li>
                  <li>• Pidätys: 2 sekuntia</li>
                  <li>• Uloshengitys: 6 sekuntia</li>
                  <li>• Toista 3–4 kertaa</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-[1.5rem] border-2 border-blue-200">
              <p className="text-xs text-blue-950">
                💡 Vinkki: Voit sanoa "Laitetaan käsi vatsalle ja tunnetaan miten ilma menee sisään ja ulos"
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <PrimaryButton onClick={handleContinue}>
              Jatka skenaarion
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
