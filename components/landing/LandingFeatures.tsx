import Link from "next/link";
import { LandingWeatherChecker } from "@/components/landing/LandingWeatherChecker";
import { LandingQuickPlan } from "@/components/landing/LandingQuickPlan";
import {
  IconCloudRain,
  IconFamily,
  IconGuides,
  IconLocation,
  IconShield,
} from "@/components/dashboard/CitizenIcons";

const STEPS = [
  {
    step: 1,
    title: "Tell Us About Your Home",
    description:
      "Enter your local area, family size, and whether you live in an apartment or ground-floor house.",
    icon: IconLocation,
  },
  {
    step: 2,
    title: "Get Your Custom Action Plan",
    description:
      "Receive a specific, actionable survival checklist built for your exact living situation.",
    icon: IconShield,
  },
  {
    step: 3,
    title: "Stay Alert in Real-Time",
    description:
      "Get localized notifications when severe waterlogging or flash floods are detected near you.",
    icon: IconCloudRain,
  },
] as const;

const FEATURES = [
  {
    title: "Hyper-Local Accuracy",
    description:
      "Advice tailored to drainage and structural risks in your immediate area.",
    icon: IconLocation,
  },
  {
    title: "Multilingual Support",
    description:
      "Checklists and alerts in English, Hindi, Kannada, and more.",
    icon: IconGuides,
  },
  {
    title: "Family-Sized Planning",
    description:
      "Food, water, and evacuation steps that scale to your household.",
    icon: IconFamily,
  },
  {
    title: "Always Accessible",
    description:
      "Download plans to your phone — usable even when networks fail.",
    icon: IconShield,
  },
] as const;

const STATS = [
  { value: "Live", label: "Weather near you" },
  { value: "Real-time", label: "Flood alerts" },
  { value: "AES-256", label: "Encrypted data" },
  { value: "Offline", label: "PDF export" },
] as const;

const BODY_CARD =
  "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200/80 hover:shadow-md sm:p-7";

const ICON_WRAP =
  "flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-600";

type LandingFeaturesProps = {
  loginHref: string;
};

export function LandingFeatures({ loginHref }: LandingFeaturesProps) {
  return (
    <div className="w-full space-y-20">
      <section
        aria-label="Platform highlights"
        className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden sm:grid-cols-4 sm:gap-6 sm:p-6"
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center sm:text-left">
            <p className="text-lg font-bold text-teal-600 sm:text-xl">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">{stat.label}</p>
          </div>
        ))}
      </section>

      <LandingWeatherChecker />

      <LandingQuickPlan loginHref={loginHref} />

      <section id="how-it-works" className="print:hidden">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">
            How it works
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            Preparedness in Three Steps
          </h2>
          <p className="mt-3 text-base text-slate-600">
            From signup to a household-ready plan in under three minutes.
          </p>
        </div>

        <div className="relative mt-10">
          <div
            aria-hidden
            className="absolute left-[16.67%] right-[16.67%] top-14 hidden h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent lg:block"
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {STEPS.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.step} className={`${BODY_CARD} relative`}>
                  <div className="flex items-center justify-between">
                    <div className={ICON_WRAP}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white shadow-sm">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="landing-dot-grid w-full rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 px-5 py-12 print:hidden sm:px-8 lg:px-12"
      >
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">
            Why JalVayu
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            Built for your household
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Practical tools to prepare, respond, and stay safe through monsoon
            season.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <article key={feature.title} className={`${BODY_CARD} flex gap-4`}>
                <div className={`${ICON_WRAP} shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="text-center print:hidden">
        <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 px-8 py-10 text-white shadow-lg shadow-teal-900/20 sm:px-12 sm:py-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-teal-400/20 blur-2xl"
          />
          <h2 className="relative text-2xl font-bold sm:text-3xl">
            Don&apos;t wait for the storm
          </h2>
          <p className="relative mt-3 text-base text-teal-50 sm:text-lg">
            Create your family&apos;s personalized monsoon plan in minutes. Free,
            and ready when the rains arrive.
          </p>
          <Link
            href={loginHref}
            className="monsoon-touch-target relative mt-6 inline-flex rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50 hover:shadow-md"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
