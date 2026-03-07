"use client";

import { useEffect, useMemo, useState } from "react";

type SvgMeta = {
  path: string;
  ok: boolean;
  viewBox: string;
  width: string;
  height: string;
  error?: string;
};

const PATHS = [
  "/lumi_full/Lumi_REST.svg",
  "/lumi_full/Lumi_OPEN.svg",
  "/lumi_full/Lumi_WIDE.svg",
  "/lumi_full/Lumi_ROUND.svg",
  "/lumi_full/Lumi_CLOSED.svg",
  "/lumi_fx/Eyelids.svg",
];

function parseMeta(path: string, text: string): SvgMeta {
  const viewBox = text.match(/viewBox\\s*=\\s*\"([^\"]+)\"/i)?.[1] ?? "";
  const width = text.match(/width\\s*=\\s*\"([^\"]+)\"/i)?.[1] ?? "";
  const height = text.match(/height\\s*=\\s*\"([^\"]+)\"/i)?.[1] ?? "";
  return { path, ok: true, viewBox, width, height };
}

export default function SvgCheckPage() {
  const [rows, setRows] = useState<SvgMeta[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const result = await Promise.all(
        PATHS.map(async (path) => {
          try {
            const res = await fetch(path);
            if (!res.ok) {
              return { path, ok: false, viewBox: "", width: "", height: "", error: String(res.status) } as SvgMeta;
            }
            return parseMeta(path, await res.text());
          } catch (error) {
            return {
              path,
              ok: false,
              viewBox: "",
              width: "",
              height: "",
              error: error instanceof Error ? error.message : "fetch failed",
            } as SvgMeta;
          }
        })
      );
      if (!cancelled) setRows(result);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const mismatch = useMemo(() => {
    const okRows = rows.filter((r) => r.ok);
    if (okRows.length < 2) return false;
    const base = okRows[0];
    return okRows.some(
      (r) =>
        r.viewBox !== base.viewBox ||
        (r.width && base.width && r.width !== base.width) ||
        (r.height && base.height && r.height !== base.height)
    );
  }, [rows]);

  return (
    <main className="min-h-screen bg-[#050d1a] p-6 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-4">
        <h1 className="text-2xl font-semibold">Lumi SVG Check</h1>
        {mismatch ? (
          <div className="rounded-xl border border-amber-300/50 bg-amber-500/10 p-3 text-amber-200">
            SVG exports are inconsistent. Re-export all Lumi_* from same 1024x1024 frame.
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-3 text-emerald-200">
            Framing looks consistent.
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-cyan-100/20 bg-slate-900/50">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-cyan-100/20 text-slate-300">
              <tr>
                <th className="px-3 py-2">Path</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">viewBox</th>
                <th className="px-3 py-2">width</th>
                <th className="px-3 py-2">height</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.path} className="border-b border-cyan-100/10">
                  <td className="px-3 py-2">{row.path}</td>
                  <td className="px-3 py-2">{row.ok ? "200" : `ERR ${row.error ?? ""}`}</td>
                  <td className="px-3 py-2">{row.viewBox || "-"}</td>
                  <td className="px-3 py-2">{row.width || "-"}</td>
                  <td className="px-3 py-2">{row.height || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
