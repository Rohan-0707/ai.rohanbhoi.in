export const ALERT_PHASES = ["before", "during", "after"] as const;
export const ALERT_SEVERITIES = ["low", "moderate", "high", "severe"] as const;

export type AlertPhase = (typeof ALERT_PHASES)[number];
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

export type FeedAlertItem = {
  phase: AlertPhase;
  severity: AlertSeverity;
  headline: string;
  message: string;
};

export type AlertsFeedResponse = {
  location: {
    city: string;
    region: string | null;
    country: string | null;
    latitude: number;
    longitude: number;
    fromFallback: boolean;
  };
  local: FeedAlertItem[];
  national: FeedAlertItem[];
  weather: {
    local: {
      condition: string;
      temperatureC: number;
      next24hRainMm: number;
      maxHourlyRainProbability: number | null;
    };
    nationalSummary: string;
  };
  generatedAt: string;
};

function isAlertPhase(value: unknown): value is AlertPhase {
  return typeof value === "string" && ALERT_PHASES.includes(value as AlertPhase);
}

function isAlertSeverity(value: unknown): value is AlertSeverity {
  return (
    typeof value === "string" &&
    ALERT_SEVERITIES.includes(value as AlertSeverity)
  );
}

function isFeedAlertItem(value: unknown): value is FeedAlertItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    isAlertPhase(item.phase) &&
    isAlertSeverity(item.severity) &&
    typeof item.headline === "string" &&
    item.headline.trim().length > 0 &&
    typeof item.message === "string" &&
    item.message.trim().length > 0
  );
}

function isFeedAlertList(value: unknown, min = 2): value is FeedAlertItem[] {
  return (
    Array.isArray(value) &&
    value.length >= min &&
    value.every(isFeedAlertItem)
  );
}

export function isAlertsFeedPayload(payload: unknown): payload is {
  local: FeedAlertItem[];
  national: FeedAlertItem[];
  nationalSummary: string;
} {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const record = payload as Record<string, unknown>;

  return (
    isFeedAlertList(record.local) &&
    isFeedAlertList(record.national) &&
    typeof record.nationalSummary === "string" &&
    record.nationalSummary.trim().length > 0
  );
}
