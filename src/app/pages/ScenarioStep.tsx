import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { RotateCcw, AlertCircle } from "lucide-react";
import { LumiAvatar } from "../components/lumi/LumiAvatar";
import { PrimaryButton } from "../components/lumi/PrimaryButton";
import { SecondaryButton } from "../components/lumi/SecondaryButton";
import { FirmCalmButton } from "../components/lumi/FirmCalmButton";
import { TeacherHUD } from "../components/lumi/TeacherHUD";
import { useSpeech } from "../hooks/useSpeech";

export function ScenarioStep() {
  const navigate = useNavigate();
  const { speak, isSpeaking } = useSpeech();
  const [currentStep, setCurrentStep] = useState(0);

  const scenarioSteps = [
    {
      text: "Kaksi lasta haluaa samaa lelua. Mitä voimme tehdä?",
      emotion: "thinking" as const,
    },
    {
      text: "Voimme kysyä: Haluaisitko leikkiä yhdessä?",
      emotion: "happy" as const,
    },
    {
      text: "Tai voimme vuorotella. Ensin sinä, sitten minä.",
      emotion: "calm" as const,
    },
  ];

  useEffect(() => {
    speak(scenarioSteps[currentStep].text, currentStep === 0 ? "listening" : "normal");
  }, [currentStep, speak]);

  const handleNext = async () => {
    if (currentStep < scenarioSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await speak("Hienoa työtä! Siirrytään päätöshetkeen.", "repair");
      navigate("/closing");
    }
  };

  const handleRepeat = () => {
    speak(scenarioSteps[currentStep].text, "normal");
  };

  const handleFirmCalm = () => {
    speak("Pysähdytään ja rauhoitutaan. Olemme turvassa.", "firm");
  };

  return (
    <div className="min-h-screen bg-[var(--lumi-neutral-bg)] flex">
      {/* Left Side - Kid-Facing Stage (65%) */}
      <div className="w-[65%] flex flex-col items-center justify-center p-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(135,206,235,0.18),transparent_38%),radial-gradient(circle_at_85%_15%,rgba(255,179,102,0.14),transparent_32%)] pointer-events-none" />
        {/* Teacher HUD - subtle, top-left */}
        <div className="absolute top-6 left-6">
          <TeacherHUD elapsed="4:32" step={`Skenaario ${currentStep + 1}/${scenarioSteps.length}`} />
        </div>

        <div className="w-full max-w-3xl space-y-12">
          {/* Lumi */}
          <div className="flex justify-center">
            <LumiAvatar size="xxl" emotion={scenarioSteps[currentStep].emotion} speaking={isSpeaking} />
          </div>

          {/* Scenario Illustration Placeholder */}
          <div className="flex justify-center">
            <div className="w-96 h-64 bg-white rounded-[1.5rem] border-2 border-[var(--lumi-border)] flex items-center justify-center shadow-md">
              <div className="text-center space-y-4">
                <div className="text-6xl">🧸</div>
                <p className="text-[var(--lumi-text-secondary)] text-lg">
                  {/* Voice-first - minimal text */}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Teacher Control Panel (35%) */}
      <div className="w-[35%] bg-white/95 backdrop-blur-sm border-l border-[var(--lumi-border)] p-8 flex flex-col gap-6 shadow-[-8px_0_24px_rgba(43,58,74,0.08)]">
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-[var(--lumi-text-primary)] font-semibold mb-1">Lelu halutaan samaan aikaan</h3>
              <p className="text-xs text-[var(--lumi-text-secondary)] uppercase tracking-wide">
                Vaihe 2 / 4
              </p>
            </div>

            {/* Scenario Content */}
            <div className="space-y-4">
              <div className="p-4 bg-[var(--lumi-neutral-bg)] border border-[var(--lumi-border)] rounded-[1.5rem]">
                <p className="text-sm text-[var(--lumi-text-primary)] mb-3">
                  Opetettava taito:
                </p>
                <p className="text-sm text-[var(--lumi-text-secondary)]">
                  "Voimme kysyä toisiltamme: 'Saanko lainata?' tai 'Voimmeko leikkiä yhdessä?'"
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-[1.5rem] border-2 border-green-200">
                <p className="text-xs text-green-950">
                  🎯 Harjoitus: Lapset voivat näytellä tilannetta pareittain
                </p>
              </div>
            </div>

            {/* Key phrases for teacher */}
            <div className="space-y-2">
              <p className="text-xs text-[var(--lumi-text-secondary)] uppercase tracking-wide">
                Tukisanat
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-white border border-[var(--lumi-border)] rounded-[1rem]">
                  <p className="text-sm text-[var(--lumi-text-primary)]">
                    "Mitä voisimme sanoa?"
                  </p>
                </div>
                <div className="p-3 bg-white border border-[var(--lumi-border)] rounded-[1rem]">
                  <p className="text-sm text-[var(--lumi-text-primary)]">
                    "Kuunnellaan toisen vastausta"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <PrimaryButton onClick={handleNext}>
              Seuraava vaihe
            </PrimaryButton>

            <SecondaryButton onClick={handleRepeat}>
              <div className="flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" />
                <span>Toista</span>
              </div>
            </SecondaryButton>

            <FirmCalmButton onClick={handleFirmCalm}>
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Keskeytä ja rauhoita</span>
              </div>
            </FirmCalmButton>
          </div>
        </div>
      </div>
    </div>
  );
}
