"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ScenarioUsage = { scenario_id: string; scenario_title: string; count: number };

type Props = {
  scenarioUsage: ScenarioUsage[];
  emotionsBefore: Record<string, number>;
  emotionsAfter: Record<string, number>;
  engagement: Array<{ level: string; count: number }>;
};

const emotionOrder = [
  { key: "happy", label: "🙂 Iloinen", color: "#2DD4BF" },
  { key: "sad", label: "😢 Surullinen", color: "#60A5FA" },
  { key: "angry", label: "😠 Vihainen", color: "#F87171" },
  { key: "scared", label: "😨 Pelokas", color: "#A78BFA" },
];

export function InsightsCharts({ scenarioUsage, emotionsBefore, emotionsAfter, engagement }: Props) {
  const emotionDataBefore = emotionOrder.map((e) => ({ name: e.label, value: emotionsBefore?.[e.key] ?? 0, fill: e.color }));
  const emotionDataAfter = emotionOrder.map((e) => ({ name: e.label, value: emotionsAfter?.[e.key] ?? 0, fill: e.color }));
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
                    <cell key={index} fill={entry.fill} />
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
                    <cell key={index} fill={entry.fill} />
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
