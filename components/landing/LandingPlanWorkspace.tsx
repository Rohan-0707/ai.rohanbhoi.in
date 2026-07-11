"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { CinematicHero } from "@/components/landing/CinematicHero";
import { PlanResults } from "@/components/ui/PlanResults";
import type { PlanApiResponse } from "@/lib/types/plan";

type LandingPlanWorkspaceProps = {
  loginHref: string;
  isAuthenticated: boolean;
  weatherWidget: ReactNode;
  children: ReactNode;
};

export function LandingPlanWorkspace({
  loginHref,
  isAuthenticated,
  weatherWidget,
  children,
}: LandingPlanWorkspaceProps) {
  const [plan, setPlan] = useState<PlanApiResponse | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  const handlePlanGenerated = useCallback((nextPlan: PlanApiResponse) => {
    setPlan(nextPlan);

    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  return (
    <>
      <CinematicHero
        loginHref={loginHref}
        isAuthenticated={isAuthenticated}
        weatherWidget={weatherWidget}
        onPlanGenerated={handlePlanGenerated}
      />

      {plan && (
        <section
          id="plan-results"
          ref={resultsRef}
          className="relative z-30 scroll-mt-24 bg-slate-50 px-[15px] py-12 text-slate-900 print:bg-white md:px-[50px] md:py-14"
        >
          <div className="w-full">
            <div className="mb-6 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">
                Your personalized plan
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Emergency Survival Plan Ready
              </h2>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Generated from live weather for your area. Save offline or sign in
                to store it securely.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
              <PlanResults
                plan={plan}
                variant="guest"
                loginHref={loginHref}
                tone="light"
              />
            </div>
          </div>
        </section>
      )}

      {children}
    </>
  );
}
