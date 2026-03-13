import { fetchInsights } from "../../../lib/db";
import { InsightsCharts } from "../../../components/admin/InsightsCharts";

export const dynamic = "force-dynamic";

function formatDuration(seconds: number) {
  if (!seconds || Number.isNaN(seconds)) return "–";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default async function LumiInsightsPage() {
  const insights = await fetchInsights().catch(() => null);
  const totals = insights?.totals;
  const negativeBefore =
    (insights?.emotionsBefore.sad ?? 0) + (insights?.emotionsBefore.angry ?? 0) + (insights?.emotionsBefore.afraid ?? 0);
  const negativeAfter =
    (insights?.emotionsAfter.sad ?? 0) + (insights?.emotionsAfter.angry ?? 0) + (insights?.emotionsAfter.afraid ?? 0);
  const shift =
    negativeBefore > 0 ? Math.round(((negativeBefore - negativeAfter) / negativeBefore) * 100) : negativeAfter === 0 ? 0 : -100;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-slate-100">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Lumi Insights</h1>
          <p className="text-sm text-slate-300">Pilottien ryhmätason kooste. Ei henkilötietoja.</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/lumi/session-report?format=json"
            className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-600"
          >
            Export JSON
          </a>
          <a
            href="/api/lumi/session-report?format=csv"
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
          >
            Export CSV
          </a>
        </div>
      </div>

      {insights ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Istuntoja" value={totals?.sessions ?? 0} />
            <StatCard title="Lapset tavoitettu" value={totals?.childrenReached ?? 0} />
            <StatCard
              title="Keskimääräinen ryhmäkoko"
              value={totals ? totals.avgGroupSize.toFixed(1) : "0"}
            />
            <StatCard title="Keskimääräinen kesto" value={formatDuration(totals?.avgDurationSeconds ?? 0)} />
          </div>

          <div className="mt-6">
            <InsightsCharts
              scenarioUsage={insights.scenarioUsage}
              emotionsBefore={insights.emotionsBefore}
              emotionsAfter={insights.emotionsAfter}
              engagement={insights.engagement}
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-black/30">
              <p className="text-sm font-semibold text-slate-100">Emotional shift</p>
              <p className="text-3xl font-bold text-emerald-300">
                {shift === 0 ? "0%" : `${shift > 0 ? "−" : "+"}${Math.abs(shift)}%`}
              </p>
              <p className="text-xs text-slate-300">
                Negatiiviset tunteet ennen: {negativeBefore} • jälkeen: {negativeAfter}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-black/30">
            <p className="pb-2 text-sm font-semibold text-slate-100">Viimeisimmät istunnot</p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-white/10 text-left text-slate-300">
                  <tr>
                    <th className="px-2 py-2">Päivä</th>
                    <th className="px-2 py-2">Skenaario</th>
                    <th className="px-2 py-2">Ryhmä</th>
                    <th className="px-2 py-2">Osallistujat</th>
                    <th className="px-2 py-2">Ennen</th>
                    <th className="px-2 py-2">Jälkeen</th>
                    <th className="px-2 py-2">Osallistuminen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-100">
                  {insights.recent.map((r) => (
                    <tr key={r.id}>
                      <td className="px-2 py-2">{new Date(r.session_date).toLocaleDateString("fi-FI")}</td>
                      <td className="px-2 py-2">{r.scenario_title}</td>
                      <td className="px-2 py-2">{r.group_size}</td>
                      <td className="px-2 py-2">{r.participants ?? "–"}</td>
                      <td className="px-2 py-2">{r.dominant_emotion_before ?? "–"}</td>
                      <td className="px-2 py-2">{r.dominant_emotion_after ?? "–"}</td>
                      <td className="px-2 py-2">{r.engagement_level ?? "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-200 shadow-lg shadow-black/30">
          Tietoja ei voitu hakea (tarkista tietokantayhteys).
        </div>
      )}

      <p className="mt-8 text-xs text-slate-400">
        Ei henkilötietoja tallenneta. Kaikki tiedot ovat ryhmätasoisia. / No personal child data is stored. All observations are
        collected at group level only.
      </p>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-black/30">
      <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
