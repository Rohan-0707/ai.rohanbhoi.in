import OpenAI from "openai";
import { fetchWeatherSnapshot } from "@/lib/weather-fetch";
import {
  isAlertsFeedPayload,
  type FeedAlertItem,
} from "@/lib/types/alerts-feed";

export const INDIA_METRO_LOCATIONS = [
  { name: "New Delhi", latitude: 28.6139, longitude: 77.209 },
  { name: "Mumbai", latitude: 19.076, longitude: 72.8777 },
  { name: "Chennai", latitude: 13.0827, longitude: 80.2707 },
  { name: "Kolkata", latitude: 22.5726, longitude: 88.3639 },
  { name: "Bengaluru", latitude: 12.9716, longitude: 77.5946 },
] as const;

const SYSTEM_PROMPT = `You are JalVayu AI, India's monsoon preparedness alert engine.

You receive:
1. localContext — the user's auto-detected area with live Open-Meteo readings
2. nationalContext — live Open-Meteo snapshots for major Indian metros (Delhi, Mumbai, Chennai, Kolkata, Bengaluru)

Produce location-aware alert feeds grounded ONLY in the supplied weather numbers. No fabricated storms.

RULES:
- local: 4-6 alerts for the user's city/region, each tagged phase: before|during|after based on timeline (before=prep/advance, during=active rain/flood, after=recovery)
- national: 4-6 alerts for India-wide monsoon outlook aggregating the metro data
- severity must reflect actual rain mm, probabilities, and conditions provided
- Reference specific numbers from the weather data where relevant
- Indian monsoon context: waterlogging, underpass flooding, Western Ghats, coastal belts, urban drainage

Respond ONLY with valid JSON:
{
  "local": [
    { "phase": "before|during|after", "severity": "low|moderate|high|severe", "headline": "string", "message": "string" }
  ],
  "national": [
    { "phase": "before|during|after", "severity": "low|moderate|high|severe", "headline": "string", "message": "string" }
  ],
  "nationalSummary": "2-3 sentence India-wide monsoon situation summary"
}`;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({ apiKey });
}

export type AlertsLocationInput = {
  city: string;
  region: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
};

export async function buildNationalWeatherContext() {
  const snapshots = await Promise.all(
    INDIA_METRO_LOCATIONS.map(async (metro) => {
      const weather = await fetchWeatherSnapshot(metro.latitude, metro.longitude);

      return {
        city: metro.name,
        condition: weather.condition,
        temperatureC: weather.temperatureC,
        next24hRainMm: weather.next24hRainMm,
        maxHourlyRainProbability: weather.maxHourlyRainProbability,
        daily: weather.daily.map((day) => ({
          date: day.date,
          precipitationSumMm: day.precipitationSumMm,
          condition: day.condition,
        })),
      };
    }),
  );

  return snapshots;
}

async function generateAlertsFeed(context: Record<string, unknown>): Promise<{
  local: FeedAlertItem[];
  national: FeedAlertItem[];
  nationalSummary: string;
}> {
  const openai = getOpenAIClient();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    temperature: 0.35,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(context) },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from AI model");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  if (!isAlertsFeedPayload(parsed)) {
    throw new Error("AI alerts feed did not match expected schema");
  }

  return parsed;
}

export async function fetchLocationAlertsFeed(location: AlertsLocationInput) {
  const [localWeather, nationalMetros] = await Promise.all([
    fetchWeatherSnapshot(location.latitude, location.longitude),
    buildNationalWeatherContext(),
  ]);

  const aiFeed = await generateAlertsFeed({
    localContext: {
      city: location.city,
      region: location.region,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
      weather: {
        condition: localWeather.condition,
        temperatureC: localWeather.temperatureC,
        humidityPercent: localWeather.humidityPercent,
        windSpeedKmh: localWeather.windSpeedKmh,
        next24hRainMm: localWeather.next24hRainMm,
        maxHourlyRainProbability: localWeather.maxHourlyRainProbability,
        daily: localWeather.daily,
      },
    },
    nationalContext: nationalMetros,
    generatedAt: new Date().toISOString(),
  });

  return {
    local: aiFeed.local,
    national: aiFeed.national,
    weather: {
      local: {
        condition: localWeather.condition,
        temperatureC: localWeather.temperatureC,
        next24hRainMm: localWeather.next24hRainMm,
        maxHourlyRainProbability: localWeather.maxHourlyRainProbability,
      },
      nationalSummary: aiFeed.nationalSummary,
    },
  };
}
