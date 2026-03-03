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

  const maxVal = Math.max(
    ...data.map((d) => d.success + d.failed + d.skipped),
    1
  );

  const barSlot = cW / data.length;
  const barPad = barSlot * 0.3;
  const bW = barSlot - barPad;
  const bottomY = pt + cH;

  const yAt = (v: number) => pt + cH - (v / maxVal) * cH;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    val: Math.round(maxVal * f),
    y: yAt(maxVal * f),
  }));

  return (
    <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">Run Volume — Last 7 days</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Successful, failed and skipped runs per day
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
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

        {data.map((d, i) => {
          const x = pl + i * barSlot + barPad / 2;
          const successH = (d.success / maxVal) * cH;
          const failedH = (d.failed / maxVal) * cH;
          const skippedH = (d.skipped / maxVal) * cH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={bottomY - successH}
                width={bW}
                height={successH}
                fill="#10b981"
              />
              <rect
                x={x}
                y={bottomY - successH - failedH}
                width={bW}
                height={failedH}
                fill="#ef4444"
              />
              <rect
                x={x}
                y={bottomY - successH - failedH - skippedH}
                width={bW}
                height={skippedH}
                fill="#3f3f46"
                rx="2"
                ry="2"
              />
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
            fontSize="10"
          >
            {d.date.split(",")[0]}
          </text>
        ))}
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
