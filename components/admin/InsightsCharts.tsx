"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LUMI_EMOTIONS } from "../../lib/lumi/emotions";

type ScenarioUsage = { scenario_id: string; scenario_title: string; count: number };

type Props = {
  scenarioUsage: ScenarioUsage[];
  emotionsBefore: Record<string, number>;
  emotionsAfter: Record<string, number>;
  engagement: Array<{ level: string; count: number }>;
};

const emotionColors: Record<string, string> = {
  happy: "#2DD4BF",
  sad: "#60A5FA",
  angry: "#F87171",
  afraid: "#A78BFA",
};

export function InsightsCharts({ scenarioUsage, emotionsBefore, emotionsAfter, engagement }: Props) {
  const emotionDataBefore = LUMI_EMOTIONS.map((emotion) => ({
    name: `${emotion.emoji} ${emotion.labelFi}`,
    value: emotionsBefore?.[emotion.key] ?? 0,
    fill: emotionColors[emotion.key],
  }));
  const emotionDataAfter = LUMI_EMOTIONS.map((emotion) => ({
    name: `${emotion.emoji} ${emotion.labelFi}`,
    value: emotionsAfter?.[emotion.key] ?? 0,
    fill: emotionColors[emotion.key],
  }));
  const engagementData = ["low", "medium", "high"].map((lvl) => ({
    level: lvl === "low" ? "Low" : lvl === "medium" ? "Medium" : "High",
    count: engagement.find((e) => e.level === lvl)?.count ?? 0,
  }));

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-black/30">
          <p className="pb-2 text-sm font-semibold text-slate-100">Skenaarioiden käyttö</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarioUsage} margin={{ left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="scenario_title" tick={{ fill: "#cbd5e1", fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
                <YAxis tick={{ fill: "#cbd5e1" }} />
                <Tooltip />
                <Bar dataKey="count" fill="#7EE7FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-black/30">
          <p className="pb-2 text-sm font-semibold text-slate-100">Osallistuminen</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData} margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="level" tick={{ fill: "#cbd5e1" }} />
                <YAxis tick={{ fill: "#cbd5e1" }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B7CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-black/30">
          <p className="pb-2 text-sm font-semibold text-slate-100">Tunteet ennen istuntoa</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie data={emotionDataBefore} dataKey="value" nameKey="name" outerRadius="85%">
                  {emotionDataBefore.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-black/30">
          <p className="pb-2 text-sm font-semibold text-slate-100">Tunteet istunnon jälkeen</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie data={emotionDataAfter} dataKey="value" nameKey="name" outerRadius="85%">
                  {emotionDataAfter.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
