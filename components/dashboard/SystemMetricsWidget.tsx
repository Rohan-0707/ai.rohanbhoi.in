"use client";

import { useCallback, useEffect, useState } from "react";
import { useSocket } from "@/components/providers/SocketProvider";

type MetricsState = {
  apiStatus: "ok" | "degraded" | "checking";
  socketLatencyMs: number | null;
  lastSyncLabel: string;
};

function formatLastSync(date: Date | null): string {
  if (!date) {
    return "Syncing...";
  }

  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSec < 60) {
    return "<1 min ago";
  }

  const diffMin = Math.floor(diffSec / 60);
  return `${diffMin} min ago`;
}

export function SystemMetricsWidget() {
  const { isConnected } = useSocket();
  const [metrics, setMetrics] = useState<MetricsState>({
    apiStatus: "checking",
    socketLatencyMs: null,
    lastSyncLabel: "Syncing...",
  });

  const pollHealth = useCallback(async () => {
    const started = performance.now();

    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      const latency = Math.round(performance.now() - started);

      if (!response.ok) {
        setMetrics({
          apiStatus: "degraded",
          socketLatencyMs: isConnected ? latency : null,
          lastSyncLabel: formatLastSync(new Date()),
        });
        return;
      }

      setMetrics({
        apiStatus: "ok",
        socketLatencyMs: isConnected ? Math.max(latency, 12) : null,
        lastSyncLabel: formatLastSync(new Date()),
      });
    } catch {
      setMetrics({
        apiStatus: "degraded",
        socketLatencyMs: null,
        lastSyncLabel: "Unavailable",
      });
    }
  }, [isConnected]);

  useEffect(() => {
    void pollHealth();
    const interval = window.setInterval(() => void pollHealth(), 30000);
    return () => window.clearInterval(interval);
  }, [pollHealth]);

  useEffect(() => {
    if (isConnected) {
      void pollHealth();
    }
  }, [isConnected, pollHealth]);

  return (
    <div className="hidden items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/50 px-3 py-2 backdrop-blur-md xl:flex">
      <MetricPill
        label="API"
        value={metrics.apiStatus === "ok" ? "OK" : metrics.apiStatus === "checking" ? "..." : "DEG"}
        dotColor={
          metrics.apiStatus === "ok"
            ? "bg-emerald-400"
            : metrics.apiStatus === "checking"
              ? "bg-slate-500"
              : "bg-ops-amber"
        }
        pulse={metrics.apiStatus === "ok"}
      />
      <span className="h-4 w-px bg-slate-800" />
      <MetricPill
        label="Socket"
        value={
          isConnected && metrics.socketLatencyMs !== null
            ? `${metrics.socketLatencyMs}ms`
            : isConnected
              ? "Live"
              : "—"
        }
        dotColor={isConnected ? "bg-emerald-400" : "bg-ops-amber"}
        pulse={isConnected}
      />
      <span className="h-4 w-px bg-slate-800" />
      <div className="px-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">
          Last Sync
        </p>
        <p className="text-xs font-semibold tabular-nums tracking-wide text-slate-300">
          {metrics.lastSyncLabel}
        </p>
      </div>
    </div>
  );
}

function MetricPill({
  label,
  value,
  dotColor,
  pulse = false,
}: {
  label: string;
  value: string;
  dotColor: string;
  pulse?: boolean;
}) {
  return (
    <div className="px-1">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">
        {label}
      </p>
      <p className="flex items-center gap-1.5 text-xs font-semibold tabular-nums tracking-wide text-slate-200">
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColor} ${
            pulse ? "animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.7)]" : ""
          }`}
        />
        {value}
      </p>
    </div>
  );
}
