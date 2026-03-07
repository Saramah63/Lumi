"use client";

import { useEffect, useMemo, useState } from "react";
import { LumiAvatar } from "../../../components/LumiAvatar";
import type { GlowState, MouthState } from "../../../lib/lumi/types";
import {
  LUMI_FULL_BASE_PATH,
  LUMI_FULL_FILES,
  LUMI_FX_BASE_PATH,
  LUMI_FX_FILES,
} from "../../../lib/lumi/layerPaths";

type CheckResult = {
  path: string;
  ok: boolean;
  status: number;
};

export default function LumiAssetsPage() {
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [mouthState, setMouthState] = useState<MouthState>(0);
  const [lightIntensity, setLightIntensity] = useState(0.4);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [glowState, setGlowState] = useState<GlowState>("calm");

  useEffect(() => {
    let cancelled = false;

    const runChecks = async () => {
      const results: CheckResult[] = [];

      for (const rel of LUMI_FULL_FILES) {
        const url = `${LUMI_FULL_BASE_PATH}/${rel}`;
        try {
          const res = await fetch(url, { method: "HEAD", cache: "no-store" });
          results.push({ path: `lumi_full/${rel}`, ok: res.status === 200, status: res.status });
        } catch {
          results.push({ path: `lumi_full/${rel}`, ok: false, status: 0 });
        }
      }

      for (const rel of LUMI_FX_FILES) {
        const url = `${LUMI_FX_BASE_PATH}/${rel}`;
        try {
          const res = await fetch(url, { method: "HEAD", cache: "no-store" });
          results.push({ path: `lumi_fx/${rel}`, ok: res.status === 200, status: res.status });
        } catch {
          results.push({ path: `lumi_fx/${rel}`, ok: false, status: 0 });
        }
      }

      if (!cancelled) {
        setChecks(results);
      }
    };

    void runChecks();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const okCount = checks.filter((c) => c.ok).length;
    return { okCount, total: checks.length };
  }, [checks]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-semibold">Lumi Full SVG Debug</h1>
          <p className="text-sm text-slate-600 mt-1">
            Base paths: <code>{LUMI_FULL_BASE_PATH}</code> and <code>{LUMI_FX_BASE_PATH}</code>
          </p>
          <p className="text-sm mt-2">
            Loaded: <strong>{summary.okCount}</strong> / <strong>{summary.total}</strong>
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
          <div className="min-h-[460px] flex items-center justify-center">
            <LumiAvatar
              isSpeaking={isSpeaking}
              mouthState={mouthState}
              audioIntensity={lightIntensity}
              glowState={glowState}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mouth State</label>
              <select
                value={mouthState}
                onChange={(e) => setMouthState(Number(e.target.value) as MouthState)}
                className="h-11 w-full rounded-xl border border-slate-300 px-3"
              >
                <option value={0}>0 REST</option>
                <option value={1}>1 OPEN</option>
                <option value={2}>2 WIDE</option>
                <option value={3}>3 ROUND</option>
                <option value={4}>4 CLOSED</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Glow Intensity: {lightIntensity.toFixed(2)}</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={lightIntensity}
                onChange={(e) => setLightIntensity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Glow State</label>
              <select
                value={glowState}
                onChange={(e) => setGlowState(e.target.value as GlowState)}
                className="h-11 w-full rounded-xl border border-slate-300 px-3"
              >
                <option value="calm">calm</option>
                <option value="alert">alert</option>
                <option value="strong">strong</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsSpeaking((v) => !v)}
              className="h-11 rounded-xl bg-slate-800 px-4 text-white font-medium"
            >
              Toggle Speaking ({String(isSpeaking)})
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold mb-3">Full SVG Path Checks (HEAD)</h2>
          <div className="grid gap-2">
            {checks.map((c) => (
              <div key={c.path} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm">
                <span className="font-mono">{c.path}</span>
                <span className={c.ok ? "text-emerald-700" : "text-red-700"}>
                  {c.ok ? `OK (${c.status})` : `FAIL (${c.status || "ERR"})`}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
