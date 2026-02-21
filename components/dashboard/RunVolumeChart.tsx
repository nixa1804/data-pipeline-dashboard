"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DataPoint {
  date: string;
  success: number;
  failed: number;
  skipped: number;
}

interface RunVolumeChartProps {
  data: DataPoint[];
}

export default function RunVolumeChart({ data }: RunVolumeChartProps) {
  return (
    <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">Run Volume — Last 7 days</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Successful, failed and skipped runs per day</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1c2128",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#e4e4e7",
            }}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "#a1a1aa", paddingTop: "12px" }}
          />
          <Bar dataKey="success" name="Success" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
          <Bar dataKey="failed" name="Failed" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
          <Bar dataKey="skipped" name="Skipped" stackId="a" fill="#3f3f46" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
