import { ModuleTracker } from "@/components/dashboard/ModuleTracker";

export default function JuryDemoPage() {
  return (
    <div className="min-h-screen bg-ops-base px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="ops-panel-elevated">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Internal — Jury Demo Only
          </p>
          <h1 className="ops-heading mt-2 text-2xl">Development Module Tracker</h1>
          <p className="ops-subtext mt-2">
            This page is not linked in the consumer app. Use it to demonstrate
            build progress during jury review.
          </p>
        </header>

        <section className="ops-panel-elevated">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Horizontal Timeline
          </h2>
          <ModuleTracker variant="horizontal" />
        </section>

        <section className="ops-panel-elevated max-w-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Sidebar Widget
          </h2>
          <ModuleTracker variant="sidebar" />
        </section>
      </div>
    </div>
  );
}
