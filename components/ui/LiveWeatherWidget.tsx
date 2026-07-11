"use client";

import { useEffect, useState } from "react";
import {
  getWeatherIconKind,
  parseWeatherCode,
  WEATHER_FALLBACK_LOCATION,
  type WeatherIconKind,
  type WeatherLocation,
} from "@/lib/weather";

type LiveWeather = {
  temperature: number;
  condition: string;
  city: string;
  icon: WeatherIconKind;
};

type LiveWeatherWidgetProps = {
  variant?: "dark" | "light";
};

const FETCH_TIMEOUT_MS = 6000;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function resolveLocation(): Promise<{
  location: WeatherLocation;
  fromFallback: boolean;
}> {
  try {
    const response = await fetchWithTimeout("https://ipapi.co/json/");

    if (!response.ok) {
      return { location: WEATHER_FALLBACK_LOCATION, fromFallback: true };
    }

    const data = (await response.json()) as {
      city?: string;
      latitude?: number;
      longitude?: number;
    };

    if (
      typeof data.latitude !== "number" ||
      typeof data.longitude !== "number"
    ) {
      return { location: WEATHER_FALLBACK_LOCATION, fromFallback: true };
    }

    return {
      location: {
        city:
          typeof data.city === "string" && data.city.trim()
            ? data.city.trim()
            : WEATHER_FALLBACK_LOCATION.city,
        latitude: data.latitude,
        longitude: data.longitude,
      },
      fromFallback: false,
    };
  } catch {
    return { location: WEATHER_FALLBACK_LOCATION, fromFallback: true };
  }
}

async function fetchCurrentWeather(
  location: WeatherLocation,
): Promise<LiveWeather | null> {
  try {
    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      current_weather: "true",
    });

    const response = await fetchWithTimeout(
      `https://api.open-meteo.com/v1/forecast?${params}`,
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      current_weather?: {
        temperature?: number;
        weathercode?: number;
      };
    };

    const current = data.current_weather;

    if (
      !current ||
      typeof current.temperature !== "number" ||
      typeof current.weathercode !== "number"
    ) {
      return null;
    }

    return {
      temperature: Math.round(current.temperature),
      condition: parseWeatherCode(current.weathercode),
      city: location.city,
      icon: getWeatherIconKind(current.weathercode),
    };
  } catch {
    return null;
  }
}

function WeatherIcon({ kind }: { kind: WeatherIconKind }) {
  if (kind === "clear") {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7 text-amber-300" fill="none">
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        <path
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        />
      </svg>
    );
  }

  if (kind === "rain" || kind === "storm") {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7 text-sky-300" fill="none">
        <path
          fill="currentColor"
          d="M7 14a4 4 0 0 1 .2-8 5 5 0 0 1 9.6 1.5A3.5 3.5 0 1 1 17 14H7Z"
          opacity="0.9"
        />
        <path
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          d="M9 17v3M13 16v4M17 17v3"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 text-slate-200" fill="none">
      <path
        fill="currentColor"
        d="M7 13a4 4 0 0 1 .2-8 5 5 0 0 1 9.6 1.5A3.5 3.5 0 1 1 17 13H7Z"
        opacity="0.9"
      />
    </svg>
  );
}

function WeatherSkeleton({ variant }: { variant: "dark" | "light" }) {
  const shell =
    variant === "dark"
      ? "bg-white/10 border-white/20"
      : "bg-white border-slate-200";

  return (
    <div
      className={`flex animate-pulse items-center gap-4 rounded-2xl border p-4 shadow-lg backdrop-blur-md ${shell}`}
      aria-hidden="true"
    >
      <div className="h-7 w-7 rounded-full bg-white/20" />
      <div className="space-y-2">
        <div className="h-5 w-16 rounded bg-white/20" />
        <div className="h-3 w-28 rounded bg-white/15" />
      </div>
    </div>
  );
}

export function LiveWeatherWidget({ variant = "dark" }: LiveWeatherWidgetProps) {
  const [weather, setWeather] = useState<LiveWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      const { location, fromFallback } = await resolveLocation();
      const result = await fetchCurrentWeather(location);

      if (cancelled) {
        return;
      }

      if (!result) {
        setError(true);
        setWeather({
          temperature: 28,
          condition: "Partly Cloudy",
          city: location.city,
          icon: "partly",
        });
      } else {
        setError(fromFallback);
        setWeather(result);
      }

      setLoading(false);
    }

    void loadWeather();

    return () => {
      cancelled = true;
    };
  }, []);

  const shellClass =
    variant === "dark"
      ? "bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg"
      : "bg-white backdrop-blur-md border border-slate-200 text-slate-900 shadow-sm";

  if (loading) {
    return (
      <div aria-label="Loading live weather" className="mb-5 inline-flex">
        <WeatherSkeleton variant={variant} />
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div
      className={`mb-5 inline-flex items-center gap-4 rounded-2xl p-4 ${shellClass}`}
      aria-label={`Live weather in ${weather.city}`}
      data-weather-error={error ? "true" : undefined}
    >
      <WeatherIcon kind={weather.icon} />
      <div>
        <p className="text-2xl font-bold leading-none tabular-nums">
          {weather.temperature}°C
        </p>
        <p
          className={`mt-1 text-sm ${
            variant === "dark" ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {weather.city} • {weather.condition}
        </p>
      </div>
    </div>
  );
}
