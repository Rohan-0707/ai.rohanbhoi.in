"use client";

import type { PlanApiResponse } from "@/lib/types/plan";
import { LANGUAGE_LABELS, type PlanLanguage } from "@/lib/languages";
import {
  countChecklistItems,
  normalizeChecklist,
} from "@/lib/plan-checklist";
import Link from "next/link";
import { printEmergencyPlan } from "@/lib/print-plan";

type PlanResultsProps = {
  plan: PlanApiResponse;
  variant?: "dashboard" | "guest";
  loginHref?: string;
  tone?: "light" | "glass";
};

function getLanguageLabel(code?: string): string | null {
  if (!code || !(code in LANGUAGE_LABELS)) {
    return null;
  }

  return LANGUAGE_LABELS[code as PlanLanguage];
}

function PrinterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-4 w-4"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 17h10v4H7v-4ZM7 7V3h10v4M7 13h10a2 2 0 0 0 2-2V9H5v2a2 2 0 0 0 2 2Z"
      />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 18h7M13 18h7M4 12h16"
      />
    </svg>
  );
}

function formatDayLabel(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function PlanWeatherPanel({
  weather,
}: {
  weather: NonNullable<PlanApiResponse["weather"]>;
}) {
  if (!weather.available) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 print:border-slate-300 print:bg-white">
        <p className="text-sm text-slate-600 print:text-black">
          Live weather could not be resolved for this location. The plan was
          generated using your area description and typical monsoon patterns.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm print:border-slate-300 print:bg-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700 print:text-black">
            Live weather context
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900 print:text-black">
            {weather.displayName}
          </h3>
          <p className="mt-1 text-sm text-slate-600 print:text-slate-700">
            Open-Meteo data fed into your AI survival plan
          </p>
        </div>
        <p className="text-3xl font-bold tabular-nums text-slate-900 print:text-black">
          {weather.temperatureC}°C
          <span className="ml-2 text-base font-medium text-slate-600">
            {weather.condition}
          </span>
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-sky-100 bg-white px-4 py-3 print:border-slate-200">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Rain (24h)
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
            {weather.next24hRainMm} mm
          </p>
        </div>
        <div className="rounded-xl border border-sky-100 bg-white px-4 py-3 print:border-slate-200">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Peak rain chance
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
            {weather.maxHourlyRainProbability !== null &&
            weather.maxHourlyRainProbability !== undefined
              ? `${weather.maxHourlyRainProbability}%`
              : "N/A"}
          </p>
        </div>
        <div className="rounded-xl border border-sky-100 bg-white px-4 py-3 print:border-slate-200">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Wind / humidity
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
            {weather.windSpeedKmh} km/h
            {weather.humidityPercent !== null &&
              weather.humidityPercent !== undefined && (
                <span className="text-sm font-medium text-slate-600">
                  {" "}
                  · {weather.humidityPercent}%
                </span>
              )}
          </p>
        </div>
      </div>

      {weather.daily && weather.daily.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {weather.daily.map((day) => (
            <div
              key={day.date}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 print:border-slate-300"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {formatDayLabel(day.date)}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {day.condition}
              </p>
              <p className="text-xs text-slate-600">{day.precipitationSumMm} mm</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PlanResults({
  plan,
  variant = "dashboard",
  loginHref = "/#get-started",
  tone = "light",
}: PlanResultsProps) {
  const isGlass = tone === "glass";
  const languageLabel = getLanguageLabel(plan.language);
  const checklistPhases = normalizeChecklist(plan.checklist);
  const travelAdvisories = plan.travelAdvisories ?? [];
  const checklistCount = countChecklistItems(checklistPhases);
  const isGuest = variant === "guest" || plan.saved === false;
  const cardClass = isGlass
    ? "rounded-xl border border-white/10 bg-white/5 p-6 sm:p-7"
    : "citizen-card print:border print:border-slate-300 print:bg-white print:shadow-none";
  const headingClass = isGlass
    ? "text-lg font-semibold tracking-tight text-white"
    : "citizen-heading text-lg print:text-black";
  const subtextClass = isGlass
    ? "mt-1 text-sm leading-relaxed text-slate-400"
    : "citizen-subtext mt-1 print:text-slate-700";
  const listItemClass = isGlass
    ? "flex gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 print:border print:border-slate-200 print:bg-white"
    : "print-plan-break-avoid flex gap-3 rounded-2xl bg-slate-50 px-4 py-3 print:border print:border-slate-200 print:bg-white";
  const listTextClass = isGlass
    ? "text-sm leading-relaxed text-slate-200 print:text-black"
    : "text-sm leading-relaxed text-slate-700 print:text-black";

  return (
    <section
      id="emergency-plan-print"
      className={`mt-6 space-y-6 print:mt-0 print:block print:w-full print:max-w-none print:bg-white print:text-black ${
        isGlass ? "hero-glass-results" : "mt-8"
      }`}
    >
      <p className="hidden border-b border-slate-300 pb-3 text-sm font-semibold text-black print:block">
        JalVayu AI · Emergency Survival Plan ·{" "}
        {new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:hidden">
        <div>
          <h2
            className={`text-xl font-semibold tracking-tight print:text-2xl ${
              isGlass ? "text-white" : "citizen-heading"
            }`}
          >
            Your Emergency Survival Plan
          </h2>
          <p
            className={`mt-1 text-sm leading-relaxed print:text-slate-700 ${
              isGlass ? "text-slate-300" : "citizen-subtext"
            }`}
          >
            Tailored to live weather and forecast for your area — save or print
            for offline use during outages.
          </p>
        </div>

        <button
          type="button"
          onClick={printEmergencyPlan}
          className={`flex items-center space-x-2 self-start rounded-lg border px-4 py-2 text-sm font-medium transition ${
            isGlass
              ? "border-white/20 bg-white/10 text-slate-100 hover:bg-white/15"
              : "border-slate-300 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <PrinterIcon />
          <span className="text-sm font-medium">Save Offline (PDF)</span>
        </button>
      </div>

      <div
        className={`print:hidden rounded-xl border px-5 py-4 ${
          isGuest
            ? isGlass
              ? "border-white/15 bg-white/5"
              : "border-slate-200 bg-slate-50"
            : isGlass
              ? "border-teal-400/30 bg-teal-500/10"
              : "border-teal-200 bg-teal-50"
        }`}
      >
        {isGuest ? (
          <>
            <p
              className={`text-sm font-medium ${
                isGlass ? "text-slate-100" : "text-slate-800"
              }`}
            >
              Your plan is ready. Nothing was saved to our servers — use{" "}
              <strong>Save Offline (PDF)</strong> above to keep a copy on your
              device.
            </p>
            <p
              className={`mt-2 text-xs ${
                isGlass ? "text-slate-400" : "text-slate-600"
              }`}
            >
              <strong>Sign in</strong> only if you want encrypted plan history,
              saved locations, and real-time dashboard alerts. Login is optional
              for this quick generator.
            </p>
            <Link
              href={loginHref}
              className={`mt-3 inline-flex text-sm font-semibold ${
                isGlass
                  ? "text-teal-300 hover:text-teal-200"
                  : "text-teal-600 hover:text-teal-700"
              }`}
            >
              Sign in to save plans privately →
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-teal-800 print:text-black">
              Your family plan is ready. Review the checklist below — it&apos;s
              saved automatically to your account.
            </p>
            {languageLabel && (
              <p className="mt-2 text-xs text-teal-700 print:text-slate-700">
                Language: {languageLabel}
                {plan.translatedWith === "google" &&
                  " · translated via Google Cloud Translation"}
              </p>
            )}
          </>
        )}
        {isGuest && languageLabel && (
          <p
            className={`mt-2 text-xs print:text-slate-700 ${
              isGlass ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Language: {languageLabel}
            {plan.translatedWith === "google" &&
              " · translated via Google Cloud Translation"}
          </p>
        )}
      </div>

      {plan.weather && (
        <div className="print-plan-break-avoid">
          <PlanWeatherPanel weather={plan.weather} />
        </div>
      )}

      <div className={`print-plan-break-avoid ${cardClass}`}>
        <h3 className={headingClass}>Timeline Checklist</h3>
        <p className={subtextClass}>
          {checklistCount} actions across Before, During, and After the storm
        </p>

        <div className="mt-6 space-y-6">
          {checklistPhases.map((phase, phaseIndex) => (
            <div key={`${plan.id}-phase-${phaseIndex}`}>
              <h4
                className={`text-sm font-semibold uppercase tracking-wide print:text-black ${
                  isGlass ? "text-teal-300" : "text-monsoon-secondary"
                }`}
              >
                {phase.phase}
              </h4>
              <ol className="mt-3 space-y-3">
                {phase.items.map((item, index) => (
                  <li
                    key={`${plan.id}-check-${phaseIndex}-${index}`}
                    className={listItemClass}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500 text-sm font-semibold text-white print:border print:border-slate-400 print:bg-white print:text-black">
                      {index + 1}
                    </span>
                    <p className={listTextClass}>{item}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 print:grid-cols-1">
        <div className={`print-plan-break-avoid ${cardClass}`}>
          <h3 className={headingClass}>Safety Tips</h3>
          <p className={subtextClass}>Broader guidance to keep your family safe</p>
          <ul className="mt-5 space-y-3">
            {plan.recommendations.map((item, index) => (
              <li
                key={`${plan.id}-rec-${index}`}
                className={
                  isGlass
                    ? "rounded-xl border-l-4 border-teal-400/60 bg-black/20 px-4 py-3 print:border print:border-slate-200 print:bg-white"
                    : "rounded-2xl border-l-4 border-monsoon-secondary bg-slate-50 px-4 py-3 print:border print:border-slate-200 print:border-l-slate-400 print:bg-white"
                }
              >
                <p className={listTextClass}>{item}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className={`print-plan-break-avoid ${cardClass}`}>
          <div className="flex items-center gap-2 print:hidden">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg print:border print:border-slate-300 print:bg-white ${
                isGlass
                  ? "bg-teal-500/20 text-teal-300"
                  : "bg-teal-50 text-monsoon-secondary"
              }`}
            >
              <RouteIcon />
            </div>
            <div>
              <h3 className={headingClass}>Travel &amp; Evacuation Advisories</h3>
              <p className={subtextClass}>
                Neighborhood-aware routes and areas to avoid
              </p>
            </div>
          </div>
          <h3 className={`${headingClass} hidden print:block`}>
            Travel &amp; Evacuation Advisories
          </h3>
          <ul className="mt-5 space-y-3">
            {travelAdvisories.map((item, index) => (
              <li
                key={`${plan.id}-travel-${index}`}
                className={
                  isGlass
                    ? "rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 print:border print:border-slate-200 print:bg-white"
                    : "rounded-2xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 print:border print:border-slate-200 print:bg-white"
                }
              >
                <p className={listTextClass}>{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="hidden text-xs text-slate-500 print:block">
        Generated by JalVayu AI · {new Date().toLocaleDateString("en-IN")}
      </p>
    </section>
  );
}
