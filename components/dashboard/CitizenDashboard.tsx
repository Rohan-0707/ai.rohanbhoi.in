"use client";

import { HomePlanSection } from "@/components/HomePlanSection";
import { IconCloudRain, IconShield } from "@/components/dashboard/CitizenIcons";
import type { HeaderUser } from "@/components/dashboard/DashboardHeaderBar";
import { getGreetingName, getTimeGreeting } from "@/lib/dashboard/greeting";

type CitizenDashboardProps = {
  user: HeaderUser;
};

export function CitizenDashboard({ user }: CitizenDashboardProps) {
  const firstName = getGreetingName(user.displayName);
  const timeGreeting = getTimeGreeting();

  return (
    <div className="space-y-6">
      <section className="premium-card relative overflow-hidden print:hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-monsoon-secondary/20 via-monsoon-secondary to-monsoon-secondary/20" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-monsoon-secondary shadow-sm">
            <IconShield className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-monsoon-secondary">
              {timeGreeting}
              {firstName !== "there" ? `, ${firstName}` : ""}
            </p>
            <h1 className="citizen-heading mt-1 text-2xl sm:text-3xl">
              {user.location
                ? `Let's keep ${user.location} prepared.`
                : "Let's get your household prepared."}
            </h1>
            <p className="citizen-subtext mt-3 text-base">
              Answer a few simple questions and we&apos;ll build a personalized
              monsoon readiness plan tailored to your home and neighborhood.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
              <IconCloudRain className="h-4 w-4 text-monsoon-secondary" />
              Monsoon season readiness
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 print:hidden">
          <h2 className="citizen-heading text-lg">My Monsoon Dashboard</h2>
          <p className="citizen-subtext mt-1">
            Create a plan tailored to your neighborhood and home.
          </p>
        </div>

        <HomePlanSection />
      </section>
    </div>
  );
}
