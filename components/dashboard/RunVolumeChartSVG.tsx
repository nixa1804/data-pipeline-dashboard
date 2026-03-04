"use client";

import { useState } from "react";

interface DataPoint {
  date: string;
  success: number;
  failed: number;
  skipped: number;
}

export default function RunVolumeChartSVG({ data }: { data: DataPoint[] }) {
  const W = 600;
  const H = 220;
  const pl = 40;
  const pr = 10;
  const pt = 10;
  const pb = 30;
  const cW = W - pl - pr;
  const cH = H - pt - pb;

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = Math.max(
    ...data.map((d) => d.success + d.failed + d.skipped),
    1
  );

  const barSlot = cW / data.length;
  const barPad = barSlot * 0.3;
  const bW = barSlot - barPad;
  const bottomY = pt + cH;
  const r = 3;

  const yAt = (v: number) => pt + cH - (v / maxVal) * cH;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    val: Math.round(maxVal * f),
    y: yAt(maxVal * f),
  }));

  const tipW = 118;
  const tipH = 72;

  return (
    <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">Run Volume — Last 7 days</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Successful, failed and skipped runs per day
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
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

        {hoveredIdx !== null && (
          <rect
            x={pl + hoveredIdx * barSlot}
            y={pt}
            width={barSlot}
            height={cH}
            fill="white"
            fillOpacity="0.04"
            style={{ pointerEvents: "none" }}
          />
        )}

        {data.map((d, i) => {
          const x = pl + i * barSlot + barPad / 2;
          const successH = (d.success / maxVal) * cH;
          const failedH = (d.failed / maxVal) * cH;
          const skippedH = (d.skipped / maxVal) * cH;
          const totalH = successH + failedH + skippedH;
          if (totalH <= 0) return null;

          const segs: { y: number; h: number; color: string }[] = [];
          let accY = bottomY;
          for (const item of [
            { h: successH, color: "#10b981" },
            { h: failedH, color: "#ef4444" },
            { h: skippedH, color: "#3f3f46" },
          ]) {
            if (item.h > 0) {
              segs.push({ y: accY - item.h, h: item.h, color: item.color });
              accY -= item.h;
            }
          }

          return (
            <g key={i}>
              {segs.map((seg, si) => {
                const isTop = si === segs.length - 1;
                if (isTop) {
                  const coverH = Math.min(r, seg.h);
                  return (
                    <g key={si}>
                      <rect x={x} y={seg.y} width={bW} height={seg.h} rx={r} fill={seg.color} />
                      <rect x={x} y={seg.y + seg.h - coverH} width={bW} height={coverH} fill={seg.color} />
                    </g>
                  );
                }
                return <rect key={si} x={x} y={seg.y} width={bW} height={seg.h + 1} fill={seg.color} />;
              })}
            </g>
          );
        })}

        {yTicks.map(({ val, y }, idx) => (
          <text
            key={idx}
            x={pl - 6}
            y={y + 4}
            textAnchor="end"
            fill="#71717a"
            fontSize="10"
          >
            {val}
          </text>
        ))}

        {data.map((d, i) => (
          <text
            key={i}
            x={pl + i * barSlot + barSlot / 2}
            y={H - 4}
            textAnchor="middle"
            fill="#71717a"
            fontSize="13"
          >
            {d.date.split(", ")[1] ?? d.date}
          </text>
        ))}

        {/* transparent hit areas per bar slot */}
        {data.map((_, i) => (
          <rect
            key={`hit-${i}`}
            x={pl + i * barSlot}
            y={pt}
            width={barSlot}
            height={cH}
            fill="transparent"
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{ cursor: "default" }}
          />
        ))}

        {/* tooltip */}
        {hoveredIdx !== null && (() => {
          const d = data[hoveredIdx];
          const cx = pl + hoveredIdx * barSlot + barSlot / 2;
          const tipX = Math.min(Math.max(cx - tipW / 2, pl), W - pr - tipW);
          const tipY = pt + 4;
          return (
            <g style={{ pointerEvents: "none" }}>
              <rect x={tipX} y={tipY} width={tipW} height={tipH} fill="#1a2030" rx="5" stroke="#ffffff18" strokeWidth="1" />
              <text x={tipX + 10} y={tipY + 16} fill="#a1a1aa" fontSize="10" fontWeight="600">{d.date.split(",")[0]}</text>
              <rect x={tipX + 10} y={tipY + 25} width={7} height={7} fill="#10b981" rx="1" />
              <text x={tipX + 21} y={tipY + 32} fill="#e4e4e7" fontSize="10">Success: {d.success}</text>
              <rect x={tipX + 10} y={tipY + 40} width={7} height={7} fill="#ef4444" rx="1" />
              <text x={tipX + 21} y={tipY + 47} fill="#e4e4e7" fontSize="10">Failed: {d.failed}</text>
              <rect x={tipX + 10} y={tipY + 55} width={7} height={7} fill="#3f3f46" rx="1" />
              <text x={tipX + 21} y={tipY + 62} fill="#e4e4e7" fontSize="10">Skipped: {d.skipped}</text>
            </g>
          );
        })()}
      </svg>

      <div className="flex items-center gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" />
          Success
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-500" />
          Failed
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <span className="inline-block w-3 h-3 rounded-sm bg-zinc-600" />
          Skipped
        </span>
      </div>
    </div>
  );
}
