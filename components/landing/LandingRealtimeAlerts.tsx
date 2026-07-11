"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  IconCloudRain,
  IconLocation,
  IconShield,
} from "@/components/dashboard/CitizenIcons";
import { resolveClientLocation } from "@/lib/client-location";
import { useSocket } from "@/components/providers/SocketProvider";
import type { AlertPhase, AlertsFeedResponse } from "@/lib/types/alerts-feed";
import {
  isSevereWeatherAlert,
  type SevereWeatherAlert,
} from "@/lib/types/alert";

const PHASE_LABELS: Record<AlertPhase, string> = {
  before: "Before the storm",
  during: "During the storm",
  after: "After the storm",
};

const PHASE_ORDER: AlertPhase[] = ["before", "during", "after"];

const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

function formatAlertTime(timestamp: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function severityStyles(severity: string): string {
  const normalized = severity.toLowerCase();

  if (normalized === "severe" || normalized === "critical") {
    return "bg-red-100 text-red-900 border-red-200";
  }

  if (normalized === "high") {
    return "bg-orange-100 text-orange-900 border-orange-200";
  }

  if (normalized === "moderate") {
    return "bg-amber-100 text-amber-900 border-amber-200";
  }

  return "bg-emerald-100 text-emerald-900 border-emerald-200";
}

function phaseDot(phase: AlertPhase): string {
  if (phase === "before") {
    return "bg-teal-500";
  }

  if (phase === "during") {
    return "bg-amber-500";
  }

  return "bg-slate-500";
}

type LandingRealtimeAlertsProps = {
  loginHref: string;
};

export function LandingRealtimeAlerts({ loginHref }: LandingRealtimeAlertsProps) {
  const { socket, isConnected } = useSocket();
  const [feed, setFeed] = useState<AlertsFeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState("Detecting your area…");
  const [liveBroadcasts, setLiveBroadcasts] = useState<SevereWeatherAlert[]>([]);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const location = await resolveClientLocation();

      setLocationLabel(
        [location.city, location.region, location.country]
          .filter(Boolean)
          .join(", "),
      );

      const response = await fetch("/api/alerts/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: location.city,
          region: location.region,
          country: location.country,
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      const data = (await response.json()) as AlertsFeedResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Could not load location alerts");
      }

      setFeed({
        ...data,
        location: {
          ...data.location,
          fromFallback: location.fromFallback,
        },
      });
    } catch (loadError) {
      setFeed(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load location alerts",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeed();

    const interval = window.setInterval(() => {
      void loadFeed();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [loadFeed]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleSevereWeatherAlert = (payload: unknown) => {
      if (!isSevereWeatherAlert(payload)) {
        return;
      }

      setLiveBroadcasts((current) =>
        [payload, ...current.filter((item) => item.timestamp !== payload.timestamp)].slice(
          0,
          3,
        ),
      );
    };

    socket.on("severe_weather_alert", handleSevereWeatherAlert);

    return () => {
      socket.off("severe_weather_alert", handleSevereWeatherAlert);
    };
  }, [socket]);

  const localAlerts = feed?.local ?? [];
  const nationalAlerts = feed?.national ?? [];

  return (
    <section id="realtime-alerts" className="scroll-mt-24 print:hidden">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 text-white shadow-xl">
        <div className="border-b border-white/10 px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                Auto-detected · Live weather intelligence
              </p>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Real-Time Alerts for Your Area &amp; India
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                We silently detect your location, pull Open-Meteo readings, and
                generate before, during, and after monsoon alerts — local on the
                left, national outlook on the right. Socket.io adds instant
                emergency broadcasts.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-teal-400/30 bg-teal-500/10 px-4 py-2 text-sm text-teal-100">
                <IconLocation className="h-4 w-4 shrink-0" aria-hidden />
                <span className="font-medium">{locationLabel}</span>
              </div>
              <div
                className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-medium ${
                  isConnected
                    ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                    : "border-white/15 bg-white/5 text-slate-300"
                }`}
                role="status"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isConnected ? "animate-pulse bg-emerald-400" : "bg-slate-500"
                  }`}
                  aria-hidden
                />
                {isConnected ? "Socket.io channel active" : "Connecting…"}
              </div>
              <button
                type="button"
                onClick={() => void loadFeed()}
                disabled={loading}
                className="monsoon-touch-target inline-flex justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-amber-400/50 hover:bg-white/15 disabled:opacity-60"
              >
                {loading ? "Refreshing…" : "Refresh alerts"}
              </button>
            </div>
          </div>

          {feed?.weather && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                <p className="text-xs uppercase tracking-wide text-slate-400">Local</p>
                <p className="mt-1 font-semibold">{feed.weather.local.condition}</p>
                <p className="text-xs text-slate-400">
                  {feed.weather.local.temperatureC}°C · {feed.weather.local.next24hRainMm} mm
                  / 24h
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm sm:col-span-2 lg:col-span-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  India national outlook
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-200">
                  {feed.weather.nationalSummary}
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="border-b border-white/10 bg-red-500/10 px-5 py-4 text-sm text-red-100 sm:px-8">
            {error}
          </div>
        )}

        <div className="grid gap-0 border-t border-white/10 bg-slate-50 lg:grid-cols-2">
          {/* Left: Local area */}
          <div className="border-b border-slate-200 px-5 py-8 text-slate-900 sm:px-8 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <IconLocation className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Your area — local alerts &amp; updates
                </h3>
                <p className="text-sm text-slate-600">
                  Hyper-local before, during, and after guidance for{" "}
                  {feed?.location.city ?? "your location"}.
                </p>
              </div>
            </div>

            {loading && !feed ? (
              <div className="mt-6 space-y-3">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-2xl bg-slate-200"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {liveBroadcasts.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-red-700">
                      Live Socket.io broadcast
                    </p>
                    {liveBroadcasts.map((alert) => (
                      <article
                        key={alert.timestamp}
                        role="alert"
                        className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${severityStyles(alert.severity)}`}
                          >
                            {alert.severity}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {formatAlertTime(alert.timestamp)}
                          </span>
                        </div>
                        <h4 className="mt-2 font-bold text-slate-900">
                          {alert.headline}
                        </h4>
                        <p className="mt-1 text-sm text-slate-700">{alert.message}</p>
                      </article>
                    ))}
                  </div>
                )}

                {PHASE_ORDER.map((phase) => {
                  const items = localAlerts.filter((item) => item.phase === phase);

                  if (items.length === 0) {
                    return null;
                  }

                  return (
                    <div key={phase}>
                      <div className="mb-3 flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${phaseDot(phase)}`}
                          aria-hidden
                        />
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {PHASE_LABELS[phase]}
                        </p>
                      </div>
                      <ul className="space-y-3">
                        {items.map((alert, index) => (
                          <li
                            key={`${phase}-${index}`}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${severityStyles(alert.severity)}`}
                              >
                                {alert.severity}
                              </span>
                            </div>
                            <h4 className="mt-2 font-semibold text-slate-900">
                              {alert.headline}
                            </h4>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">
                              {alert.message}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}

            {feed?.generatedAt && (
              <p className="mt-6 text-xs text-slate-500">
                Updated {formatAlertTime(feed.generatedAt)}
                {feed.location.fromFallback ? " · using Bengaluru fallback" : ""}
              </p>
            )}
          </div>

          {/* Right: Country level */}
          <div className="px-5 py-8 text-slate-900 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <IconCloudRain className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  India — country-level outlook
                </h3>
                <p className="text-sm text-slate-600">
                  National monsoon alerts aggregated from Delhi, Mumbai, Chennai,
                  Kolkata, and Bengaluru live data.
                </p>
              </div>
            </div>

            {loading && !feed ? (
              <div className="mt-6 space-y-3">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-2xl bg-slate-200"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {PHASE_ORDER.map((phase) => {
                  const items = nationalAlerts.filter((item) => item.phase === phase);

                  if (items.length === 0) {
                    return null;
                  }

                  return (
                    <div key={phase}>
                      <div className="mb-3 flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${phaseDot(phase)}`}
                          aria-hidden
                        />
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {PHASE_LABELS[phase]}
                        </p>
                      </div>
                      <ul className="space-y-3">
                        {items.map((alert, index) => (
                          <li
                            key={`national-${phase}-${index}`}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${severityStyles(alert.severity)}`}
                              >
                                {alert.severity}
                              </span>
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                India
                              </span>
                            </div>
                            <h4 className="mt-2 font-semibold text-slate-900">
                              {alert.headline}
                            </h4>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">
                              {alert.message}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-5">
              <div className="flex items-start gap-3">
                <IconShield className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Personalized local plans
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Sign in to save alerts history, household plans, and encrypted
                    medical needs for your exact neighborhood.
                  </p>
                  <Link
                    href={loginHref}
                    className="mt-3 inline-flex text-sm font-semibold text-teal-600 hover:text-teal-700"
                  >
                    Create your free plan →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
