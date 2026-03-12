import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  pool = new Pool({
    connectionString,
    max: 5,
    ssl: { rejectUnauthorized: false },
  });
  return pool;
}

export async function ensureSessionReportsTable() {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      CREATE TABLE IF NOT EXISTS lumi_session_reports (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id text UNIQUE,
        session_date timestamptz NOT NULL,
        scenario_id text NOT NULL,
        scenario_title text NOT NULL,
        mode text NOT NULL,
        group_size integer NOT NULL,
        participants integer NOT NULL,
        duration_seconds integer,
        duration_label text,
        emotions_before jsonb,
        emotions_after jsonb,
        dominant_emotion_before text,
        dominant_emotion_after text,
        engagement_level text,
        calming_support_used boolean,
        session_completed boolean,
        practiced_skill text,
        next_steps text,
        safety_notes text,
        teacher_notes text,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_lumi_session_reports_date ON lumi_session_reports (session_date DESC);
    `);
  } finally {
    client.release();
  }
}

export type SessionReportRow = {
  id: string;
  session_id: string | null;
  session_date: string;
  scenario_id: string;
  scenario_title: string;
  mode: string;
  group_size: number;
  participants: number;
  duration_seconds: number | null;
  duration_label: string | null;
  emotions_before: Record<string, number> | null;
  emotions_after: Record<string, number> | null;
  dominant_emotion_before: string | null;
  dominant_emotion_after: string | null;
  engagement_level: string | null;
  calming_support_used: boolean | null;
  session_completed: boolean | null;
  practiced_skill: string | null;
  next_steps: string | null;
  safety_notes: string | null;
  teacher_notes: string | null;
  created_at: string;
};

export async function insertSessionReport(payload: Omit<SessionReportRow, "id" | "created_at">) {
  await ensureSessionReportsTable();
  const client = await getPool().connect();
  try {
    const res = await client.query<SessionReportRow>(
      `
      INSERT INTO lumi_session_reports (
        session_id,
        session_date,
        scenario_id,
        scenario_title,
        mode,
        group_size,
        participants,
        duration_seconds,
        duration_label,
        emotions_before,
        emotions_after,
        dominant_emotion_before,
        dominant_emotion_after,
        engagement_level,
        calming_support_used,
        session_completed,
        practiced_skill,
        next_steps,
        safety_notes,
        teacher_notes
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
      )
      ON CONFLICT (session_id) DO UPDATE SET
        session_date = EXCLUDED.session_date,
        scenario_id = EXCLUDED.scenario_id,
        scenario_title = EXCLUDED.scenario_title,
        mode = EXCLUDED.mode,
        group_size = EXCLUDED.group_size,
        participants = EXCLUDED.participants,
        duration_seconds = EXCLUDED.duration_seconds,
        duration_label = EXCLUDED.duration_label,
        emotions_before = EXCLUDED.emotions_before,
        emotions_after = EXCLUDED.emotions_after,
        dominant_emotion_before = EXCLUDED.dominant_emotion_before,
        dominant_emotion_after = EXCLUDED.dominant_emotion_after,
        engagement_level = EXCLUDED.engagement_level,
        calming_support_used = EXCLUDED.calming_support_used,
        session_completed = EXCLUDED.session_completed,
        practiced_skill = EXCLUDED.practiced_skill,
        next_steps = EXCLUDED.next_steps,
        safety_notes = EXCLUDED.safety_notes,
        teacher_notes = EXCLUDED.teacher_notes
      RETURNING *;
    `,
      [
        payload.session_id,
        payload.session_date,
        payload.scenario_id,
        payload.scenario_title,
        payload.mode,
        payload.group_size,
        payload.participants,
        payload.duration_seconds,
        payload.duration_label,
        payload.emotions_before,
        payload.emotions_after,
        payload.dominant_emotion_before,
        payload.dominant_emotion_after,
        payload.engagement_level,
        payload.calming_support_used,
        payload.session_completed,
        payload.practiced_skill,
        payload.next_steps,
        payload.safety_notes,
        payload.teacher_notes,
      ]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

export async function listSessionReports(limit = 100) {
  await ensureSessionReportsTable();
  const res = await getPool().query<SessionReportRow>(
    `SELECT * FROM lumi_session_reports ORDER BY session_date DESC LIMIT $1`,
    [limit]
  );
  return res.rows;
}

export async function getSessionReport(id: string) {
  await ensureSessionReportsTable();
  const res = await getPool().query<SessionReportRow>(`SELECT * FROM lumi_session_reports WHERE id = $1`, [id]);
  return res.rows[0] ?? null;
}

export type InsightsData = {
  totals: {
    sessions: number;
    childrenReached: number;
    avgGroupSize: number;
    avgDurationSeconds: number;
  };
  scenarioUsage: Array<{ scenario_id: string; scenario_title: string; count: number }>;
  emotionsBefore: Record<string, number>;
  emotionsAfter: Record<string, number>;
  engagement: Array<{ level: string; count: number }>;
  recent: Array<{
    id: string;
    session_date: string;
    scenario_title: string;
    scenario_id: string;
    group_size: number;
    participants: number;
    dominant_emotion_before: string | null;
    dominant_emotion_after: string | null;
    engagement_level: string | null;
    duration_label: string | null;
  }>;
};

export async function fetchInsights(): Promise<InsightsData> {
  await ensureSessionReportsTable();
  const pool = getPool();
  const client = await pool.connect();
  try {
    const totalsRes = await client.query<{
      sessions: string;
      children: string;
      avg_group: string;
      avg_duration: string;
    }>(
      `SELECT COUNT(*) AS sessions,
              COALESCE(SUM(group_size),0) AS children,
              COALESCE(AVG(group_size),0) AS avg_group,
              COALESCE(AVG(duration_seconds),0) AS avg_duration
         FROM lumi_session_reports`
    );
    const totalsRow = totalsRes.rows[0];

    const scenarioRes = await client.query<{ scenario_id: string; scenario_title: string; count: string }>(
      `SELECT scenario_id, scenario_title, COUNT(*)::int AS count
         FROM lumi_session_reports
        GROUP BY scenario_id, scenario_title
        ORDER BY count DESC, scenario_title ASC`
    );

    const emotionKeys = ["happy", "sad", "angry", "scared"];
    const emotionSelect = (col: string) =>
      emotionKeys.map((k) => `COALESCE(SUM((${col} ->> '${k}')::int),0) AS ${k}`).join(", ");
    const emotionsBeforeRes = await client.query(`SELECT ${emotionSelect("emotions_before")} FROM lumi_session_reports`);
    const emotionsAfterRes = await client.query(`SELECT ${emotionSelect("emotions_after")} FROM lumi_session_reports`);

    const engagementRes = await client.query<{ level: string; count: string }>(
      `SELECT COALESCE(engagement_level,'unknown') AS level, COUNT(*)::int AS count
         FROM lumi_session_reports
        GROUP BY level
        ORDER BY count DESC`
    );

    const recentRes = await client.query<InsightsData["recent"][number]>(
      `SELECT id, session_date, scenario_title, scenario_id, group_size, participants, dominant_emotion_before, dominant_emotion_after, engagement_level, duration_label
         FROM lumi_session_reports
        ORDER BY session_date DESC
        LIMIT 20`
    );

    const toNumber = (v: string | number | null | undefined) => Number(v ?? 0);
    return {
      totals: {
        sessions: toNumber(totalsRow.sessions),
        childrenReached: toNumber(totalsRow.children),
        avgGroupSize: toNumber(totalsRow.avg_group),
        avgDurationSeconds: toNumber(totalsRow.avg_duration),
      },
      scenarioUsage: scenarioRes.rows.map((r) => ({
        scenario_id: r.scenario_id,
        scenario_title: r.scenario_title,
        count: toNumber(r.count),
      })),
      emotionsBefore: emotionsBeforeRes.rows[0] ?? {},
      emotionsAfter: emotionsAfterRes.rows[0] ?? {},
      engagement: engagementRes.rows.map((r) => ({ level: r.level, count: toNumber(r.count) })),
      recent: recentRes.rows,
    };
  } finally {
    client.release();
  }
}
