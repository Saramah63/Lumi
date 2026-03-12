import { NextRequest, NextResponse } from "next/server";
import { getSessionReport, insertSessionReport, isDatabaseConfigured, listSessionReports } from "../../../../lib/db";

type ReportPayload = {
  sessionId?: string | null;
  sessionDate: string;
  scenarioId: string;
  scenarioTitle: string;
  mode: string;
  groupSize: number;
  participants: number;
  durationSeconds?: number | null;
  durationLabel?: string | null;
  emotionsBefore?: Record<string, number>;
  emotionsAfter?: Record<string, number>;
  dominantEmotionBefore?: string | null;
  dominantEmotionAfter?: string | null;
  engagementLevel?: string | null;
  calmingSupportUsed?: boolean;
  sessionCompleted?: boolean;
  practicedSkill?: string | null;
  nextSteps?: string | null;
  safetyNotes?: string | null;
  teacherNotes?: string | null;
};

const allowedEmotions = ["happy", "sad", "angry", "scared"];
const safeText = (value: string | null | undefined, max = 4000) =>
  value ? value.toString().slice(0, max) : null;

function sanitizeEmotions(obj: Record<string, number> | undefined) {
  if (!obj) return {};
  const out: Record<string, number> = {};
  allowedEmotions.forEach((k) => {
    const v = Number(obj[k] ?? 0);
    out[k] = Number.isFinite(v) ? Math.max(0, v) : 0;
  });
  return out;
}

function dominantEmotion(counts: Record<string, number> | undefined) {
  if (!counts) return null;
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = entries[0];
  if (!top || top[1] === 0) return null;
  const second = entries[1];
  if (second && second[1] === top[1]) return null;
  return allowedEmotions.includes(top[0]) ? top[0] : null;
}

export async function POST(req: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ ok: false, skipped: true, reason: "database_not_configured" }, { status: 200 });
    }
    const body = (await req.json()) as ReportPayload;
    if (!body.sessionDate || !body.scenarioId || !body.scenarioTitle || !body.mode || !body.groupSize) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }
    const emotionsBefore = sanitizeEmotions(body.emotionsBefore);
    const emotionsAfter = sanitizeEmotions(body.emotionsAfter);
    const payload = {
      session_id: body.sessionId ?? null,
      session_date: new Date(body.sessionDate).toISOString(),
      scenario_id: safeText(body.scenarioId, 120) ?? "",
      scenario_title: safeText(body.scenarioTitle, 240) ?? "",
      mode: safeText(body.mode, 32) ?? "group",
      group_size: Number(body.groupSize) || 0,
      participants: Math.min(Number(body.participants) || 0, Number(body.groupSize) || 0),
      duration_seconds: body.durationSeconds ?? null,
      duration_label: safeText(body.durationLabel ?? null, 24),
      emotions_before: emotionsBefore,
      emotions_after: emotionsAfter,
      dominant_emotion_before: dominantEmotion(emotionsBefore),
      dominant_emotion_after: dominantEmotion(emotionsAfter),
      engagement_level: body.engagementLevel ?? null,
      calming_support_used: body.calmingSupportUsed ?? false,
      session_completed: body.sessionCompleted ?? false,
      practiced_skill: safeText(body.practicedSkill, 240),
      next_steps: safeText(body.nextSteps, 1000),
      safety_notes: safeText(body.safetyNotes, 1000),
      teacher_notes: safeText(body.teacherNotes, 2000),
    };
    const row = await insertSessionReport(payload);
    return NextResponse.json({ ok: true, id: row.id });
  } catch (error) {
    console.error("session-report POST error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ ok: true, reports: [], skipped: true, reason: "database_not_configured" });
    }
    const { searchParams } = req.nextUrl;
    const format = searchParams.get("format");
    const id = searchParams.get("id");
    if (id) {
      const row = await getSessionReport(id);
      if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
      return NextResponse.json({ ok: true, report: row });
    }
    const rows = await listSessionReports();
    if (format === "csv") {
      const header = [
        "id",
        "session_date",
        "scenario_id",
        "scenario_title",
        "mode",
        "group_size",
        "participants",
        "duration_seconds",
        "duration_label",
        "dominant_emotion_before",
        "dominant_emotion_after",
        "engagement_level",
        "calming_support_used",
        "session_completed",
      ];
      const csv = [
        header.join(","),
        ...rows.map((r) =>
          header
            .map((key) => {
              const v = (r as any)[key];
              if (v == null) return "";
              const s = typeof v === "string" ? v.replace(/\"/g, '\"\"') : v.toString();
              return s.includes(",") ? `"${s}"` : s;
            })
            .join(",")
        ),
      ].join("\n");
      return new NextResponse(csv, {
        status: 200,
        headers: { "Content-Type": "text/csv; charset=utf-8" },
      });
    }
    return NextResponse.json({ ok: true, reports: rows });
  } catch (error) {
    console.error("session-report GET error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
