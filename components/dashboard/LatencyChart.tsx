"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DataPoint {
  hour: string;
  latencyMs: number;
  p95Ms: number;
}

interface LatencyChartProps {
  data: DataPoint[];
}

function formatMs(ms: number) {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export default function LatencyChart({ data }: LatencyChartProps) {
  return (
    <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">Latency Trend — Last 24 h</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Avg and P95 pipeline execution time</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradAvg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradP95" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis
            dataKey="hour"
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatMs}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1c2128",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#e4e4e7",
            }}
            formatter={(value: number | undefined, name: string | undefined) => [
              value != null ? formatMs(value) : "—",
              name === "latencyMs" ? "Avg" : "P95",
            ]}
            labelStyle={{ color: "#a1a1aa", marginBottom: "4px" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "#a1a1aa", paddingTop: "12px" }}
            formatter={(value) => (value === "latencyMs" ? "Avg latency" : "P95 latency")}
          />
          <Area
            type="monotone"
            dataKey="latencyMs"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#gradAvg)"
          />
          <Area
            type="monotone"
            dataKey="p95Ms"
            stroke="#f59e0b"
            strokeWidth={1.5}
            fill="url(#gradP95)"
            strokeDasharray="4 2"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
