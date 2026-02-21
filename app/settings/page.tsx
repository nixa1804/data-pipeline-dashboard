"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Check } from "lucide-react";

interface Settings {
  refreshInterval: number;
  successThreshold: number;
  latencySla: number;
}

const DEFAULTS: Settings = {
  refreshInterval: 0,
  successThreshold: 90,
  latencySla: 5000,
};

const REFRESH_OPTIONS = [
  { label: "Off", value: 0 },
  { label: "15 seconds", value: 15 },
  { label: "30 seconds", value: 30 },
  { label: "1 minute", value: 60 },
  { label: "5 minutes", value: 300 },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("pmSettings");
    if (stored) setSettings({ ...DEFAULTS, ...JSON.parse(stored) });
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem("pmSettings", JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <Header title="Settings" />
      <main className="flex-1 px-6 py-6 space-y-4 max-w-xl">
        <div className="flex items-center justify-end h-5">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Check className="w-3 h-3" />
              Saved
            </span>
          )}
        </div>

        <div className="bg-[#161b22] border border-white/5 rounded-xl divide-y divide-white/5">
          <div className="px-5 py-4">
            <h2 className="text-sm font-semibold text-white">Display</h2>
          </div>

          <div className="px-5 py-4 flex items-center justify-between gap-6">
            <div>
              <p className="text-sm text-zinc-300">Auto-refresh interval</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Automatically reload data at a set interval
              </p>
            </div>
            <select
              value={settings.refreshInterval}
              onChange={(e) => update("refreshInterval", Number(e.target.value))}
              className="bg-[#0d1117] border border-white/10 text-zinc-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500/50"
            >
              {REFRESH_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-[#161b22] border border-white/5 rounded-xl divide-y divide-white/5">
          <div className="px-5 py-4">
            <h2 className="text-sm font-semibold text-white">Thresholds</h2>
          </div>

          <div className="px-5 py-4 flex items-center justify-between gap-6">
            <div>
              <p className="text-sm text-zinc-300">Success rate warning</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Show amber warning below this percentage
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={settings.successThreshold}
                onChange={(e) =>
                  update("successThreshold", Number(e.target.value))
                }
                className="w-20 bg-[#0d1117] border border-white/10 text-zinc-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500/50 tabular-nums"
              />
              <span className="text-sm text-zinc-500">%</span>
            </div>
          </div>

          <div className="px-5 py-4 flex items-center justify-between gap-6">
            <div>
              <p className="text-sm text-zinc-300">Latency SLA</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Flag runs exceeding this duration
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                step={500}
                value={settings.latencySla}
                onChange={(e) => update("latencySla", Number(e.target.value))}
                className="w-24 bg-[#0d1117] border border-white/10 text-zinc-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500/50 tabular-nums"
              />
              <span className="text-sm text-zinc-500">ms</span>
            </div>
          </div>
        </div>

        <div className="bg-[#161b22] border border-white/5 rounded-xl divide-y divide-white/5">
          <div className="px-5 py-4">
            <h2 className="text-sm font-semibold text-white">About</h2>
          </div>
          <div className="px-5 py-4 space-y-2 text-xs text-zinc-500">
            <div className="flex justify-between">
              <span>Version</span>
              <span className="text-zinc-400">0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span>Database</span>
              <span className="text-zinc-400 font-mono">PostgreSQL 16</span>
            </div>
            <div className="flex justify-between">
              <span>Framework</span>
              <span className="text-zinc-400">Next.js 16 · Prisma 7</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
