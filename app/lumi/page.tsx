import { ScenarioRunner } from "../../components/ScenarioRunner";

export default function LumiPage() {
  return (
    <main className="relative h-screen overflow-hidden bg-[#0B1020] text-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(1200px 780px at 30% 60%, rgba(125,199,255,0.16) 0%, rgba(11,16,32,0) 68%), radial-gradient(980px 640px at 78% 28%, rgba(182,156,255,0.14) 0%, rgba(11,16,32,0) 72%), linear-gradient(180deg, #0B1020 0%, #141B3A 55%, #1A2452 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(140% 118% at 50% 50%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 52%, rgba(0,0,0,0.58) 100%)",
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
      <div className="relative mx-auto h-full min-h-0 w-full max-w-[1100px] px-4 py-4 md:px-8 md:py-6">
        <ScenarioRunner />
      </div>
    </main>
  );
}
