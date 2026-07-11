export const WEATHER_RISK_LEVELS = [
  "low",
  "moderate",
  "high",
  "severe",
] as const;

export type WeatherRiskLevel = (typeof WEATHER_RISK_LEVELS)[number];

export type WeatherBriefing = {
  headline: string;
  riskLevel: WeatherRiskLevel;
  riskSummary: string;
  monsoonOutlook: {
    next24Hours: string;
    peakConcern: string;
    floodRisk: WeatherRiskLevel;
  };
  travelGuidance: string[];
  preparednessActions: string[];
  watchFor: string[];
};

export function isWeatherRiskLevel(value: unknown): value is WeatherRiskLevel {
  return (
    typeof value === "string" &&
    WEATHER_RISK_LEVELS.includes(value as WeatherRiskLevel)
  );
}

export function isWeatherBriefing(payload: unknown): payload is WeatherBriefing {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const briefing = payload as Record<string, unknown>;
  const outlook = briefing.monsoonOutlook;

  if (!outlook || typeof outlook !== "object") {
    return false;
  }

  const outlookRecord = outlook as Record<string, unknown>;

  const isStringArray = (value: unknown, min = 2) =>
    Array.isArray(value) &&
    value.length >= min &&
    value.every((item) => typeof item === "string" && item.trim().length > 0);

  return (
    typeof briefing.headline === "string" &&
    briefing.headline.trim().length > 0 &&
    isWeatherRiskLevel(briefing.riskLevel) &&
    typeof briefing.riskSummary === "string" &&
    typeof outlookRecord.next24Hours === "string" &&
    typeof outlookRecord.peakConcern === "string" &&
    isWeatherRiskLevel(outlookRecord.floodRisk) &&
    isStringArray(briefing.travelGuidance) &&
    isStringArray(briefing.preparednessActions) &&
    isStringArray(briefing.watchFor)
  );
}

export type WeatherBriefingResponse = {
  place: {
    displayName: string;
    area: string;
    district: string;
    state: string;
    pincode: string | null;
    latitude: number;
    longitude: number;
  };
  weather: {
    temperatureC: number;
    humidityPercent: number | null;
    windSpeedKmh: number;
    condition: string;
    next24hRainMm: number;
    maxHourlyRainProbability: number | null;
    daily: Array<{
      date: string;
      precipitationSumMm: number;
      condition: string;
    }>;
  };
  briefing: WeatherBriefing;
};
