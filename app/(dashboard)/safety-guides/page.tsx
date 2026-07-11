import { IconCloudRain, IconGuides, IconShield } from "@/components/dashboard/CitizenIcons";

const GUIDES = [
  {
    title: "Before the rains arrive",
    tips: [
      "Clear drains and gutters around your home.",
      "Keep an emergency kit with torch, medicines, and drinking water.",
      "Save local helpline numbers on every family phone.",
    ],
  },
  {
    title: "During heavy rainfall",
    tips: [
      "Avoid driving or walking through flooded roads.",
      "Move electronics and valuables to higher floors.",
      "Stay tuned for weather alerts in the JalVayu app.",
    ],
  },
  {
    title: "If flooding reaches your area",
    tips: [
      "Turn off main power if water enters your home.",
      "Move family and pets to the safest upper level.",
      "Follow guidance from local authorities and your family plan checklist.",
    ],
  },
] as const;

export default function SafetyGuidesPage() {
  return (
    <div className="space-y-8">
      <section className="citizen-card">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-monsoon-secondary">
            <IconGuides className="h-6 w-6" />
          </div>
          <div>
            <h1 className="citizen-heading text-2xl">Safety Guides</h1>
            <p className="citizen-subtext mt-2">
              Simple, practical advice to help your family stay safe through
              monsoon season.
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-5">
        {GUIDES.map((guide) => (
          <article key={guide.title} className="citizen-card">
            <div className="mb-4 flex items-center gap-2">
              <IconShield className="h-5 w-5 text-monsoon-secondary" />
              <h2 className="citizen-heading text-lg">{guide.title}</h2>
            </div>
            <ul className="space-y-3">
              {guide.tips.map((tip) => (
                <li
                  key={tip}
                  className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600"
                >
                  {tip}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <section className="rounded-3xl border border-teal-200 bg-teal-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <IconCloudRain className="h-5 w-5 text-monsoon-secondary" />
          <p className="text-sm text-teal-800">
            Create a personalized plan on your dashboard for advice specific to
            your neighborhood and home.
          </p>
        </div>
      </section>
    </div>
  );
}
