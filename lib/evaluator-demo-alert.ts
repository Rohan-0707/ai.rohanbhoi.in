import type { SevereWeatherAlert } from "@/lib/types/alert";

const COOLDOWN_MS = 15_000;

const demoCooldown = new Map<string, number>();

const DEMO_SEQUENCE: Array<
  Omit<SevereWeatherAlert, "timestamp"> & { phase: string }
> = [
  {
    phase: "before",
    type: "advance_warning",
    severity: "moderate",
    headline: "Heavy Rain Expected — Prepare Now",
    message:
      "Open-Meteo outlook shows rising rain probability in the next 12 hours. Move vehicles to higher ground, charge devices, and review your household Before-the-storm checklist.",
  },
  {
    phase: "during",
    type: "flash_flood",
    severity: "high",
    headline: "Flash Flood Advisory — Avoid Low-Lying Roads",
    message:
      "Live monitoring indicates waterlogging risk near underpasses and junctions. Shelter in place if safe; do not drive through standing water.",
  },
  {
    phase: "after",
    type: "recovery_update",
    severity: "low",
    headline: "Storm Clearing — Recovery Guidance",
    message:
      "Rain intensity is decreasing. Check for structural damage, avoid downed power lines, and use elevated routes until drainage systems recover.",
  },
];

let sequenceIndex = 0;

export function getNextDemoAlert(): SevereWeatherAlert {
  const template = DEMO_SEQUENCE[sequenceIndex % DEMO_SEQUENCE.length];
  sequenceIndex += 1;

  return {
    type: template.type,
    severity: template.severity,
    headline: template.headline,
    message: template.message,
    timestamp: new Date().toISOString(),
  };
}

export function getDemoAlertPhase(alert: SevereWeatherAlert): string {
  const match = DEMO_SEQUENCE.find(
    (item) =>
      item.type === alert.type &&
      item.headline === alert.headline &&
      item.severity === alert.severity,
  );

  return match?.phase ?? "during";
}

export function checkDemoAlertCooldown(clientKey: string): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const last = demoCooldown.get(clientKey);

  if (last && now - last < COOLDOWN_MS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((COOLDOWN_MS - (now - last)) / 1000),
    };
  }

  demoCooldown.set(clientKey, now);
  return { allowed: true };
}

export function resetDemoAlertCooldownForTests() {
  demoCooldown.clear();
  sequenceIndex = 0;
}
