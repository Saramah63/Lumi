import { ScenarioRunner } from "../../components/ScenarioRunner";

export default function LumiPage() {
  return (
    <main className="relative h-screen overflow-hidden bg-[#040913] text-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(1200px 740px at 32% 60%, rgba(120,180,255,0.12) 0%, rgba(5,9,19,0) 68%), radial-gradient(900px 620px at 78% 30%, rgba(190,160,255,0.12) 0%, rgba(5,9,19,0) 72%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(140% 110% at 50% 52%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 52%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.25) 25%, transparent 26%, transparent 74%, rgba(255,255,255,0.25) 75%, transparent 76%)",
          backgroundSize: "4px 4px",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(2px 2px at 10% 20%, rgba(255,255,255,0.35), transparent), radial-gradient(2px 2px at 80% 30%, rgba(255,255,255,0.3), transparent), radial-gradient(2px 2px at 55% 70%, rgba(255,255,255,0.28), transparent), radial-gradient(3px 3px at 30% 40%, rgba(160,200,255,0.25), transparent)",
        }}
      />
      <div className="relative mx-auto h-full min-h-0 w-full max-w-[1100px] px-4 py-4 md:px-8 md:py-6">
        <ScenarioRunner />
      </div>
    </main>
  );
}
