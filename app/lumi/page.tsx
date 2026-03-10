import { ScenarioRunner } from "../../components/ScenarioRunner";

export default function LumiPage() {
  return (
    <main className="relative h-screen overflow-hidden bg-[#060915] text-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(1200px 820px at 32% 62%, rgba(126,231,255,0.12) 0%, rgba(6,9,21,0) 70%), radial-gradient(1000px 660px at 76% 28%, rgba(182,156,255,0.1) 0%, rgba(6,9,21,0) 74%), linear-gradient(180deg, #060915 0%, #10162b 52%, #131c3a 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(140% 118% at 50% 50%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.008) 52%, rgba(0,0,0,0.7) 100%)",
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
            "radial-gradient(2px 2px at 10% 20%, rgba(255,255,255,0.32), transparent), radial-gradient(2px 2px at 80% 30%, rgba(182,156,255,0.26), transparent), radial-gradient(2px 2px at 55% 70%, rgba(111,170,255,0.22), transparent), radial-gradient(3px 3px at 30% 40%, rgba(109,93,252,0.18), transparent)",
        }}
      />
      <div className="relative mx-auto h-full min-h-0 w-full max-w-[1220px] px-4 py-4 md:px-8 md:py-6">
        <ScenarioRunner />
      </div>
    </main>
  );
}
