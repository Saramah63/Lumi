import { isDatabaseConfigured, listSessionReports } from "../../../lib/db";

export const dynamic = "force-dynamic";

export default async function LumiReportsAdmin() {
  const reports = isDatabaseConfigured() ? await listSessionReports(100) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 text-slate-100">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Lumi-raportit</h1>
          <p className="text-sm text-slate-300">Yhteenvetojen lista pilotointia ja tutkimusta varten.</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/lumi/session-report?format=json"
            className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-600"
          >
            Lataa JSON
          </a>
          <a
            href="/api/lumi/session-report?format=csv"
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
          >
            Lataa CSV
          </a>
        </div>
      </div>

      {!isDatabaseConfigured() ? (
        <p className="text-sm text-slate-300">Tietokantaa ei ole määritetty. Lisää `DATABASE_URL` nähdäksesi raportit.</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-slate-300">Ei tallennettuja raportteja.</p>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-slate-300">Istuntoja: {reports.length}</div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 shadow-lg shadow-black/30">
            <div className="grid grid-cols-9 gap-3 border-b border-white/10 px-4 py-2 text-xs font-semibold uppercase text-slate-300">
              <div>Päivä</div>
              <div>Skenaario</div>
              <div>Ryhmä</div>
              <div>Osallistujat</div>
              <div>Ennen</div>
              <div>Jälkeen</div>
              <div>Osallistuminen</div>
              <div>Muistiinpanot</div>
              <div>ID</div>
            </div>
            <div className="divide-y divide-white/5">
              {reports.map((r) => (
                <div key={r.id} className="grid grid-cols-9 gap-3 px-4 py-3 text-sm text-slate-100">
                  <div className="truncate">{new Date(r.session_date).toLocaleDateString("fi-FI")}</div>
                  <div className="truncate" title={r.scenario_title}>
                    {r.scenario_title}
                  </div>
                  <div>{r.group_size}</div>
                  <div>{r.participants ?? "–"}</div>
                  <div className="truncate">{r.dominant_emotion_before ?? "–"}</div>
                  <div className="truncate">{r.dominant_emotion_after ?? "–"}</div>
                  <div className="truncate">{r.engagement_level ?? "–"}</div>
                  <div className="truncate" title={r.teacher_notes ?? ""}>
                    {r.teacher_notes ? r.teacher_notes.slice(0, 24) + (r.teacher_notes.length > 24 ? "…" : "") : "–"}
                  </div>
                  <div className="truncate" title={r.id}>
                    {r.id.slice(0, 8)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <p className="mt-6 text-xs text-slate-400">
        Ei henkilötietoja tallenneta. Kaikki havainnot kerätään vain ryhmätasolla.
      </p>
    </div>
  );
}
