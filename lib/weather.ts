export type WeatherLocation = {
  city: string;
  latitude: number;
  longitude: number;
};

export const WEATHER_FALLBACK_LOCATION: WeatherLocation = {
  city: "Bengaluru",
  latitude: 12.9716,
  longitude: 77.5946,
};

export function parseWeatherCode(code: number): string {
  if (code === 0) {
    return "Clear";
  }

  if (code >= 1 && code <= 3) {
    return "Partly Cloudy";
  }

  if (code >= 45 && code <= 48) {
    return "Foggy";
  }

  if (code >= 51 && code <= 65) {
    return "Rain";
  }

  if (code >= 66 && code <= 67) {
    return "Freezing Rain";
  }

  if (code >= 71 && code <= 77) {
    return "Snow";
  }

  if (code >= 80 && code <= 82) {
    return "Rain Showers";
  }

  if (code >= 85 && code <= 86) {
    return "Snow Showers";
  }

  if (code >= 95 && code <= 99) {
    return "Thunderstorm";
  }

  return "Cloudy";
}

export type WeatherIconKind = "clear" | "partly" | "rain" | "storm" | "fog";

export function getWeatherIconKind(code: number): WeatherIconKind {
  if (code === 0) {
    return "clear";
  }

  if (code >= 1 && code <= 3) {
    return "partly";
  }

  if (code >= 45 && code <= 48) {
    return "fog";
  }

  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return "rain";
  }

  if (code >= 95 && code <= 99) {
    return "storm";
  }

  return "partly";
}
