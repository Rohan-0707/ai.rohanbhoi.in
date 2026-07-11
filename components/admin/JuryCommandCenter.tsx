"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { IconCloudRain, IconShield } from "@/components/dashboard/CitizenIcons";
import {
  IconCheck,
  IconPulse,
  IconTerminal,
} from "@/components/dashboard/OpsIcons";
import { SocketProvider, useSocket } from "@/components/providers/SocketProvider";

const PAGE_X = "px-[15px] md:px-[50px]";

const MODULES = [
  { id: 1, label: "System Core Architecture", status: "passed" as const },
  { id: 2, label: "Jury Mode Alert Pipeline", status: "passed" as const },
  { id: 3, label: "GenAI Survival Engine", status: "passed" as const },
  { id: 4, label: "Secure App Shell & OTP", status: "passed" as const },
  { id: 5, label: "Crypto-Privacy Layer", status: "passed" as const },
] as const;

const EVALUATOR_LINKS = [
  { href: "/#quick-plan", label: "Quick Plan", desc: "Guest AI wizard" },
  { href: "/#weather-check", label: "Weather Check", desc: "PIN briefing" },
  { href: "/#realtime-alerts", label: "Live Alerts", desc: "Local + national" },
  { href: "/#get-started", label: "Sign In", desc: "Judge OTP" },
] as const;

type ServiceHealth = {
  web: "checking" | "ok" | "error";
  socket: "checking" | "ok" | "error";
};

type StatusState = ServiceHealth["web"];

function StatusDot({ state }: { state: StatusState }) {
  const color =
    state === "ok"
      ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.55)]"
      : state === "checking"
        ? "bg-amber-400 animate-pulse"
        : "bg-red-400";

  return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${color}`} />;
}

function JuryCommandCenterInner() {
  const { isConnected } = useSocket();
  const [health, setHealth] = useState<ServiceHealth>({
    web: "checking",
    socket: "checking",
  });
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [lastRecipients, setLastRecipients] = useState<number | null>(null);

  const checkHealth = useCallback(async () => {
    setHealth((current) => ({ ...current, web: "checking", socket: "checking" }));

    try {
      const webResponse = await fetch("/api/health", { cache: "no-store" });
      const webData = (await webResponse.json()) as { status?: string };

      setHealth((current) => ({
        ...current,
        web: webResponse.ok && webData.status === "ok" ? "ok" : "error",
      }));
    } catch {
      setHealth((current) => ({ ...current, web: "error" }));
    }

    try {
      const socketResponse = await fetch("/socket.io/?EIO=4&transport=polling", {
        cache: "no-store",
      });

      setHealth((current) => ({
        ...current,
        socket: socketResponse.ok ? "ok" : "error",
      }));
    } catch {
      setHealth((current) => ({ ...current, socket: "error" }));
    }
  }, []);

  useEffect(() => {
    void checkHealth();
    const interval = window.setInterval(() => void checkHealth(), 30_000);
    return () => window.clearInterval(interval);
  }, [checkHealth]);

  async function triggerDemoAlert() {
    setAlertLoading(true);
    setAlertMessage(null);

    try {
      const response = await fetch("/api/evaluator/demo-alert", {
        method: "POST",
        cache: "no-store",
      });
      const data = (await response.json()) as {
        ok?: boolean;
        phase?: string;
        recipients?: number;
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to broadcast alert");
      }

      setLastRecipients(data.recipients ?? 0);
      setAlertMessage(
        data.message ||
          `Live ${data.phase ?? ""} alert broadcast to ${data.recipients ?? 0} client(s).`,
      );
    } catch (error) {
      setAlertMessage(
        error instanceof Error ? error.message : "Could not trigger demo alert",
      );
    } finally {
      setAlertLoading(false);
    }
  }

  const passedCount = MODULES.filter((module) => module.status === "passed").length;

  const statusItems = [
    { label: "Web API", state: health.web, detail: health.web },
    {
      label: "Socket.io",
      state: isConnected ? "ok" : health.socket,
      detail: isConnected ? "connected" : health.socket,
    },
    {
      label: "Live clients",
      state: isConnected ? "ok" : "checking",
      detail: isConnected ? "connected" : "polling",
    },
    {
      label: "Modules shipped",
      state: "ok" as const,
      detail: `${passedCount}/${MODULES.length}`,
    },
  ] satisfies Array<{ label: string; state: StatusState; detail: string }>;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0B1120] text-white">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/monsoon-hero-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/88 to-[#070a13]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(20,184,166,0.12),transparent_45%)]" />
      </div>

      <header
        className={`relative z-10 flex w-full shrink-0 items-center justify-between border-b border-white/10 py-5 backdrop-blur-md ${PAGE_X}`}
      >
        <Link href="/" className="flex items-center gap-3">
          <IconCloudRain className="h-7 w-7 text-teal-400" />
          <div>
            <p className="text-base font-semibold text-white">JalVayu AI</p>
            <p className="text-xs text-slate-400">Jury ops console</p>
          </div>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-slate-400 transition hover:text-teal-300"
        >
          ← Landing
        </Link>
      </header>

      <main className={`relative z-10 flex w-full flex-1 flex-col ${PAGE_X}`}>
        <div className="flex w-full flex-col gap-8 border-b border-white/10 py-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:py-12">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-teal-400">
              Internal · evaluator only
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Command Center
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-400 lg:text-lg">
              Live status, module progress, and one-click alert demos for jury review.
            </p>
          </div>

          <div className="grid w-full shrink-0 grid-cols-2 gap-6 sm:grid-cols-4 lg:w-auto lg:min-w-[32rem] lg:gap-10">
            {statusItems.map((item) => (
              <div key={item.label} className="min-w-0">
                <div className="flex items-center gap-2">
                  <StatusDot state={item.state} />
                  <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {item.label}
                  </p>
                </div>
                <p className="mt-2 text-lg font-semibold capitalize text-white">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        <section className="w-full border-b border-white/10 py-10 lg:py-12">
          <div className="mb-6 flex items-center gap-2 text-teal-400">
            <IconPulse className="h-4 w-4" />
            <p className="text-[11px] font-bold uppercase tracking-[0.28em]">
              Build pipeline
            </p>
          </div>

          <div className="flex w-full items-stretch gap-0 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {MODULES.map((module, index) => (
              <div key={module.id} className="flex min-w-0 flex-1 items-center">
                <div className="min-w-[9rem] flex-1 sm:min-w-0">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                      <IconCheck className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        M{module.id}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-snug text-white sm:text-base">
                        {module.label}
                      </p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                        {module.status}
                      </p>
                    </div>
                  </div>
                </div>
                {index < MODULES.length - 1 && (
                  <div
                    aria-hidden
                    className="mx-3 hidden h-px min-w-[2rem] flex-1 bg-gradient-to-r from-emerald-500/40 to-white/10 sm:block lg:mx-6"
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="grid w-full flex-1 grid-cols-1 gap-10 py-10 lg:grid-cols-3 lg:gap-0 lg:py-12">
          <div className="lg:border-r lg:border-white/10 lg:pr-12">
            <div className="mb-5 flex items-center gap-2 text-amber-400">
              <IconTerminal className="h-4 w-4" />
              <p className="text-[11px] font-bold uppercase tracking-[0.28em]">
                Live alert demo
              </p>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 lg:text-base">
              Broadcast a real Socket.io emergency alert. Open{" "}
              <Link href="/#realtime-alerts" className="text-teal-400 hover:underline">
                /#realtime-alerts
              </Link>{" "}
              in another tab to watch it land.
            </p>
            <button
              type="button"
              onClick={() => void triggerDemoAlert()}
              disabled={alertLoading}
              className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-teal-300 transition hover:text-teal-200 disabled:opacity-50 lg:text-lg"
            >
              {alertLoading ? "Broadcasting…" : "Trigger demo alert"}
              <span aria-hidden>→</span>
            </button>
            {alertMessage && (
              <p className="mt-4 text-sm leading-relaxed text-slate-300 lg:text-base">
                {alertMessage}
              </p>
            )}
            {lastRecipients !== null && (
              <p className="mt-2 text-xs text-slate-500">
                Reached {lastRecipients} client{lastRecipients === 1 ? "" : "s"}
              </p>
            )}
          </div>

          <div className="lg:border-r lg:border-white/10 lg:px-12">
            <div className="mb-5 flex items-center gap-2 text-teal-400">
              <IconShield className="h-4 w-4" />
              <p className="text-[11px] font-bold uppercase tracking-[0.28em]">
                Evaluator access
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-8 font-mono sm:gap-12">
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-500">Email</dt>
                <dd className="mt-2 text-lg text-white sm:text-xl">judge@google.com</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-500">OTP</dt>
                <dd className="mt-2 text-lg text-white sm:text-xl">123456</dd>
              </div>
            </dl>
          </div>

          <div className="lg:pl-12">
            <div className="mb-5 flex items-center gap-2 text-teal-400">
              <IconCloudRain className="h-4 w-4" />
              <p className="text-[11px] font-bold uppercase tracking-[0.28em]">
                Quick links
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {EVALUATOR_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group block py-1"
                  >
                    <span className="block text-base font-semibold text-white transition group-hover:text-teal-300">
                      {link.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">{link.desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

export function JuryCommandCenter() {
  return (
    <SocketProvider>
      <JuryCommandCenterInner />
    </SocketProvider>
  );
}
