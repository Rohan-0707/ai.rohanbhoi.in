"use client";

import Image from "next/image";
import Link from "next/link";
import { OtpLoginForm } from "@/components/auth/OtpLoginForm";
import { IconCloudRain } from "@/components/dashboard/CitizenIcons";

type CinematicHeroProps = {
  loginHref: string;
  isAuthenticated: boolean;
  weatherWidget?: React.ReactNode;
};

const FROSTED_CARD =
  "bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl";

export function CinematicHero({
  loginHref,
  isAuthenticated,
  weatherWidget,
}: CinematicHeroProps) {
  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-[#0B1120] text-white">
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

      <div aria-hidden className="absolute inset-0 bg-slate-950/80" />

      <div className="relative z-10 flex min-h-[85vh] flex-col">
        <header className="border-b border-white/10 px-[15px] py-4 md:px-[50px]">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-teal-400">
                <IconCloudRain className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">JalVayu AI</p>
                <p className="text-xs text-slate-300">Monsoon preparedness</p>
              </div>
            </Link>
            <Link
              href={loginHref}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-teal-400/50"
            >
              {isAuthenticated ? "My Dashboard" : "Sign In"}
            </Link>
          </div>
        </header>

        <div className="relative grid flex-1 grid-cols-1 items-center gap-12 px-[15px] py-12 md:px-[50px] lg:grid-cols-2 lg:py-16">
          <div>
            {weatherWidget}
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-400">
              Monsoon preparedness
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Your Family&apos;s Monsoon Safety,{" "}
              <span className="text-teal-400">Personalized.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Get custom emergency checklists, safe travel routes, and real-time
              severe weather alerts tailored to your neighborhood and household.
            </p>
            <a
              href="#how-it-works"
              className="monsoon-touch-target mt-8 inline-flex rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-teal-400/50 hover:bg-white/15"
            >
              See How It Works
            </a>
          </div>

          <div className="w-full lg:justify-self-end">
            <div className={FROSTED_CARD} id="get-started">
              {isAuthenticated ? (
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white">Welcome back</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Continue building your family&apos;s monsoon safety plan.
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

      <div className="absolute bottom-0 left-0 z-20 h-32 w-full bg-gradient-to-b from-transparent to-slate-50" />
    </section>
  );
}
