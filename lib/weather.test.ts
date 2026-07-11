import { describe, expect, it } from "vitest";
import {
  getWeatherIconKind,
  parseWeatherCode,
  WEATHER_FALLBACK_LOCATION,
} from "@/lib/weather";

describe("weather helpers", () => {
  it("maps Open-Meteo weather codes to readable labels", () => {
    expect(parseWeatherCode(0)).toBe("Clear");
    expect(parseWeatherCode(2)).toBe("Partly Cloudy");
    expect(parseWeatherCode(55)).toBe("Rain");
    expect(parseWeatherCode(95)).toBe("Thunderstorm");
  });

  it("selects icon kinds from weather codes", () => {
    expect(getWeatherIconKind(0)).toBe("clear");
    expect(getWeatherIconKind(61)).toBe("rain");
    expect(getWeatherIconKind(99)).toBe("storm");
  });

  it("exposes a Bengaluru fallback location", () => {
    expect(WEATHER_FALLBACK_LOCATION.city).toBe("Bengaluru");
  });
});
