"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/components/providers/SocketProvider";
import {
  isSevereWeatherAlert,
  type SevereWeatherAlert,
} from "@/lib/types/alert";

export function JuryAlertBanner() {
  const { socket } = useSocket();
  const [alert, setAlert] = useState<SevereWeatherAlert | null>(null);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleSevereWeatherAlert = (payload: unknown) => {
      if (!isSevereWeatherAlert(payload)) {
        console.warn("[JuryAlertBanner] Invalid alert payload received");
        return;
      }

      setAlert(payload);
    };

    socket.on("severe_weather_alert", handleSevereWeatherAlert);

    return () => {
      socket.off("severe_weather_alert", handleSevereWeatherAlert);
    };
  }, [socket]);

  if (!alert) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-x-0 top-0 z-50 bg-monsoon-alert px-4 py-4 text-white shadow-lg sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20"
            aria-hidden="true"
          >
            <svg
              className="h-6 w-6 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
              />
            </svg>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/80">
              {alert.type.replace("_", " ")} · {alert.severity}
            </p>
            <h2 className="mt-1 text-xl font-bold leading-tight sm:text-2xl">
              {alert.headline}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-white/95 sm:text-lg">
              {alert.message}
            </p>
            <p className="mt-2 text-xs text-white/70">
              Issued {new Date(alert.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAlert(null)}
          className="monsoon-touch-target shrink-0 rounded-lg bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-monsoon-alert transition-colors hover:bg-monsoon-light focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-monsoon-alert"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
}
