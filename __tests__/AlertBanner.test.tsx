import { act, render, screen } from "@testing-library/react";
import { JuryAlertBanner } from "@/components/ui/JuryAlertBanner";
import type { SevereWeatherAlert } from "@/lib/types/alert";

const mockAlert: SevereWeatherAlert = {
  type: "flash_flood",
  severity: "severe",
  headline: "Flash flood warning for Yelahanka",
  message:
    "Heavy rainfall may cause waterlogging near Nandi Lake. Avoid low-lying roads.",
  timestamp: "2026-07-11T10:30:00.000Z",
};

type AlertHandler = (payload: unknown) => void;

const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
};

jest.mock("@/components/providers/SocketProvider", () => ({
  useSocket: () => ({ socket: mockSocket, isConnected: true }),
}));

function emitMockAlert(alert: SevereWeatherAlert) {
  const registration = mockSocket.on.mock.calls.find(
    ([event]) => event === "severe_weather_alert",
  );

  const handler = registration?.[1] as AlertHandler | undefined;

  if (!handler) {
    throw new Error("severe_weather_alert handler was not registered");
  }

  act(() => {
    handler(alert);
  });
}

describe("JuryAlertBanner", () => {
  beforeEach(() => {
    mockSocket.on.mockClear();
    mockSocket.off.mockClear();
  });

  it("renders alert content when a valid severe weather alert is received", () => {
    render(<JuryAlertBanner />);

    emitMockAlert(mockAlert);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(mockAlert.headline)).toBeInTheDocument();
    expect(screen.getByText(mockAlert.message)).toBeInTheDocument();
    expect(screen.getByText(/flash flood · severe/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /acknowledge/i }),
    ).toBeInTheDocument();
  });

  it("does not render when no alert has been received", () => {
    render(<JuryAlertBanner />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
