"use client";

import Image from "next/image";
import Link from "next/link";
import { OtpLoginForm } from "@/components/auth/OtpLoginForm";
import { IconCloudRain } from "@/components/dashboard/CitizenIcons";

type CinematicHeroProps = {
  loginHref: string;
  isAuthenticated: boolean;
};

const GLASS_CARD =
  "rounded-2xl border border-white/25 bg-white/10 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl";

export function CinematicHero({
  loginHref,
  isAuthenticated,
}: CinematicHeroProps) {
  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-slate-900">
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
        className="absolute inset-0 z-10 bg-slate-900/30"
      />
      <div
        aria-hidden
        className="absolute inset-0 z-10 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-slate-900/25"
      />
      <div
        aria-hidden
        className="absolute inset-0 z-10 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900/55"
      />

      <div className="relative z-20 flex min-h-[85vh] flex-col">
        <header className="border-b border-white/10 bg-slate-900/30 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-[15px] py-4 md:px-[50px]">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-teal-400 backdrop-blur-sm">
                <IconCloudRain className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">JalVayu AI</p>
                <p className="text-xs text-slate-300">Monsoon preparedness</p>
              </div>
            </Link>
            <Link
              href={loginHref}
              className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-teal-400/50 hover:bg-white/15"
            >
              {isAuthenticated ? "My Dashboard" : "Sign In"}
            </Link>
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 items-center gap-12 px-[15px] py-10 md:grid-cols-2 md:px-[50px] md:py-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-400">
              Monsoon preparedness
            </p>
            <h1 className="mt-3 text-[1.75rem] font-bold leading-[1.12] text-white sm:text-4xl lg:text-5xl lg:leading-[1.08]">
              Your Family&apos;s Monsoon Safety,{" "}
              <span className="text-teal-400">Personalized.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
              Get custom emergency checklists, safe travel routes, and real-time
              severe weather alerts tailored strictly to your neighborhood and
              household.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#how-it-works"
                className="monsoon-touch-target inline-flex rounded-2xl border border-white/25 bg-white/10 px-6 py-3.5 text-center text-sm font-semibold text-white backdrop-blur-md transition hover:border-teal-400/50 hover:bg-white/15"
              >
                See How It Works
              </a>
            </div>
          </div>

          <div className="w-full">
            <div className={GLASS_CARD}>
              {isAuthenticated ? (
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white">Welcome back</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Your dashboard is ready. Continue building your family&apos;s
                    monsoon safety plan.
                  </p>
                  <Link
                    href={loginHref}
                    className="monsoon-btn-primary mt-6 inline-flex w-full justify-center"
                  >
                    Go to My Dashboard
                  </Link>
                </div>
              ) : (
                <OtpLoginForm variant="embedded" tone="glass" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
