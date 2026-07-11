"use client";

import Image from "next/image";
import Link from "next/link";
import { PlanGenerator } from "@/components/ui/PlanGenerator";
import { IconCloudRain } from "@/components/dashboard/CitizenIcons";
import type { PlanApiResponse } from "@/lib/types/plan";

type CinematicHeroProps = {
  loginHref: string;
  isAuthenticated: boolean;
  weatherWidget?: React.ReactNode;
  onPlanGenerated?: (plan: PlanApiResponse) => void;
};

const FROSTED_CARD =
  "rounded-2xl border border-teal-500/20 bg-[#0f172a]/70 p-6 shadow-2xl shadow-teal-950/30 backdrop-blur-xl ring-1 ring-teal-400/10 sm:p-8";

const HERO_CHIPS = [
  "Real-time flood alerts",
  "AI survival checklists",
  "EN · HI · KN",
] as const;

const TRUST_BADGES = [
  "Free to use",
  "3-minute setup",
  "Offline PDF export",
] as const;

export function CinematicHero({
  loginHref,
  isAuthenticated,
  weatherWidget,
  onPlanGenerated,
}: CinematicHeroProps) {
  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-[#0B1120] pb-24 text-white print:hidden md:pb-32">
      <div className="absolute inset-0">
        <Image
          src="/monsoon-hero-bg-mobile.png"
          alt="Monsoon storm clouds over a city at dusk"
          fill
          priority
          sizes="100vw"
          className="object-cover md:hidden"
        />
        <Image
          src="/monsoon-hero-bg.jpg"
          alt="Monsoon storm clouds over a city skyline"
          fill
          priority
          sizes="100vw"
          className="hidden object-cover md:block"
        />
      </div>

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950/90"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(20,184,166,0.12),transparent_55%)]"
      />

      <div className="relative z-10 flex min-h-[88vh] flex-col">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/40 px-[15px] py-4 backdrop-blur-md md:px-[50px]">
          <div className="flex w-full items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-teal-400 shadow-lg shadow-teal-900/30">
                <IconCloudRain className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">JalVayu AI</p>
                <p className="text-xs text-slate-300">Monsoon preparedness</p>
              </div>
            </Link>
            <Link
              href={loginHref}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-teal-400/50 hover:bg-white/15"
            >
              {isAuthenticated ? "My Dashboard" : "Sign In"}
            </Link>
          </div>
        </header>

        <div className="relative grid w-full flex-1 grid-cols-1 items-start gap-12 px-[15px] py-12 md:px-[50px] lg:grid-cols-2 lg:py-16">
          <div className="lg:pt-4">
            <div className="landing-fade-up">{weatherWidget}</div>

            <p className="landing-fade-up landing-fade-up-delay-1 text-xs font-bold uppercase tracking-[0.2em] text-teal-400">
              Monsoon preparedness
            </p>
            <h1 className="landing-fade-up landing-fade-up-delay-1 mt-4 text-3xl font-bold leading-[1.15] text-white sm:text-4xl lg:text-5xl">
              Your Family&apos;s Monsoon Safety,{" "}
              <span className="bg-gradient-to-r from-teal-300 to-teal-500 bg-clip-text text-transparent">
                Personalized.
              </span>
            </h1>
            <p className="landing-fade-up landing-fade-up-delay-2 mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
              Get custom emergency checklists, safe travel routes, and real-time
              severe weather alerts tailored to your neighborhood and household.
            </p>

            <div className="landing-fade-up landing-fade-up-delay-2 mt-6 flex flex-wrap gap-2">
              {HERO_CHIPS.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur-sm"
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="landing-fade-up landing-fade-up-delay-3 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href="#quick-plan"
                className="monsoon-touch-target inline-flex justify-center rounded-lg bg-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/30 transition hover:bg-teal-400"
              >
                {isAuthenticated ? "Generate Another Plan" : "Create Free Plan"}
              </a>
              <a
                href="#realtime-alerts"
                className="monsoon-touch-target inline-flex justify-center rounded-lg border border-amber-400/40 bg-amber-500/20 px-6 py-3 text-sm font-semibold text-amber-50 transition hover:border-amber-300/60 hover:bg-amber-500/30"
              >
                Live Alert System
              </a>
              {!isAuthenticated && (
                <Link
                  href={loginHref}
                  className="monsoon-touch-target inline-flex justify-center rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-teal-400/50 hover:bg-white/15"
                >
                  Sign In to Save
                </Link>
              )}
            </div>

            <ul className="landing-fade-up landing-fade-up-delay-3 mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
              {TRUST_BADGES.map((badge) => (
                <li key={badge} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-teal-400" aria-hidden />
                  {badge}
                </li>
              ))}
            </ul>
          </div>

          <div className="landing-fade-up landing-fade-up-delay-2 w-full lg:justify-self-end">
            <div className={FROSTED_CARD} id="quick-plan">
              <div className="mb-5 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300/90">
                  {isAuthenticated ? "Instant generator" : "No login required"}
                </p>
                <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                  Quick Emergency Survival Plan
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Live Open-Meteo weather + AI checklist in under 3 minutes.
                  {isAuthenticated && " Guest plans are not saved — use dashboard for history."}
                </p>
              </div>

              <div className="hero-glass-panel">
                <PlanGenerator
                  variant="guest"
                  embedded
                  tone="glass"
                  onPlanGenerated={(plan) => onPlanGenerated?.(plan)}
                />
              </div>

              <p className="mt-4 text-center text-xs text-slate-400">
                Results appear below the hero after generation.{" "}
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="font-semibold text-teal-300 hover:text-teal-200"
                  >
                    Open dashboard →
                  </Link>
                ) : (
                  <>
                    <Link
                      href={loginHref}
                      className="font-semibold text-teal-300 hover:text-teal-200"
                    >
                      Sign in to save →
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <a
          href="#weather-check"
          className="landing-scroll-hint mx-auto mb-6 flex flex-col items-center gap-1 text-slate-400 transition hover:text-teal-300"
          aria-label="Scroll to weather check"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
            Explore
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className="h-5 w-5"
            aria-hidden
          >
            <path strokeLinecap="round" d="M12 5v14M6 13l6 6 6-6" />
          </svg>
        </a>
      </div>

      <div className="absolute bottom-0 left-0 z-20 h-36 w-full bg-gradient-to-b from-transparent via-slate-50/40 to-slate-50" />
    </section>
  );
}
