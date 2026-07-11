"use client";

import { useState } from "react";
import { HomePlanSection } from "@/components/HomePlanSection";
import { PlanHistory } from "@/components/dashboard/PlanHistory";

type DashboardTab = "generate" | "history";

export function DashboardWorkspace() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("generate");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  function handlePlanGenerated() {
    setHistoryRefreshKey((current) => current + 1);
  }

  return (
    <div className="space-y-6">
      <section className="ops-panel-elevated">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Active Sector
            </p>
            <h2 className="ops-heading mt-1 text-2xl sm:text-3xl">
              Monsoon Command Console
            </h2>
            <p className="ops-subtext mt-2 max-w-2xl">
              Deploy GenAI survival plans, monitor jury alerts, and review your
              operational action history from a single terminal.
            </p>
          </div>
          <div className="ops-badge-amber">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-ops-amber" />
            Live Ops
          </div>
        </div>
      </section>

      <div
        role="tablist"
        aria-label="Dashboard sections"
        className="inline-flex w-full rounded-xl border border-slate-800/80 bg-slate-900/50 p-1 backdrop-blur-md sm:w-auto"
      >
        {(
          [
            { id: "generate", label: "Plan Generator" },
            { id: "history", label: "Action History" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`monsoon-touch-target flex-1 rounded-lg px-5 py-3 text-sm font-semibold tracking-wide transition-all duration-200 sm:flex-none ${
              activeTab === tab.id
                ? "bg-ops-teal text-white shadow-ops-glow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "generate" ? (
        <HomePlanSection onPlanGenerated={handlePlanGenerated} />
      ) : (
        <section>
          <div className="mb-5">
            <h3 className="ops-heading text-lg">System Action History</h3>
            <p className="ops-subtext mt-1">
              Archived deployment analyses, ordered by most recent execution.
            </p>
          </div>
          <PlanHistory refreshKey={historyRefreshKey} />
        </section>
      )}
    </div>
  );
}
