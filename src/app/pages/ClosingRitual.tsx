import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { LumiAvatar } from "../components/lumi/LumiAvatar";
import { PrimaryButton } from "../components/lumi/PrimaryButton";
import { TeacherHUD } from "../components/lumi/TeacherHUD";
import { useSpeech } from "../hooks/useSpeech";
import { fiPhrases } from "../../../lib/lumi/fiPhrases";

export function ClosingRitual() {
  const navigate = useNavigate();
  const { speakLines, isSpeaking } = useSpeech();

  useEffect(() => {
    // Lumi speaks closing message
    const closingLines = [
      fiPhrases.warm[0],
      fiPhrases.warm[1],
      fiPhrases.warm[5],
    ];
    
    speakLines(closingLines, "warm", 1000);
  }, []);

  const handleFinish = () => {
    navigate("/teacher");
  };

  return (
    <div className="min-h-screen bg-[var(--lumi-neutral-bg)] flex">
      {/* Left Side - Kid-Facing Stage (65%) */}
      <div className="w-[65%] flex flex-col items-center justify-center p-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(135,206,235,0.18),transparent_38%),radial-gradient(circle_at_85%_15%,rgba(255,179,102,0.14),transparent_32%)] pointer-events-none" />
        {/* Teacher HUD */}
        <div className="absolute top-6 left-6">
          <TeacherHUD elapsed="7:18" step="Päätösrituaali" />
        </div>

        <div className="flex flex-col items-center gap-12">
          {/* Warm ambient glow around Lumi */}
          <div className="relative">
            <motion.div
              className="absolute inset-0 -m-16 rounded-full blur-3xl"
              style={{ 
                background: "radial-gradient(circle, rgba(135, 206, 235, 0.4) 0%, rgba(135, 206, 235, 0) 70%)" 
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.6, 0.8, 0.6],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <LumiAvatar size="xxl" emotion="happy" speaking={isSpeaking} />
          </div>

          {/* Short closing message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <p className="text-[var(--lumi-text-primary)] text-2xl">
              Hyvää työtä kaikille! 💙
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Teacher Control Panel (35%) */}
      <div className="w-[35%] bg-white/95 backdrop-blur-sm border-l border-[var(--lumi-border)] p-8 flex flex-col gap-6 shadow-[-8px_0_24px_rgba(43,58,74,0.08)]">
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-[var(--lumi-text-primary)] font-semibold mb-2">Päätösrituaali</h3>
              <p className="text-sm text-[var(--lumi-text-secondary)]">
                Kiitä lapsia osallistumisesta ja muistuta opittuja taitoja.
              </p>
            </div>

            {/* Session Summary */}
            <div className="space-y-4">
              <div className="p-4 bg-[var(--lumi-neutral-bg)] border border-[var(--lumi-border)] rounded-[1.5rem]">
                <p className="text-xs text-[var(--lumi-text-secondary)] uppercase tracking-wide mb-3">
                  Istunnon yhteenveto
                </p>
                <ul className="space-y-2 text-sm text-[var(--lumi-text-primary)]">
                  <li>✓ Tunne-check-in suoritettu</li>
                  <li>✓ Hengitysharjoitus tehty</li>
                  <li>✓ 4 skenaariota käsitelty</li>
                  <li>✓ Kesto: 7 min 18 sek</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-[1.5rem] border-2 border-blue-200">
                <p className="text-xs text-blue-950 mb-2">
                  💡 Muistutus vanhemmille
                </p>
                <p className="text-xs text-blue-800">
                  Voit jakaa tämän päivän teeman vanhemmille päiväkirjassa tai viestillä.
                </p>
              </div>
            </div>

            {/* Closing suggestions */}
            <div className="space-y-2">
              <p className="text-xs text-[var(--lumi-text-secondary)] uppercase tracking-wide">
                Päätöslauseet
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-white border border-[var(--lumi-border)] rounded-[1rem]">
                  <p className="text-sm text-[var(--lumi-text-primary)]">
                    "Jokainen teistä oli rohkea tänään"
                  </p>
                </div>
                <div className="p-3 bg-white border border-[var(--lumi-border)] rounded-[1rem]">
                  <p className="text-sm text-[var(--lumi-text-primary)]">
                    "Muistakaa harjoitella näitä taitoja!"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Finish Button */}
          <PrimaryButton onClick={handleFinish}>
            Lopeta istunto
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
