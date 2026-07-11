import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  isWeatherBriefing,
  type WeatherBriefing,
} from "@/lib/weather-briefing";
import { fetchWeatherSnapshot } from "@/lib/weather-fetch";
import { resolvePlaceQuery } from "@/lib/weather-geocode";

const SYSTEM_PROMPT = `You are JalVayu AI, a monsoon and flash-flood preparedness expert for Indian households.

You will receive resolved location metadata and live Open-Meteo weather readings. Produce a concise, actionable monsoon weather briefing for families.

RULES:
- Base all judgments on the supplied weather numbers (temperature, rain mm, probabilities, wind).
- Use Indian monsoon context: waterlogging, underpass flooding, drainage stress, commute disruption.
- Be specific to the named area/district when possible.
- riskLevel and monsoonOutlook.floodRisk must be one of: low, moderate, high, severe.
- Respond ONLY with valid JSON matching this schema:
{
  "headline": "one compelling sentence for the location",
  "riskLevel": "low|moderate|high|severe",
  "riskSummary": "2-3 sentences explaining current monsoon risk",
  "monsoonOutlook": {
    "next24Hours": "what to expect in the next 24 hours",
    "peakConcern": "the single biggest risk factor right now",
    "floodRisk": "low|moderate|high|severe"
  },
  "travelGuidance": ["3-4 neighborhood-style travel or commute advisories"],
  "preparednessActions": ["3-4 immediate actions families should take"],
  "watchFor": ["2-3 warning signs to monitor"]
}`;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({ apiKey });
}

async function generateWeatherBriefing(
  context: Record<string, unknown>,
): Promise<WeatherBriefing> {
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

  if (!isWeatherBriefing(parsed)) {
    throw new Error("AI briefing did not match expected schema");
  }

  return parsed;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { query?: string };
    const query = body.query?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Enter a place name or 6-digit PIN code" },
        { status: 400 },
      );
    }

    const place = await resolvePlaceQuery(query);
    const snapshot = await fetchWeatherSnapshot(place.latitude, place.longitude);

    const briefing = await generateWeatherBriefing({
      location: place,
      weather: snapshot,
      generatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      place: {
        displayName: place.displayName,
        area: place.area,
        district: place.district,
        state: place.state,
        pincode: place.pincode,
        latitude: place.latitude,
        longitude: place.longitude,
      },
      weather: {
        temperatureC: snapshot.temperatureC,
        humidityPercent: snapshot.humidityPercent,
        windSpeedKmh: snapshot.windSpeedKmh,
        condition: snapshot.condition,
        next24hRainMm: snapshot.next24hRainMm,
        maxHourlyRainProbability: snapshot.maxHourlyRainProbability,
        daily: snapshot.daily.map((day) => ({
          date: day.date,
          precipitationSumMm: day.precipitationSumMm,
          condition: day.condition,
        })),
      },
      briefing,
    });
  } catch (error) {
    console.error("[api/weather/briefing] Error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to generate weather briefing";

    const status =
      message.includes("not found") ||
      message.includes("Enter a") ||
      message.includes("PIN code") ||
      message.includes("too long")
        ? 400
        : message.includes("AI") || message.includes("Weather data")
          ? 502
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
