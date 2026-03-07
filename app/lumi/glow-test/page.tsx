import Image from "next/image";

const items = [
  { id: "calm", label: "Glow Calm", src: "/lumi_fx/Glow_Calm.svg" },
  { id: "alert", label: "Glow Alert", src: "/lumi_fx/Glow_Alert.svg" },
  { id: "strong", label: "Glow Strong", src: "/lumi_fx/Glow_Strong.svg" },
];

export default function GlowTestPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040913] text-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(900px 540px at 35% 60%, rgba(70,130,210,0.08) 0%, rgba(5,9,19,0) 72%)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(140% 100% at 50% 50%, transparent 52%, rgba(0,0,0,0.35) 100%)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.25) 25%, transparent 26%, transparent 74%, rgba(255,255,255,0.25) 75%, transparent 76%)",
          backgroundSize: "4px 4px",
        }}
      />

      <div className="relative mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Lumi Glow Test</h1>
            <p className="text-sm text-slate-300">Glow assets at 100% opacity on current background.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-cyan-100/20 bg-white/[0.04] p-4">
              <p className="text-sm font-medium text-slate-200">{item.label}</p>
              <div className="mt-4 flex items-center justify-center rounded-xl border border-cyan-100/10 bg-slate-950/60 p-4">
                <Image src={item.src} alt={item.label} width={420} height={420} priority />
              </div>
              <p className="mt-3 text-xs text-slate-400">{item.src}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-cyan-100/15 bg-slate-900/50 p-4 text-sm text-slate-200">
          <p className="font-medium">Design notes (export guidance)</p>
          <ul className="mt-2 list-disc pl-5 text-slate-300">
            <li>Glow localized around antenna bubble, not full body haze.</li>
            <li>Two-layer glow: core dot + halo ring (radial gradient).</li>
            <li>Calm: small halo, lower saturation/opacity.</li>
            <li>Alert: medium halo, stronger core.</li>
            <li>Strong: brightest core + larger halo, still localized.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
