import { useState } from "react";
import { useNavigate } from "react-router";
import { Settings, Volume2, VolumeX, Play, RotateCcw } from "lucide-react";
import { LumiAvatar } from "../components/lumi/LumiAvatar";
import { PrimaryButton } from "../components/lumi/PrimaryButton";
import { SecondaryButton } from "../components/lumi/SecondaryButton";
import { FirmCalmButton } from "../components/lumi/FirmCalmButton";
import { ScenarioCard } from "../components/lumi/ScenarioCard";
import { TeacherHUD } from "../components/lumi/TeacherHUD";
import { SettingsDrawer } from "../components/lumi/SettingsDrawer";
import { Switch } from "../components/ui/switch";
import { useSpeech } from "../hooks/useSpeech";

export function TeacherDashboard() {
  const navigate = useNavigate();
  const { speak, isSpeaking, isMuted, toggleMute } = useSpeech();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("turvataidot");
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [scenarioMode, setScenarioMode] = useState<"random" | "manual">("random");

  const scenarios = [
    { id: "1", title: "Lelu halutaan samaan aikaan", type: "quick" as const },
    { id: "2", title: "Joku tönii vahingossa", type: "quick" as const },
    { id: "3", title: "Aikuinen ei vastaa heti", type: "deep" as const },
    { id: "4", title: "Kaveri ei halua leikkiä", type: "deep" as const },
    { id: "5", title: "Oma idea hylätään", type: "quick" as const },
  ];

  const handleStart = () => {
    speak("Tervetuloa Lumin kanssa! Aloitetaan yhdessä.");
    setTimeout(() => {
      navigate("/check-in");
    }, 2000);
  };

  const handleMuteToggle = () => {
    toggleMute();
  };

  return (
    <div className="min-h-screen bg-[var(--lumi-neutral-bg)] flex">
      {/* Left Side - Kid-Facing Stage (65%) */}
      <div className="w-[65%] flex items-center justify-center p-12 relative">
        <div className="flex flex-col items-center gap-8">
          <LumiAvatar size="xxl" emotion="happy" speaking={isSpeaking} />
          
          {/* Optional situation illustration placeholder */}
          <div className="text-center max-w-md">
            <p className="text-[var(--lumi-text-secondary)] opacity-0">
              {/* Minimal text - voice-first interface */}
            </p>
          </div>
        </div>
        
        {/* Teacher-only HUD (subtle, top-left corner) */}
        <div className="absolute top-6 left-6">
          <TeacherHUD elapsed="0:00" />
        </div>
      </div>

      {/* Right Side - Teacher Control Panel (35%) */}
      <div className="w-[35%] bg-white border-l border-[var(--lumi-border)] p-8 flex flex-col gap-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-[var(--lumi-text-primary)]">Opettajan ohjaus</h3>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--lumi-neutral-bg)] transition-colors"
          >
            <Settings className="w-5 h-5 text-[var(--lumi-text-secondary)]" />
          </button>
        </div>

        {/* Theme Selector */}
        <div className="space-y-3">
          <label className="text-sm text-[var(--lumi-text-secondary)]">Teema</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedTheme("turvataidot")}
              className={`
                h-12 px-4 rounded-[1rem] border-2 transition-all
                ${selectedTheme === "turvataidot" 
                  ? 'border-[var(--lumi-sky-blue)] bg-[var(--lumi-sky-blue)]/10' 
                  : 'border-[var(--lumi-border)] bg-white'
                }
              `}
            >
              Turvataidot
            </button>
            <button
              onClick={() => setSelectedTheme("toveri")}
              className={`
                h-12 px-4 rounded-[1rem] border-2 transition-all
                ${selectedTheme === "toveri" 
                  ? 'border-[var(--lumi-sky-blue)] bg-[var(--lumi-sky-blue)]/10' 
                  : 'border-[var(--lumi-border)] bg-white'
                }
              `}
            >
              Toveritaidot
            </button>
          </div>
        </div>

        {/* Scenario Selection Mode */}
        <div className="space-y-3">
          <label className="text-sm text-[var(--lumi-text-secondary)]">Skenaario</label>
          <div className="flex items-center gap-3 p-4 bg-[var(--lumi-neutral-bg)] rounded-[1rem]">
            <span className="text-sm text-[var(--lumi-text-primary)]">Älykäs satunnainen</span>
            <Switch
              checked={scenarioMode === "manual"}
              onCheckedChange={(checked) => setScenarioMode(checked ? "manual" : "random")}
            />
            <span className="text-sm text-[var(--lumi-text-primary)]">Manuaalinen</span>
          </div>
        </div>

        {/* Manual Scenario Selection */}
        {scenarioMode === "manual" && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                title={scenario.title}
                type={scenario.type}
                selected={selectedScenario === scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
              />
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-[var(--lumi-border)]" />

        {/* Main Controls */}
        <div className="flex-1 flex flex-col gap-4">
          <PrimaryButton onClick={handleStart}>
            <div className="flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              <span>Aloita istunto</span>
            </div>
          </PrimaryButton>

          <SecondaryButton>
            <div className="flex items-center justify-center gap-2">
              <RotateCcw className="w-5 h-5" />
              <span>Toista vaihe</span>
            </div>
          </SecondaryButton>

          <FirmCalmButton>
            Rauhallinen tuki
          </FirmCalmButton>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--lumi-border)]">
          <button
            onClick={handleMuteToggle}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-[var(--lumi-neutral-bg)] transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-[var(--lumi-text-secondary)]" />
            ) : (
              <Volume2 className="w-5 h-5 text-[var(--lumi-text-secondary)]" />
            )}
            <span className="text-sm text-[var(--lumi-text-secondary)]">
              {isMuted ? "Mykistetty" : "Ääni päällä"}
            </span>
          </button>
        </div>
      </div>

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Asetukset"
      >
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-[var(--lumi-text-primary)]">Istunnon pituus</h4>
            <div className="flex gap-3">
              <button className="flex-1 h-12 rounded-[1rem] border-2 border-[var(--lumi-sky-blue)] bg-[var(--lumi-sky-blue)]/10">
                6–8 min
              </button>
              <button className="flex-1 h-12 rounded-[1rem] border-2 border-[var(--lumi-border)]">
                10–12 min
              </button>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-[var(--lumi-text-primary)]">Kieli</h4>
            <button className="w-full h-12 rounded-[1rem] border-2 border-[var(--lumi-sky-blue)] bg-[var(--lumi-sky-blue)]/10 text-left px-4">
              Suomi
            </button>
          </div>

          <div>
            <h4 className="mb-3 text-[var(--lumi-text-primary)]">Ryhmän koko</h4>
            <input
              type="number"
              defaultValue={15}
              min={1}
              max={30}
              className="w-full h-12 rounded-[1rem] border-2 border-[var(--lumi-border)] px-4"
            />
          </div>
        </div>
      </SettingsDrawer>
    </div>
  );
}