import { ScenarioRunner } from "../../components/ScenarioRunner";

export default function LumiPage() {
  return (
    <main className="relative h-screen overflow-hidden bg-[#040913] text-white">
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
      <div className="relative mx-auto h-full min-h-0 w-full max-w-[1100px] px-4 py-4 md:px-8 md:py-6">
        <ScenarioRunner />
      </div>
    </main>
  );
}
