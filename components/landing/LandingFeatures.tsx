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
    title: "Tell Us About Your Home.",
    description:
      "Enter your local area—like Yelahanka, Bengaluru—your family size, and whether you are in an apartment or ground-floor house.",
    icon: IconLocation,
  },
  {
    step: 2,
    title: "Get Your Custom Action Plan.",
    description:
      "Our system analyzes local weather patterns and topology to generate a specific, actionable survival checklist for your exact living situation.",
    icon: IconShield,
  },
  {
    step: 3,
    title: "Stay Alert in Real-Time.",
    description:
      "Receive immediate, localized push notifications if severe waterlogging or flash floods are detected near you.",
    icon: IconCloudRain,
  },
] as const;

const FEATURES = [
  {
    title: "Hyper-Local Accuracy.",
    description:
      "Advice tailored to the specific drainage and structural risks of your immediate area, not generic city-wide guesses.",
    icon: IconLocation,
  },
  {
    title: "Multilingual Support.",
    description:
      "Access your emergency checklists and live alerts in English, Hindi, Kannada, and more. Safety in your native language.",
    icon: IconGuides,
  },
  {
    title: "Family-Sized Planning.",
    description:
      "Whether you live alone or have a household of six, your food, water, and evacuation recommendations scale automatically.",
    icon: IconFamily,
  },
  {
    title: "Always Accessible.",
    description:
      "Download your plans to your phone. Access critical safety steps even when extreme weather knocks out the cell towers.",
    icon: IconShield,
  },
] as const;

const LIGHT_CARD =
  "rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6";

const ICON_WRAP =
  "flex items-center justify-center rounded-lg bg-teal-50 p-3 text-monsoon-secondary";

type LandingFeaturesProps = {
  loginHref: string;
};

export function LandingFeatures({ loginHref }: LandingFeaturesProps) {
  return (
    <>
      <section id="how-it-works" className="bg-white">
        <div className="ops-page-padding py-10 sm:py-12 lg:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
              Preparedness in Three Steps
            </h2>
          </div>

          <div className="mx-auto mt-8 grid gap-4 sm:mt-10 lg:grid-cols-3 lg:gap-5">
            {STEPS.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.step} className={LIGHT_CARD}>
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-teal-100 bg-teal-50 text-sm font-bold text-monsoon-secondary">
                      {item.step}
                    </span>
                    <div className={ICON_WRAP}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 sm:text-xl">
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
        className="border-t border-slate-100 bg-slate-50"
      >
        <div className="ops-page-padding py-10 sm:py-12 lg:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
              Built for your household
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Practical tools that help your family prepare, respond, and stay
              safe through monsoon season.
            </p>
          </div>

          <div className="mx-auto mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:gap-5">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;

              return (
                <article key={feature.title} className={LIGHT_CARD}>
                  <div className={`h-11 w-11 ${ICON_WRAP}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 sm:text-xl">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white">
        <div className="ops-page-padding py-10 sm:py-12">
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-100 bg-white px-6 py-8 text-center shadow-sm sm:px-8 sm:py-10">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Don&apos;t wait for the storm.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-slate-600">
              Create your family&apos;s personalized monsoon plan in minutes. It&apos;s
              free, and it could make all the difference when the rains arrive.
            </p>
            <Link
              href={loginHref}
              className="monsoon-touch-target mt-6 inline-flex rounded-2xl bg-monsoon-secondary px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-600 hover:shadow-md"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
