"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [spinning, setSpinning] = useState(false);

  function handleRefresh() {
    setSpinning(true);
    setTimeout(() => {
      setLastRefreshed(new Date());
      setSpinning(false);
    }, 600);
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-sm sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-zinc-500">
          Refreshed{" "}
          {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
        </span>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${spinning ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </header>
  );
}
