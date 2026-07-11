"use client";

import { useState } from "react";
import { IconCloudRain, IconLocation } from "@/components/dashboard/CitizenIcons";
import type {
  WeatherBriefingResponse,
  WeatherRiskLevel,
} from "@/lib/weather-briefing";

const RISK_STYLES: Record<
  WeatherRiskLevel,
  { badge: string; ring: string; label: string }
> = {
  low: {
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ring: "ring-emerald-200/60",
    label: "Low Risk",
  },
  moderate: {
    badge: "bg-amber-100 text-amber-900 border-amber-200",
    ring: "ring-amber-200/60",
    label: "Moderate Risk",
  },
  high: {
    badge: "bg-orange-100 text-orange-900 border-orange-200",
    ring: "ring-orange-200/60",
    label: "High Risk",
  },
  severe: {
    badge: "bg-red-100 text-red-900 border-red-200",
    ring: "ring-red-200/60",
    label: "Severe Risk",
  },
};

function formatDayLabel(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function RiskBadge({ level }: { level: WeatherRiskLevel }) {
  const style = RISK_STYLES[level];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${style.badge}`}
    >
      {style.label}
    </span>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function BriefingList({
  title,
  items,
  accent = "teal",
}: {
  title: string;
  items: string[];
  accent?: "teal" | "amber" | "slate";
}) {
  const borderClass =
    accent === "amber"
      ? "border-amber-300"
      : accent === "slate"
        ? "border-slate-300"
        : "border-teal-500";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <ul className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li
            key={`${title}-${index}`}
            className={`border-l-4 ${borderClass} bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700`}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LandingWeatherChecker() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WeatherBriefingResponse | null>(null);

  async function handleCheck(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = query.trim();

    if (!trimmed) {
      setError("Enter a place name or 6-digit PIN code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/weather/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not fetch weather briefing");
      }

      setResult(data as WeatherBriefingResponse);
    } catch (submitError) {
      setResult(null);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not fetch weather briefing",
      );
    } finally {
      setLoading(false);
    }
  }

  const riskStyle = result
    ? RISK_STYLES[result.briefing.riskLevel]
    : RISK_STYLES.low;

  return (
    <section id="weather-check" className="scroll-mt-24 print:hidden">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white shadow-xl">
        <div className="border-b border-white/10 px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">
                Live monsoon intelligence
              </p>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Check Weather for Any Place
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                Enter a neighborhood, city, or 6-digit PIN code. We pull live
                Open-Meteo data, analyze it with AI, and return a structured
                monsoon readiness briefing.
              </p>
            </div>

            <form
              onSubmit={(event) => void handleCheck(event)}
              className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:min-w-[28rem]"
            >
              <label className="sr-only" htmlFor="weather-place-query">
                Place or PIN code
              </label>
              <div className="relative flex-1">
                <IconLocation className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="weather-place-query"
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="e.g. Yelahanka, Bengaluru or 560064"
                  className="w-full rounded-xl border border-white/15 bg-white/10 py-3.5 pl-12 pr-4 text-white placeholder:text-slate-400 outline-none transition focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
                  autoComplete="postal-code"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="monsoon-touch-target inline-flex justify-center rounded-xl bg-teal-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Analyzing..." : "Check Weather"}
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="border-b border-white/10 bg-red-500/10 px-5 py-4 text-sm text-red-100 sm:px-8">
            {error}
          </div>
        )}

        {loading && (
          <div className="space-y-4 px-5 py-8 sm:px-8">
            <div className="h-28 animate-pulse rounded-2xl bg-white/10" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-2xl bg-white/10"
                />
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="h-48 animate-pulse rounded-2xl bg-white/10" />
              <div className="h-48 animate-pulse rounded-2xl bg-white/10" />
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6 bg-slate-50 px-5 py-8 text-slate-900 sm:px-8">
            <div
              className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-2 ${riskStyle.ring}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                      <IconCloudRain className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {result.place.displayName}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {result.place.state}
                        {result.place.pincode
                          ? ` · PIN ${result.place.pincode}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-lg font-semibold leading-snug text-slate-900">
                    {result.briefing.headline}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {result.briefing.riskSummary}
                  </p>
                </div>
                <RiskBadge level={result.briefing.riskLevel} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Temperature"
                value={`${result.weather.temperatureC}°C`}
                hint={result.weather.condition}
              />
              <MetricCard
                label="Rain (24h)"
                value={`${result.weather.next24hRainMm} mm`}
                hint="Forecast total"
              />
              <MetricCard
                label="Rain chance"
                value={
                  result.weather.maxHourlyRainProbability !== null
                    ? `${result.weather.maxHourlyRainProbability}%`
                    : "N/A"
                }
                hint="Peak hourly probability"
              />
              <MetricCard
                label="Wind"
                value={`${result.weather.windSpeedKmh} km/h`}
                hint={
                  result.weather.humidityPercent !== null
                    ? `${result.weather.humidityPercent}% humidity`
                    : undefined
                }
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {result.weather.daily.map((day) => (
                <div
                  key={day.date}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {formatDayLabel(day.date)}
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {day.condition}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {day.precipitationSumMm} mm expected
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900">
                  24-Hour Monsoon Outlook
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  {result.briefing.monsoonOutlook.next24Hours}
                </p>
                <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                    Peak concern
                  </p>
                  <p className="mt-1 text-sm text-amber-900">
                    {result.briefing.monsoonOutlook.peakConcern}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">
                    Flood risk
                  </span>
                  <RiskBadge level={result.briefing.monsoonOutlook.floodRisk} />
                </div>
              </div>

              <BriefingList
                title="Travel & Commute Guidance"
                items={result.briefing.travelGuidance}
                accent="amber"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <BriefingList
                title="Do This Now"
                items={result.briefing.preparednessActions}
                accent="teal"
              />
              <BriefingList
                title="Watch For"
                items={result.briefing.watchFor}
                accent="slate"
              />
            </div>

            <p className="text-center text-xs text-slate-500">
              Live data from Open-Meteo · AI analysis by JalVayu
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
