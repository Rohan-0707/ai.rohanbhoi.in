import { resolvePlaceQuery } from "@/lib/weather-geocode";
import { fetchWeatherSnapshot } from "@/lib/weather-fetch";

export type PlanWeatherSummary = {
  available: boolean;
  displayName?: string;
  temperatureC?: number;
  condition?: string;
  humidityPercent?: number | null;
  windSpeedKmh?: number;
  next24hRainMm?: number;
  maxHourlyRainProbability?: number | null;
  daily?: Array<{
    date: string;
    condition: string;
    precipitationSumMm: number;
  }>;
};

export async function buildPlanWeatherContext(
  locationQuery: string,
): Promise<{
  summary: PlanWeatherSummary;
  openAiContext: Record<string, unknown>;
}> {
  try {
    const place = await resolvePlaceQuery(locationQuery);
    const snapshot = await fetchWeatherSnapshot(
      place.latitude,
      place.longitude,
    );

    const summary: PlanWeatherSummary = {
      available: true,
      displayName: place.displayName,
      temperatureC: snapshot.temperatureC,
      condition: snapshot.condition,
      humidityPercent: snapshot.humidityPercent,
      windSpeedKmh: snapshot.windSpeedKmh,
      next24hRainMm: snapshot.next24hRainMm,
      maxHourlyRainProbability: snapshot.maxHourlyRainProbability,
      daily: snapshot.daily.map((day) => ({
        date: day.date,
        condition: day.condition,
        precipitationSumMm: day.precipitationSumMm,
      })),
    };

    return {
      summary,
      openAiContext: {
        available: true,
        source: "Open-Meteo",
        resolvedPlace: {
          displayName: place.displayName,
          area: place.area,
          district: place.district,
          state: place.state,
          pincode: place.pincode,
          latitude: place.latitude,
          longitude: place.longitude,
        },
        current: {
          temperatureC: snapshot.temperatureC,
          condition: snapshot.condition,
          humidityPercent: snapshot.humidityPercent,
          windSpeedKmh: snapshot.windSpeedKmh,
          precipitationMm: snapshot.precipitationMm,
          weatherCode: snapshot.weatherCode,
        },
        forecast: {
          next24hRainMm: snapshot.next24hRainMm,
          maxHourlyRainProbability: snapshot.maxHourlyRainProbability,
          daily: snapshot.daily,
          next12Hours: snapshot.hourly.slice(0, 12).map((hour) => ({
            time: hour.time,
            precipitationMm: hour.precipitationMm,
            precipitationProbability: hour.precipitationProbability,
            condition: hour.weatherCode,
          })),
        },
      },
    };
  } catch (error) {
    console.warn("[plan-weather] Could not load live weather:", error);

    return {
      summary: { available: false },
      openAiContext: {
        available: false,
        note: "Live weather could not be resolved for this location. Base the plan on the user's location text and typical monsoon patterns for that area.",
      },
    };
  }
}
