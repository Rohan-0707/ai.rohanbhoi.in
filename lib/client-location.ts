import { WEATHER_FALLBACK_LOCATION } from "@/lib/weather";

export type ResolvedClientLocation = {
  city: string;
  region: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  fromFallback: boolean;
};

const FETCH_TIMEOUT_MS = 6000;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function resolveClientLocation(): Promise<ResolvedClientLocation> {
  try {
    const response = await fetchWithTimeout("https://ipapi.co/json/");

    if (!response.ok) {
      return {
        city: WEATHER_FALLBACK_LOCATION.city,
        region: "Karnataka",
        country: "India",
        latitude: WEATHER_FALLBACK_LOCATION.latitude,
        longitude: WEATHER_FALLBACK_LOCATION.longitude,
        fromFallback: true,
      };
    }

    const data = (await response.json()) as {
      city?: string;
      region?: string;
      country_name?: string;
      latitude?: number;
      longitude?: number;
    };

    if (
      typeof data.latitude !== "number" ||
      typeof data.longitude !== "number"
    ) {
      return {
        city: WEATHER_FALLBACK_LOCATION.city,
        region: "Karnataka",
        country: "India",
        latitude: WEATHER_FALLBACK_LOCATION.latitude,
        longitude: WEATHER_FALLBACK_LOCATION.longitude,
        fromFallback: true,
      };
    }

    return {
      city:
        typeof data.city === "string" && data.city.trim()
          ? data.city.trim()
          : WEATHER_FALLBACK_LOCATION.city,
      region:
        typeof data.region === "string" && data.region.trim()
          ? data.region.trim()
          : null,
      country:
        typeof data.country_name === "string" && data.country_name.trim()
          ? data.country_name.trim()
          : null,
      latitude: data.latitude,
      longitude: data.longitude,
      fromFallback: false,
    };
  } catch {
    return {
      city: WEATHER_FALLBACK_LOCATION.city,
      region: "Karnataka",
      country: "India",
      latitude: WEATHER_FALLBACK_LOCATION.latitude,
      longitude: WEATHER_FALLBACK_LOCATION.longitude,
      fromFallback: true,
    };
  }
}
