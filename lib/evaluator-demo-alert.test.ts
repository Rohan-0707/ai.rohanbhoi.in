import {
  checkDemoAlertCooldown,
  getNextDemoAlert,
  resetDemoAlertCooldownForTests,
} from "@/lib/evaluator-demo-alert";
import { describe, expect, it, beforeEach } from "vitest";

describe("evaluator demo alert", () => {
  beforeEach(() => {
    resetDemoAlertCooldownForTests();
  });

  it("rotates through before, during, and after alert templates", () => {
    const first = getNextDemoAlert();
    const second = getNextDemoAlert();
    const third = getNextDemoAlert();
    const fourth = getNextDemoAlert();

    expect(first.type).toBe("advance_warning");
    expect(second.type).toBe("flash_flood");
    expect(third.type).toBe("recovery_update");
    expect(fourth.type).toBe("advance_warning");
  });

  it("stamps each broadcast with a live timestamp", () => {
    const alert = getNextDemoAlert();

    expect(() => new Date(alert.timestamp)).not.toThrow();
    expect(alert.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("enforces cooldown per client key", () => {
    expect(checkDemoAlertCooldown("judge-ip").allowed).toBe(true);
    expect(checkDemoAlertCooldown("judge-ip").allowed).toBe(false);
    expect(checkDemoAlertCooldown("other-ip").allowed).toBe(true);
  });
});
