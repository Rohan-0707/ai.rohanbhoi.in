export type SevereWeatherAlert = {
  type: string;
  severity: string;
  headline: string;
  message: string;
  timestamp: string;
};

export function isSevereWeatherAlert(
  payload: unknown,
): payload is SevereWeatherAlert {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const alert = payload as Record<string, unknown>;

  return (
    typeof alert.type === "string" &&
    typeof alert.severity === "string" &&
    typeof alert.headline === "string" &&
    typeof alert.message === "string" &&
    typeof alert.timestamp === "string"
  );
}
