import Link from "next/link";
import { HomePlanSection } from "@/components/HomePlanSection";
import { IconShield } from "@/components/dashboard/CitizenIcons";

type LandingQuickPlanProps = {
  loginHref: string;
};

export function LandingQuickPlan({ loginHref }: LandingQuickPlanProps) {
  return (
    <section id="quick-plan" className="scroll-mt-24">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-teal-50 via-white to-slate-50 px-5 py-8 print:hidden sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <IconShield className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">
                  No login required
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Quick Emergency Survival Plan
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  Generate a personalized monsoon checklist in under three minutes —
                  powered by <strong className="font-semibold text-slate-800">live Open-Meteo weather</strong> and AI.{" "}
                  <strong className="font-semibold text-slate-800">
                    Sign in is optional
                  </strong>{" "}
                  and only needed if you want encrypted plan history, saved
                  locations, and a private dashboard.
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
              <p className="font-semibold text-slate-900">Why sign in?</p>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed">
                <li>· Encrypted plan history (AES-256)</li>
                <li>· Saved neighborhood &amp; household defaults</li>
                <li>· Real-time severe weather alerts</li>
              </ul>
              <Link
                href={loginHref}
                className="mt-3 inline-flex text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                Sign in when you&apos;re ready →
              </Link>
            </div>
          </div>
        </div>

        <div className="px-5 py-8 sm:px-8">
          <HomePlanSection variant="guest" loginHref={loginHref} />
        </div>
      </div>
    </section>
  );
}
