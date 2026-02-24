import { useState } from "react";
import { Link } from "react-router";
import { Home, Zap, Sprout } from "lucide-react";
import { LumiAvatar } from "../components/lumi/LumiAvatar";
import { PrimaryButton } from "../components/lumi/PrimaryButton";
import { SecondaryButton } from "../components/lumi/SecondaryButton";
import { FirmCalmButton } from "../components/lumi/FirmCalmButton";
import { FeelingButton } from "../components/lumi/FeelingButton";
import { ScenarioCard } from "../components/lumi/ScenarioCard";
import { TeacherHUD } from "../components/lumi/TeacherHUD";
import { SettingsDrawer } from "../components/lumi/SettingsDrawer";

export function ComponentLibrary() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--lumi-neutral-bg)] p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[var(--lumi-text-primary)] mb-2">Lumi Component Library</h1>
            <p className="text-[var(--lumi-text-secondary)]">
              Premium, calm, teacher-led emotional skills interface components
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/design-system">
              <SecondaryButton>
                <span>Design Tokens</span>
              </SecondaryButton>
            </Link>
            <Link to="/teacher">
              <SecondaryButton>
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
              </SecondaryButton>
            </Link>
          </div>
        </div>

        {/* Lumi Avatar */}
        <section className="bg-white rounded-[1.5rem] p-8 space-y-6">
          <h2 className="text-[var(--lumi-text-primary)]">Lumi Avatar</h2>
          
          <div className="grid grid-cols-4 gap-8">
            <div className="flex flex-col items-center gap-4">
              <LumiAvatar size="sm" emotion="neutral" />
              <p className="text-sm text-[var(--lumi-text-secondary)]">Small / Neutral</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <LumiAvatar size="md" emotion="happy" />
              <p className="text-sm text-[var(--lumi-text-secondary)]">Medium / Happy</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <LumiAvatar size="lg" emotion="calm" />
              <p className="text-sm text-[var(--lumi-text-secondary)]">Large / Calm</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <LumiAvatar size="lg" emotion="thinking" breathing />
              <p className="text-sm text-[var(--lumi-text-secondary)]">Breathing</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="bg-white rounded-[1.5rem] p-8 space-y-6">
          <h2 className="text-[var(--lumi-text-primary)]">Buttons</h2>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm text-[var(--lumi-text-secondary)] uppercase tracking-wide">Primary Buttons</h4>
              <div className="flex gap-4">
                <PrimaryButton size="lg">Large Primary</PrimaryButton>
                <PrimaryButton size="md">Medium Primary</PrimaryButton>
                <PrimaryButton size="lg" disabled>Disabled</PrimaryButton>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm text-[var(--lumi-text-secondary)] uppercase tracking-wide">Secondary Buttons</h4>
              <div className="flex gap-4">
                <SecondaryButton size="lg">Large Secondary</SecondaryButton>
                <SecondaryButton size="md">Medium Secondary</SecondaryButton>
                <SecondaryButton size="lg" disabled>Disabled</SecondaryButton>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm text-[var(--lumi-text-secondary)] uppercase tracking-wide">Firm Calm Button</h4>
              <div className="flex gap-4">
                <FirmCalmButton>Rauhallinen tuki</FirmCalmButton>
                <FirmCalmButton disabled>Disabled</FirmCalmButton>
              </div>
            </div>
          </div>
        </section>

        {/* Feeling Buttons */}
        <section className="bg-white rounded-[1.5rem] p-8 space-y-6">
          <h2 className="text-[var(--lumi-text-primary)]">Feeling Buttons</h2>
          
          <div className="grid grid-cols-5 gap-4">
            <FeelingButton emoji="🙂" label="Ilo" votes={0} />
            <FeelingButton emoji="😢" label="Suru" votes={3} />
            <FeelingButton emoji="😡" label="Viha" votes={1} />
            <FeelingButton emoji="😨" label="Pelko" votes={0} />
            <FeelingButton emoji="🤷" label="En tiedä" votes={5} selected />
          </div>
        </section>

        {/* Scenario Cards */}
        <section className="bg-white rounded-[1.5rem] p-8 space-y-6">
          <h2 className="text-[var(--lumi-text-primary)]">Scenario Cards</h2>
          
          <div className="space-y-3 max-w-md">
            <ScenarioCard title="Lelu halutaan samaan aikaan" type="quick" />
            <ScenarioCard title="Joku tönii vahingossa" type="quick" selected />
            <ScenarioCard title="Aikuinen ei vastaa heti" type="deep" />
          </div>

          <div className="flex gap-6 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Zap className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="text-sm text-[var(--lumi-text-secondary)]">Quick (6-8 min)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Sprout className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-[var(--lumi-text-secondary)]">Deep (10-12 min)</span>
            </div>
          </div>
        </section>

        {/* Teacher HUD */}
        <section className="bg-white rounded-[1.5rem] p-8 space-y-6">
          <h2 className="text-[var(--lumi-text-primary)]">Teacher HUD</h2>
          
          <div className="space-y-4">
            <TeacherHUD elapsed="2:34" />
            <TeacherHUD elapsed="5:12" step="Hengityshetki" />
          </div>
        </section>

        {/* Settings Drawer */}
        <section className="bg-white rounded-[1.5rem] p-8 space-y-6">
          <h2 className="text-[var(--lumi-text-primary)]">Settings Drawer</h2>
          
          <PrimaryButton onClick={() => setIsDrawerOpen(true)}>
            Open Settings Drawer
          </PrimaryButton>

          <SettingsDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            title="Asetukset"
          >
            <div className="space-y-4">
              <div>
                <h4 className="mb-2">Sample Setting</h4>
                <p className="text-sm text-[var(--lumi-text-secondary)]">
                  This is a slide-in panel for settings and configuration.
                </p>
              </div>
            </div>
          </SettingsDrawer>
        </section>

        {/* Touch Target Guidelines */}
        <section className="bg-white rounded-[1.5rem] p-8 space-y-6">
          <h2 className="text-[var(--lumi-text-primary)]">Touch Target Guidelines</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[var(--lumi-sky-blue)] rounded-[1rem] flex items-center justify-center text-white">
                56px
              </div>
              <p className="text-sm text-[var(--lumi-text-secondary)]">
                Minimum touch target height for iPad/smartboard use
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[var(--lumi-sky-blue)] rounded-[1rem] flex items-center justify-center text-white">
                64px
              </div>
              <p className="text-sm text-[var(--lumi-text-secondary)]">
                Recommended touch target for primary actions
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}