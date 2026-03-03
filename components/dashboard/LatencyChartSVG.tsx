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

  return (
    <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">Latency Trend — Last 24 h</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Avg and P95 pipeline execution time</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
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
