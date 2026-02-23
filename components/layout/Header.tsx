"use client";

import { RefreshCw, Menu } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useSidebar } from "./SidebarContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [spinning, setSpinning] = useState(false);
  const { open } = useSidebar();

  const refresh = useCallback(() => {
    setSpinning(true);
    router.refresh();
    setTimeout(() => {
      setLastRefreshed(new Date());
      setSpinning(false);
    }, 600);
  }, [router]);

  useEffect(() => {
    const stored = localStorage.getItem("pmSettings");
    const settings = stored ? JSON.parse(stored) : {};
    const interval = settings.refreshInterval ?? 0;
    if (!interval) return;
    const id = setInterval(refresh, interval * 1000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <header className="flex items-center justify-between px-4 py-4 border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={open}
          className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-xs text-zinc-500">
          Refreshed {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
        </span>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${spinning ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </header>
  );
}
