import Link from "next/link";
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

const BODY_CARD =
  "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-7";

const ICON_WRAP =
  "flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-600";

type LandingFeaturesProps = {
  loginHref: string;
};

export function LandingFeatures({ loginHref }: LandingFeaturesProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-20">
      <section id="how-it-works">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">
            How it works
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            Preparedness in Three Steps
          </h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {STEPS.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.step} className={BODY_CARD}>
                <div className="flex items-center justify-between">
                  <div className={ICON_WRAP}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
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
      </section>

      <section id="features">
        <div className="mx-auto max-w-2xl text-center">
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

      <section className="text-center">
        <div className={`${BODY_CARD} mx-auto max-w-2xl`}>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Don&apos;t wait for the storm
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-slate-600">
            Create your family&apos;s personalized monsoon plan in minutes. Free,
            and ready when the rains arrive.
          </p>
          <Link
            href={loginHref}
            className="monsoon-touch-target mt-6 inline-flex rounded-lg bg-teal-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700 hover:shadow-md"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
