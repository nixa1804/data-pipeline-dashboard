"use client";

import { useState } from "react";

interface DataPoint {
  hour: string;
  latencyMs: number;
  p95Ms: number;
}

function formatMs(ms: number): string {
  if (ms === 0) return "0";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function LatencyChartSVG({ data }: { data: DataPoint[] }) {
  const W = 600;
  const H = 220;
  const pl = 52;
  const pr = 10;
  const pt = 10;
  const pb = 28;
  const cW = W - pl - pr;
  const cH = H - pt - pb;

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = Math.max(...data.map((d) => Math.max(d.latencyMs, d.p95Ms)), 100);

  const xAt = (i: number) =>
    data.length > 1 ? pl + (i / (data.length - 1)) * cW : pl + cW / 2;
  const yAt = (v: number) => pt + cH - (v / maxVal) * cH;

  const avgLinePts = data.map((d, i) => `${xAt(i)},${yAt(d.latencyMs)}`).join(" ");
  const p95LinePts = data.map((d, i) => `${xAt(i)},${yAt(d.p95Ms)}`).join(" ");

  const avgArea =
    `M ${xAt(0)} ${yAt(data[0].latencyMs)} ` +
    data.map((d, i) => `L ${xAt(i)} ${yAt(d.latencyMs)}`).join(" ") +
    ` L ${xAt(data.length - 1)} ${pt + cH} L ${xAt(0)} ${pt + cH} Z`;

  const p95Area =
    `M ${xAt(0)} ${yAt(data[0].p95Ms)} ` +
    data.map((d, i) => `L ${xAt(i)} ${yAt(d.p95Ms)}`).join(" ") +
    ` L ${xAt(data.length - 1)} ${pt + cH} L ${xAt(0)} ${pt + cH} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    val: Math.round(maxVal * f),
    y: yAt(maxVal * f),
  }));

  const xLabels = data.filter((_, i) => i % 4 === 0);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    let closest = 0;
    let minDist = Infinity;
    data.forEach((_, i) => {
      const dist = Math.abs(xAt(i) - svgX);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setHoveredIdx(closest);
  };

  const tipW = 130;
  const tipH = 58;

  return (
    <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">Latency Trend — Last 24 h</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Avg and P95 pipeline execution time</p>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          <linearGradient id="svgGradAvg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="95%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="svgGradP95" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity="0.2" />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map(({ y }, idx) => (
          <line
            key={idx}
            x1={pl}
            y1={y}
            x2={W - pr}
            y2={y}
            stroke="#ffffff08"
            strokeDasharray="3 3"
          />
        ))}

        <path d={avgArea} fill="url(#svgGradAvg)" />
        <path d={p95Area} fill="url(#svgGradP95)" />

        <polyline
          points={avgLinePts}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <polyline
          points={p95LinePts}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          strokeLinejoin="round"
        />

        {yTicks.map(({ val, y }, idx) => (
          <text
            key={idx}
            x={pl - 6}
            y={y + 4}
            textAnchor="end"
            fill="#71717a"
            fontSize="10"
          >
            {formatMs(val)}
          </text>
        ))}

        {xLabels.map((d) => {
          const idx = data.indexOf(d);
          return (
            <text
              key={idx}
              x={xAt(idx)}
              y={H - 4}
              textAnchor="middle"
              fill="#71717a"
              fontSize="10"
            >
              {d.hour}
            </text>
          );
        })}

        {/* hover crosshair + tooltip */}
        {hoveredIdx !== null && (() => {
          const d = data[hoveredIdx];
          const cx = xAt(hoveredIdx);
          const tipX = Math.min(Math.max(cx - tipW / 2, pl), W - pr - tipW);
          const tipY = pt + 4;
          return (
            <g>
              <line x1={cx} y1={pt} x2={cx} y2={pt + cH} stroke="#ffffff25" strokeWidth="1" />
              <circle cx={cx} cy={yAt(d.latencyMs)} r="3.5" fill="#6366f1" />
              <circle cx={cx} cy={yAt(d.p95Ms)} r="3.5" fill="#f59e0b" />
              <rect x={tipX} y={tipY} width={tipW} height={tipH} fill="#1a2030" rx="5" stroke="#ffffff18" strokeWidth="1" />
              <text x={tipX + 10} y={tipY + 16} fill="#a1a1aa" fontSize="10" fontWeight="600">{d.hour}</text>
              <circle cx={tipX + 13} cy={tipY + 30} r="3" fill="#6366f1" />
              <text x={tipX + 21} y={tipY + 34} fill="#e4e4e7" fontSize="10">Avg: {formatMs(d.latencyMs)}</text>
              <circle cx={tipX + 13} cy={tipY + 47} r="3" fill="#f59e0b" />
              <text x={tipX + 21} y={tipY + 51} fill="#e4e4e7" fontSize="10">P95: {formatMs(d.p95Ms)}</text>
            </g>
          );
        })()}

        {/* transparent hit area */}
        <rect x={pl} y={pt} width={cW} height={cH} fill="transparent" />
      </svg>

      <div className="flex items-center gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <span className="inline-block w-4 h-0.5 bg-indigo-500 rounded" />
          Avg latency
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <span
            className="inline-block w-4"
            style={{ borderTop: "1.5px dashed #f59e0b" }}
          />
          P95 latency
        </span>
      </div>
    </div>
  );
}
