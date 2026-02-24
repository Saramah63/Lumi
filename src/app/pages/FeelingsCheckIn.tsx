import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { LumiAvatar } from "../components/lumi/LumiAvatar";
import { FeelingButton } from "../components/lumi/FeelingButton";
import { PrimaryButton } from "../components/lumi/PrimaryButton";
import { TeacherHUD } from "../components/lumi/TeacherHUD";
import { useSpeech } from "../hooks/useSpeech";

type Feeling = "ilo" | "suru" | "viha" | "pelko" | "en-tieda";

export function FeelingsCheckIn() {
  const navigate = useNavigate();
  const { speak, isSpeaking } = useSpeech();
  const [votes, setVotes] = useState<Record<Feeling, number>>({
    ilo: 0,
    suru: 0,
    viha: 0,
    pelko: 0,
    "en-tieda": 0,
  });
  const [selectedFeeling, setSelectedFeeling] = useState<Feeling | null>(null);

  const feelings: Array<{ id: Feeling; emoji: string; label: string }> = [
    { id: "ilo", emoji: "🙂", label: "Ilo" },
    { id: "suru", emoji: "😢", label: "Suru" },
    { id: "viha", emoji: "😡", label: "Viha" },
    { id: "pelko", emoji: "😨", label: "Pelko" },
    { id: "en-tieda", emoji: "🤷", label: "En tiedä" },
  ];

  useEffect(() => {
    // Lumi speaks when entering this screen
    speak("Miltä sinusta tuntuu tänään? Valitse tunne.");
  }, []);

  const handleFeelingClick = (feeling: Feeling) => {
    setVotes((prev) => ({
      ...prev,
      [feeling]: prev[feeling] + 1,
    }));
    setSelectedFeeling(feeling);
  };

  const handleContinue = async () => {
    await speak("Kuulin erilaisia tunteita. Kaikki tunteet ovat ok.");
    navigate("/breath");
  };

  return (
    <div className="min-h-screen bg-[var(--lumi-neutral-bg)] flex">
      {/* Left Side - Kid-Facing Stage (65%) */}
      <div className="w-[65%] flex flex-col items-center justify-center p-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(135,206,235,0.18),transparent_38%),radial-gradient(circle_at_85%_15%,rgba(255,179,102,0.14),transparent_32%)] pointer-events-none" />
        {/* Teacher HUD */}
        <div className="absolute top-6 left-6">
          <TeacherHUD elapsed="1:24" step="Tunne-check-in" />
        </div>

        <div className="w-full max-w-4xl space-y-12">
          {/* Lumi */}
          <div className="flex justify-center">
            <LumiAvatar size="xl" emotion="calm" speaking={isSpeaking} />
          </div>

          {/* Feeling Buttons */}
          <div className="grid grid-cols-5 gap-6">
            {feelings.map((feeling) => (
              <FeelingButton
                key={feeling.id}
                emoji={feeling.emoji}
                label={feeling.label}
                votes={votes[feeling.id]}
                selected={selectedFeeling === feeling.id}
                onClick={() => handleFeelingClick(feeling.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Teacher Control Panel (35%) */}
      <div className="w-[35%] bg-white/95 backdrop-blur-sm border-l border-[var(--lumi-border)] p-8 flex flex-col gap-6 shadow-[-8px_0_24px_rgba(43,58,74,0.08)]">
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-[var(--lumi-text-primary)] font-semibold mb-2">Tunne-check-in</h3>
              <p className="text-sm text-[var(--lumi-text-secondary)]">
                Lapset voivat ilmaista tuntemuksensa koskettamalla tuntomerkkiä.
              </p>
            </div>

            {/* Vote Summary */}
            <div className="space-y-2">
              <p className="text-xs text-[var(--lumi-text-secondary)] uppercase tracking-wide">
                Vastaukset ({Object.values(votes).reduce((a, b) => a + b, 0)})
              </p>
              {feelings.map((feeling) => (
                votes[feeling.id] > 0 && (
                  <div
                    key={feeling.id}
                    className="flex items-center justify-between p-3 bg-[var(--lumi-neutral-bg)] border border-[var(--lumi-border)] rounded-[1rem]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{feeling.emoji}</span>
                      <span className="text-sm text-[var(--lumi-text-primary)]">
                        {feeling.label}
                      </span>
                    </div>
                    <span className="text-[var(--lumi-sky-blue)] font-semibold">
                      {votes[feeling.id]}
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <PrimaryButton onClick={handleContinue}>
            Jatka
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
