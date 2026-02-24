import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { LumiAvatar } from "../components/lumi/LumiAvatar";
import { PrimaryButton } from "../components/lumi/PrimaryButton";
import { TeacherHUD } from "../components/lumi/TeacherHUD";
import { useSpeech } from "../hooks/useSpeech";

export function BreathSync() {
  const navigate = useNavigate();
  const { speak, isSpeaking } = useSpeech();
  const [cycles, setCycles] = useState(0);
  const targetCycles = 4;

  useEffect(() => {
    // Lumi speaks instructions
    speak("Hengitetään yhdessä rauhallisesti. Seuraa ympyrää.");
    
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
        </div>
      </div>

      {/* Right Side - Teacher Control Panel (35%) */}
      <div className="w-[35%] bg-white border-l border-[var(--lumi-border)] p-8 flex flex-col gap-6">
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-[var(--lumi-text-primary)] mb-2">Hengityshetki</h3>
              <p className="text-sm text-[var(--lumi-text-secondary)]">
                Lumi ohjaa rauhallista hengitystä. Seuraa Lumin hohdon rytmiä.
              </p>
            </div>

            {/* Breathing guidance for teacher */}
            <div className="space-y-4 p-4 bg-[var(--lumi-neutral-bg)] rounded-[1.5rem]">
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

            <div className="p-4 bg-blue-50 rounded-[1.5rem] border-2 border-blue-100">
              <p className="text-xs text-blue-900">
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