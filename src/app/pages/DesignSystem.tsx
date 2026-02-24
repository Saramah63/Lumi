import { useState } from "react";
import { Link } from "react-router";
import { Home, Check, Moon, Sun } from "lucide-react";
import { SecondaryButton } from "../components/lumi/SecondaryButton";
import { PrimaryButton } from "../components/lumi/PrimaryButton";
import { FirmCalmButton } from "../components/lumi/FirmCalmButton";

export function DesignSystem() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-[var(--lumi-neutral-50)] transition-colors duration-200">
        <div className="max-w-7xl mx-auto p-12 space-y-16">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ color: "var(--lumi-text-primary)" }}>Lumi Design System</h1>
              <p style={{ color: "var(--lumi-text-secondary)", fontSize: "var(--text-body-lg)" }}>
                Premium, calm, teacher-led emotional skills interface
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-white border-2 border-[var(--lumi-neutral-200)] hover:border-[var(--lumi-sky-300)] transition-all"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/components">
                <SecondaryButton>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    <span>Components</span>
                  </div>
                </SecondaryButton>
              </Link>
            </div>
          </div>

          {/* Color System */}
          <section className="space-y-8">
            <div>
              <h2 style={{ color: "var(--lumi-text-primary)" }}>Color System</h2>
              <p style={{ color: "var(--lumi-text-secondary)" }}>
                Soft, calming colors optimized for children aged 4–6
              </p>
            </div>

            {/* Primary Sky Blue */}
            <div className="space-y-4">
              <h3 style={{ color: "var(--lumi-text-primary)" }}>Primary Sky Blue</h3>
              <div className="grid grid-cols-7 gap-4">
                {[
                  { name: "Sky 50", var: "--lumi-sky-50", hex: "#F0F9FF" },
                  { name: "Sky 100", var: "--lumi-sky-100", hex: "#E0F2FE" },
                  { name: "Sky 200", var: "--lumi-sky-200", hex: "#B0E0F5" },
                  { name: "Sky 300", var: "--lumi-sky-300", hex: "#87CEEB" },
                  { name: "Sky 400", var: "--lumi-sky-400", hex: "#6BB6D9" },
                  { name: "Sky 500", var: "--lumi-sky-500", hex: "#4F9EC7" },
                  { name: "Sky 600", var: "--lumi-sky-600", hex: "#3A7CA8" },
                ].map((color) => (
                  <div key={color.name} className="space-y-2">
                    <div
                      className="h-24 rounded-[var(--radius-md)]"
                      style={{
                        backgroundColor: `var(${color.var})`,
                        boxShadow: "var(--shadow-sm)",
                      }}
                    />
                    <div>
                      <p style={{ fontSize: "var(--text-body-sm)", color: "var(--lumi-text-primary)" }}>
                        {color.name}
                      </p>
                      <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                        {color.hex}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Neutral Backgrounds */}
            <div className="space-y-4">
              <h3 style={{ color: "var(--lumi-text-primary)" }}>Neutral Backgrounds & Surfaces</h3>
              <div className="grid grid-cols-7 gap-4">
                {[
                  { name: "Neutral 0", var: "--lumi-neutral-0", hex: "#FFFFFF" },
                  { name: "Neutral 50", var: "--lumi-neutral-50", hex: "#FAFBFC" },
                  { name: "Neutral 100", var: "--lumi-neutral-100", hex: "#F5F7F9" },
                  { name: "Neutral 200", var: "--lumi-neutral-200", hex: "#E5E9ED" },
                  { name: "Neutral 300", var: "--lumi-neutral-300", hex: "#D1D7DD" },
                  { name: "Neutral 400", var: "--lumi-neutral-400", hex: "#B8C1C9" },
                  { name: "Neutral 500", var: "--lumi-neutral-500", hex: "#8A96A3" },
                ].map((color) => (
                  <div key={color.name} className="space-y-2">
                    <div
                      className="h-24 rounded-[var(--radius-md)] border-2"
                      style={{
                        backgroundColor: `var(${color.var})`,
                        borderColor: "var(--lumi-neutral-200)",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    />
                    <div>
                      <p style={{ fontSize: "var(--text-body-sm)", color: "var(--lumi-text-primary)" }}>
                        {color.name}
                      </p>
                      <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                        {color.hex}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accent Warm Glow */}
            <div className="space-y-4">
              <h3 style={{ color: "var(--lumi-text-primary)" }}>Accent Warm Glow</h3>
              <div className="grid grid-cols-6 gap-4">
                {[
                  { name: "Warm 50", var: "--lumi-warm-50", hex: "#FFF8F0" },
                  { name: "Warm 100", var: "--lumi-warm-100", hex: "#FFECD6" },
                  { name: "Warm 200", var: "--lumi-warm-200", hex: "#FFD6A5" },
                  { name: "Warm 300", var: "--lumi-warm-300", hex: "#FFB366" },
                  { name: "Warm 400", var: "--lumi-warm-400", hex: "#FF9E4D" },
                  { name: "Warm 500", var: "--lumi-warm-500", hex: "#F58A35" },
                ].map((color) => (
                  <div key={color.name} className="space-y-2">
                    <div
                      className="h-24 rounded-[var(--radius-md)]"
                      style={{
                        backgroundColor: `var(${color.var})`,
                        boxShadow: "var(--shadow-sm)",
                      }}
                    />
                    <div>
                      <p style={{ fontSize: "var(--text-body-sm)", color: "var(--lumi-text-primary)" }}>
                        {color.name}
                      </p>
                      <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                        {color.hex}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Semantic Colors */}
            <div className="space-y-4">
              <h3 style={{ color: "var(--lumi-text-primary)" }}>Semantic Colors</h3>
              <div className="grid grid-cols-4 gap-6">
                <div className="space-y-3">
                  <div
                    className="h-24 rounded-[var(--radius-md)] flex items-center justify-center"
                    style={{ backgroundColor: "var(--lumi-success)", boxShadow: "var(--shadow-sm)" }}
                  >
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <p style={{ fontSize: "var(--text-body-sm)", color: "var(--lumi-text-primary)" }}>
                    Success
                  </p>
                </div>
                <div className="space-y-3">
                  <div
                    className="h-24 rounded-[var(--radius-md)] flex items-center justify-center"
                    style={{ backgroundColor: "var(--lumi-warning)", boxShadow: "var(--shadow-sm)" }}
                  >
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <p style={{ fontSize: "var(--text-body-sm)", color: "var(--lumi-text-primary)" }}>
                    Warning
                  </p>
                </div>
                <div className="space-y-3">
                  <div
                    className="h-24 rounded-[var(--radius-md)] flex items-center justify-center"
                    style={{ backgroundColor: "var(--lumi-error)", boxShadow: "var(--shadow-sm)" }}
                  >
                    <span className="text-3xl">✕</span>
                  </div>
                  <p style={{ fontSize: "var(--text-body-sm)", color: "var(--lumi-text-primary)" }}>
                    Error
                  </p>
                </div>
                <div className="space-y-3">
                  <div
                    className="h-24 rounded-[var(--radius-md)] flex items-center justify-center"
                    style={{ backgroundColor: "var(--lumi-info)", boxShadow: "var(--shadow-sm)" }}
                  >
                    <span className="text-3xl">ℹ️</span>
                  </div>
                  <p style={{ fontSize: "var(--text-body-sm)", color: "var(--lumi-text-primary)" }}>
                    Info
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Typography Scale */}
          <section className="space-y-8">
            <div>
              <h2 style={{ color: "var(--lumi-text-primary)" }}>Typography Scale</h2>
              <p style={{ color: "var(--lumi-text-secondary)" }}>
                Clear hierarchy optimized for readability on smartboards
              </p>
            </div>

            <div
              className="p-8 rounded-[var(--radius-lg)]"
              style={{ backgroundColor: "var(--lumi-neutral-0)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="space-y-8">
                <div className="flex items-baseline gap-8 pb-4 border-b-2" style={{ borderColor: "var(--lumi-neutral-200)" }}>
                  <div className="w-32">
                    <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                      H1
                    </p>
                  </div>
                  <div className="flex-1">
                    <h1>The quick brown fox jumps over the lazy dog</h1>
                  </div>
                  <div className="text-right">
                    <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                      40px / Semibold / 1.25
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-8 pb-4 border-b-2" style={{ borderColor: "var(--lumi-neutral-200)" }}>
                  <div className="w-32">
                    <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                      H2
                    </p>
                  </div>
                  <div className="flex-1">
                    <h2>The quick brown fox jumps over the lazy dog</h2>
                  </div>
                  <div className="text-right">
                    <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                      32px / Semibold / 1.25
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-8 pb-4 border-b-2" style={{ borderColor: "var(--lumi-neutral-200)" }}>
                  <div className="w-32">
                    <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                      H3
                    </p>
                  </div>
                  <div className="flex-1">
                    <h3>The quick brown fox jumps over the lazy dog</h3>
                  </div>
                  <div className="text-right">
                    <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                      24px / Medium / 1.5
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-8 pb-4 border-b-2" style={{ borderColor: "var(--lumi-neutral-200)" }}>
                  <div className="w-32">
                    <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                      H4
                    </p>
                  </div>
                  <div className="flex-1">
                    <h4>The quick brown fox jumps over the lazy dog</h4>
                  </div>
                  <div className="text-right">
                    <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                      20px / Medium / 1.5
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-8 pb-4 border-b-2" style={{ borderColor: "var(--lumi-neutral-200)" }}>
                  <div className="w-32">
                    <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                      Body Large
                    </p>
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: "var(--text-body-lg)" }}>
                      The quick brown fox jumps over the lazy dog
                    </p>
                  </div>
                  <div className="text-right">
                    <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                      18px / Normal / 1.75
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-8 pb-4 border-b-2" style={{ borderColor: "var(--lumi-neutral-200)" }}>
                  <div className="w-32">
                    <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                      Body
                    </p>
                  </div>
                  <div className="flex-1">
                    <p>The quick brown fox jumps over the lazy dog</p>
                  </div>
                  <div className="text-right">
                    <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                      16px / Normal / 1.75
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-8 pb-4 border-b-2" style={{ borderColor: "var(--lumi-neutral-200)" }}>
                  <div className="w-32">
                    <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                      Body Small
                    </p>
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: "var(--text-body-sm)" }}>
                      The quick brown fox jumps over the lazy dog
                    </p>
                  </div>
                  <div className="text-right">
                    <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                      14px / Normal / 1.5
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-8">
                  <div className="w-32">
                    <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                      Small
                    </p>
                  </div>
                  <div className="flex-1">
                    <small>The quick brown fox jumps over the lazy dog</small>
                  </div>
                  <div className="text-right">
                    <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                      12px / Normal / 1.5
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Spacing Scale */}
          <section className="space-y-8">
            <div>
              <h2 style={{ color: "var(--lumi-text-primary)" }}>Spacing Scale (8pt Grid)</h2>
              <p style={{ color: "var(--lumi-text-secondary)" }}>
                Consistent rhythm for breathable layouts
              </p>
            </div>

            <div
              className="p-8 rounded-[var(--radius-lg)]"
              style={{ backgroundColor: "var(--lumi-neutral-0)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="space-y-4">
                {[
                  { name: "spacing-1", value: "8px", var: "--spacing-1" },
                  { name: "spacing-2", value: "16px", var: "--spacing-2" },
                  { name: "spacing-3", value: "24px", var: "--spacing-3" },
                  { name: "spacing-4", value: "32px", var: "--spacing-4" },
                  { name: "spacing-5", value: "40px", var: "--spacing-5" },
                  { name: "spacing-6", value: "48px", var: "--spacing-6" },
                  { name: "spacing-7", value: "56px", var: "--spacing-7" },
                  { name: "spacing-8", value: "64px", var: "--spacing-8" },
                ].map((space) => (
                  <div key={space.name} className="flex items-center gap-6">
                    <div className="w-32">
                      <p style={{ fontSize: "var(--text-body-sm)", color: "var(--lumi-text-secondary)" }}>
                        {space.name}
                      </p>
                    </div>
                    <div
                      className="h-8 rounded"
                      style={{
                        width: `var(${space.var})`,
                        backgroundColor: "var(--lumi-sky-300)",
                      }}
                    />
                    <p style={{ fontSize: "var(--text-body-sm)", color: "var(--lumi-text-tertiary)" }}>
                      {space.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Elevation System */}
          <section className="space-y-8">
            <div>
              <h2 style={{ color: "var(--lumi-text-primary)" }}>Elevation System</h2>
              <p style={{ color: "var(--lumi-text-secondary)" }}>
                Subtle shadows for depth and hierarchy
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8">
              {[
                { name: "Extra Small", var: "--shadow-xs" },
                { name: "Small", var: "--shadow-sm" },
                { name: "Medium", var: "--shadow-md" },
                { name: "Large", var: "--shadow-lg" },
                { name: "Extra Large", var: "--shadow-xl" },
                { name: "2X Large", var: "--shadow-2xl" },
              ].map((shadow) => (
                <div key={shadow.name} className="space-y-3">
                  <div
                    className="h-32 rounded-[var(--radius-md)] flex items-center justify-center"
                    style={{
                      backgroundColor: "var(--lumi-neutral-0)",
                      boxShadow: `var(${shadow.var})`,
                    }}
                  >
                    <p style={{ fontSize: "var(--text-body-sm)", color: "var(--lumi-text-secondary)" }}>
                      {shadow.name}
                    </p>
                  </div>
                  <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)", textAlign: "center" }}>
                    {shadow.var}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <div
                  className="h-32 rounded-[var(--radius-md)] flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--lumi-sky-300)",
                    boxShadow: "var(--shadow-glow)",
                  }}
                >
                  <p style={{ color: "white" }}>Sky Glow</p>
                </div>
                <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)", textAlign: "center" }}>
                  --shadow-glow
                </p>
              </div>
              <div className="space-y-3">
                <div
                  className="h-32 rounded-[var(--radius-md)] flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--lumi-warm-300)",
                    boxShadow: "var(--shadow-glow-warm)",
                  }}
                >
                  <p style={{ color: "white" }}>Warm Glow</p>
                </div>
                <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)", textAlign: "center" }}>
                  --shadow-glow-warm
                </p>
              </div>
            </div>
          </section>

          {/* State Variations */}
          <section className="space-y-8">
            <div>
              <h2 style={{ color: "var(--lumi-text-primary)" }}>State Variations</h2>
              <p style={{ color: "var(--lumi-text-secondary)" }}>
                Interactive states for buttons and controls
              </p>
            </div>

            <div
              className="p-8 rounded-[var(--radius-lg)]"
              style={{ backgroundColor: "var(--lumi-neutral-0)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="space-y-8">
                <div className="space-y-4">
                  <h4 style={{ color: "var(--lumi-text-primary)" }}>Primary Button States</h4>
                  <div className="flex gap-4">
                    <PrimaryButton>Default</PrimaryButton>
                    <PrimaryButton className="opacity-90">Hover (90%)</PrimaryButton>
                    <PrimaryButton className="opacity-80 scale-[0.98]">Active (80% + Scale)</PrimaryButton>
                    <PrimaryButton disabled>Disabled (50%)</PrimaryButton>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 style={{ color: "var(--lumi-text-primary)" }}>Secondary Button States</h4>
                  <div className="flex gap-4">
                    <SecondaryButton>Default</SecondaryButton>
                    <SecondaryButton className="border-[var(--lumi-sky-300)] bg-[var(--lumi-neutral-50)]">
                      Hover
                    </SecondaryButton>
                    <SecondaryButton className="scale-[0.98]">Active</SecondaryButton>
                    <SecondaryButton disabled>Disabled</SecondaryButton>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 style={{ color: "var(--lumi-text-primary)" }}>Firm Calm Button States</h4>
                  <div className="flex gap-4">
                    <FirmCalmButton>Default</FirmCalmButton>
                    <FirmCalmButton className="opacity-90">Hover</FirmCalmButton>
                    <FirmCalmButton className="opacity-80 scale-[0.98]">Active</FirmCalmButton>
                    <FirmCalmButton disabled>Disabled</FirmCalmButton>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Border Radius */}
          <section className="space-y-8">
            <div>
              <h2 style={{ color: "var(--lumi-text-primary)" }}>Border Radius</h2>
              <p style={{ color: "var(--lumi-text-secondary)" }}>
                Soft, friendly corners throughout the interface
              </p>
            </div>

            <div className="grid grid-cols-5 gap-6">
              {[
                { name: "Extra Small", value: "8px", var: "--radius-xs" },
                { name: "Small", value: "16px", var: "--radius-sm" },
                { name: "Medium", value: "24px", var: "--radius-md" },
                { name: "Large", value: "32px", var: "--radius-lg" },
                { name: "Extra Large", value: "40px", var: "--radius-xl" },
              ].map((radius) => (
                <div key={radius.name} className="space-y-3">
                  <div
                    className="h-32 flex items-center justify-center"
                    style={{
                      backgroundColor: "var(--lumi-sky-300)",
                      borderRadius: `var(${radius.var})`,
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <p style={{ color: "white", fontSize: "var(--text-body-sm)" }}>
                      {radius.value}
                    </p>
                  </div>
                  <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)", textAlign: "center" }}>
                    {radius.name}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Touch Targets */}
          <section className="space-y-8">
            <div>
              <h2 style={{ color: "var(--lumi-text-primary)" }}>Touch Targets</h2>
              <p style={{ color: "var(--lumi-text-secondary)" }}>
                Optimized for iPad and smartboard interaction
              </p>
            </div>

            <div
              className="p-8 rounded-[var(--radius-lg)]"
              style={{ backgroundColor: "var(--lumi-neutral-0)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div
                    className="flex items-center justify-center bg-[var(--lumi-sky-300)] text-white rounded-[var(--radius-md)]"
                    style={{ width: "var(--touch-target-min)", height: "var(--touch-target-min)" }}
                  >
                    56px
                  </div>
                  <div>
                    <p style={{ color: "var(--lumi-text-primary)" }}>Minimum Touch Target</p>
                    <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                      Required for iPad/smartboard accessibility
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div
                    className="flex items-center justify-center bg-[var(--lumi-sky-300)] text-white rounded-[var(--radius-md)]"
                    style={{ width: "var(--touch-target-comfortable)", height: "var(--touch-target-comfortable)" }}
                  >
                    64px
                  </div>
                  <div>
                    <p style={{ color: "var(--lumi-text-primary)" }}>Comfortable Touch Target</p>
                    <p style={{ fontSize: "var(--text-small)", color: "var(--lumi-text-tertiary)" }}>
                      Recommended for primary actions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Design Principles */}
          <section className="space-y-8">
            <div>
              <h2 style={{ color: "var(--lumi-text-primary)" }}>Design Principles</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div
                className="p-6 rounded-[var(--radius-lg)]"
                style={{ backgroundColor: "var(--lumi-neutral-0)", boxShadow: "var(--shadow-sm)" }}
              >
                <h4 style={{ color: "var(--lumi-text-primary)", marginBottom: "var(--spacing-2)" }}>
                  Calm & Safe
                </h4>
                <p style={{ fontSize: "var(--text-body-sm)", color: "var(--lumi-text-secondary)" }}>
                  Soft colors, generous spacing, and gentle animations create a secure environment for emotional learning.
                </p>
              </div>

              <div
                className="p-6 rounded-[var(--radius-lg)]"
                style={{ backgroundColor: "var(--lumi-neutral-0)", boxShadow: "var(--shadow-sm)" }}
              >
                <h4 style={{ color: "var(--lumi-text-primary)", marginBottom: "var(--spacing-2)" }}>
                  Voice-First
                </h4>
                <p style={{ fontSize: "var(--text-body-sm)", color: "var(--lumi-text-secondary)" }}>
                  Minimal text on kid-facing areas. Teacher provides verbal guidance with visual support.
                </p>
              </div>

              <div
                className="p-6 rounded-[var(--radius-lg)]"
                style={{ backgroundColor: "var(--lumi-neutral-0)", boxShadow: "var(--shadow-sm)" }}
              >
                <h4 style={{ color: "var(--lumi-text-primary)", marginBottom: "var(--spacing-2)" }}>
                  Touch-Optimized
                </h4>
                <p style={{ fontSize: "var(--text-body-sm)", color: "var(--lumi-text-secondary)" }}>
                  56px+ touch targets, clear visual hierarchy, and generous spacing for young children.
                </p>
              </div>

              <div
                className="p-6 rounded-[var(--radius-lg)]"
                style={{ backgroundColor: "var(--lumi-neutral-0)", boxShadow: "var(--shadow-sm)" }}
              >
                <h4 style={{ color: "var(--lumi-text-primary)", marginBottom: "var(--spacing-2)" }}>
                  Professional & Warm
                </h4>
                <p style={{ fontSize: "var(--text-body-sm)", color: "var(--lumi-text-secondary)" }}>
                  Premium aesthetics that feel professional for educators while remaining approachable for children.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
