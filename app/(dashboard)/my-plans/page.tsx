import { PlanHistory } from "@/components/dashboard/PlanHistory";
import { IconPlans } from "@/components/dashboard/CitizenIcons";

export default function MyPlansPage() {
  return (
    <div className="space-y-8">
      <section className="citizen-card">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-monsoon-secondary">
            <IconPlans className="h-6 w-6" />
          </div>
          <div>
            <h1 className="citizen-heading text-2xl">My Saved Plans</h1>
            <p className="citizen-subtext mt-2">
              All the monsoon readiness plans you&apos;ve created, saved for your
              family.
            </p>
          </div>
        </div>
      </section>

      <PlanHistory />
    </div>
  );
}
