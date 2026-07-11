import { parseWeatherCode } from "@/lib/weather";

export type WeatherSnapshot = {
  temperatureC: number;
  humidityPercent: number | null;
  windSpeedKmh: number;
  precipitationMm: number;
  weatherCode: number;
  condition: string;
  hourly: Array<{
    time: string;
    precipitationMm: number;
    precipitationProbability: number | null;
    weatherCode: number;
  }>;
  daily: Array<{
    date: string;
    precipitationSumMm: number;
    weatherCode: number;
    condition: string;
  }>;
  next24hRainMm: number;
  maxHourlyRainProbability: number | null;
};

type OpenMeteoForecast = {
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    precipitation?: number;
  };
  hourly?: {
    time?: string[];
    precipitation?: number[];
    precipitation_probability?: number[];
    weather_code?: number[];
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    precipitation_sum?: number[];
  };
};

const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchWeatherSnapshot(
  latitude: number,
  longitude: number,
): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation",
    hourly: "precipitation,precipitation_probability,weather_code",
    daily: "weather_code,precipitation_sum",
    timezone: "auto",
    forecast_days: "3",
  });

  const response = await fetchWithTimeout(
    `https://api.open-meteo.com/v1/forecast?${params}`,
  );

  if (!response.ok) {
    throw new Error("Weather data is temporarily unavailable");
  }

  const data = (await response.json()) as OpenMeteoForecast;
  const current = data.current;

  if (
    !current ||
    typeof current.temperature_2m !== "number" ||
    typeof current.weather_code !== "number"
  ) {
    throw new Error("Weather data is incomplete for this location");
  }

  const hourlyTimes = data.hourly?.time ?? [];
  const hourlyPrecip = data.hourly?.precipitation ?? [];
  const hourlyProb = data.hourly?.precipitation_probability ?? [];
  const hourlyCodes = data.hourly?.weather_code ?? [];

  const hourly = hourlyTimes.slice(0, 24).map((time, index) => ({
    time,
    precipitationMm: hourlyPrecip[index] ?? 0,
    precipitationProbability: hourlyProb[index] ?? null,
    weatherCode: hourlyCodes[index] ?? current.weather_code,
  }));

  const dailyTimes = data.daily?.time ?? [];
  const dailyCodes = data.daily?.weather_code ?? [];
  const dailyPrecip = data.daily?.precipitation_sum ?? [];

  const daily = dailyTimes.map((date, index) => {
    const code = dailyCodes[index] ?? current.weather_code;

    return {
      date,
      precipitationSumMm: dailyPrecip[index] ?? 0,
      weatherCode: code,
      condition: parseWeatherCode(code),
    };
  });

  const next24hRainMm = hourly.reduce(
    (sum, hour) => sum + hour.precipitationMm,
    0,
  );
  const probabilities = hourly
    .map((hour) => hour.precipitationProbability)
    .filter((value): value is number => typeof value === "number");

  return {
    temperatureC: Math.round(current.temperature_2m),
    humidityPercent:
      typeof current.relative_humidity_2m === "number"
        ? Math.round(current.relative_humidity_2m)
        : null,
    windSpeedKmh: Math.round(current.wind_speed_10m ?? 0),
    precipitationMm: current.precipitation ?? 0,
    weatherCode: current.weather_code,
    condition: parseWeatherCode(current.weather_code),
    hourly,
    daily,
    next24hRainMm: Math.round(next24hRainMm * 10) / 10,
    maxHourlyRainProbability:
      probabilities.length > 0 ? Math.max(...probabilities) : null,
  };
}
