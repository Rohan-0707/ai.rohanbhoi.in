"use client";

import { IconCheck, IconLock } from "@/components/dashboard/OpsIcons";

const MODULES = [
  { id: 1, label: "System Core Architecture", status: "passed" as const },
  { id: 2, label: "Jury Mode Alert Pipeline", status: "passed" as const },
  { id: 3, label: "GenAI Survival Engine", status: "passed" as const },
  { id: 4, label: "Secure App Shell & OTP", status: "active" as const },
  { id: 5, label: "Crypto-Privacy Layer", status: "upcoming" as const },
] as const;

type ModuleTrackerProps = {
  variant?: "horizontal" | "sidebar";
};

export function ModuleTracker({ variant = "horizontal" }: ModuleTrackerProps) {
  if (variant === "sidebar") {
    return (
      <div className="px-4 py-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Module Status
        </p>
        <ol className="space-y-3">
          {MODULES.map((module) => (
            <li key={module.id} className="flex items-start gap-2.5">
              <ModuleIndicator status={module.status} compact />
              <div className="min-w-0">
                <p
                  className={`text-xs font-semibold leading-tight ${
                    module.status === "active"
                      ? "text-teal-300"
                      : module.status === "upcoming"
                        ? "text-slate-500"
                        : "text-slate-300"
                  }`}
                >
                  M{module.id}
                </p>
                <p
                  className={`mt-0.5 text-[11px] leading-snug ${
                    module.status === "upcoming" ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  {module.label}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="sticky top-14 z-20 border-b border-slate-800/80 bg-slate-950/70 py-3 backdrop-blur-md">
      <div className="ops-page-padding flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Ops Timeline
        </span>
        <div className="flex min-w-max items-center gap-2">
          {MODULES.map((module, index) => (
            <div key={module.id} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-all duration-200 ${
                  module.status === "active"
                    ? "border-ops-teal/50 bg-ops-teal/10 shadow-ops-active"
                    : module.status === "passed"
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-slate-800/80 bg-slate-900/40"
                }`}
              >
                <ModuleIndicator status={module.status} />
                <div className="whitespace-nowrap">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      module.status === "active"
                        ? "text-teal-300"
                        : module.status === "upcoming"
                          ? "text-slate-600"
                          : "text-emerald-400/80"
                    }`}
                  >
                    Module {module.id}
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      module.status === "upcoming" ? "text-slate-600" : "text-slate-300"
                    }`}
                  >
                    {module.label}
                  </p>
                </div>
              </div>
              {index < MODULES.length - 1 && (
                <span
                  aria-hidden
                  className={`h-px w-4 shrink-0 ${
                    module.status === "passed" ? "bg-emerald-500/30" : "bg-slate-800"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModuleIndicator({
  status,
  compact = false,
}: {
  status: "passed" | "active" | "upcoming";
  compact?: boolean;
}) {
  const size = compact ? "h-5 w-5" : "h-6 w-6";

  if (status === "passed") {
    return (
      <span
        className={`${size} flex shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400`}
      >
        <IconCheck className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      </span>
    );
  }

  if (status === "active") {
    return (
      <span
        className={`${size} relative flex shrink-0 items-center justify-center rounded-full border border-ops-teal/50 bg-ops-teal/20`}
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-ops-teal/30" />
        <span className="relative h-2 w-2 rounded-full bg-ops-teal shadow-ops-glow" />
      </span>
    );
  }

  return (
    <span
      className={`${size} flex shrink-0 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/60 text-slate-600`}
    >
      <IconLock className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
    </span>
  );
}
