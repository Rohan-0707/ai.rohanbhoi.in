import { NextRequest, NextResponse } from "next/server";
import { fetchLocationAlertsFeed } from "@/lib/alerts-feed";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      city?: string;
      region?: string;
      country?: string;
      latitude?: number;
      longitude?: number;
    };

    const city = typeof body.city === "string" ? body.city.trim() : "";
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    if (!city) {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        { error: "Valid latitude and longitude are required" },
        { status: 400 },
      );
    }

    const region =
      typeof body.region === "string" && body.region.trim()
        ? body.region.trim()
        : null;
    const country =
      typeof body.country === "string" && body.country.trim()
        ? body.country.trim()
        : null;

    const feed = await fetchLocationAlertsFeed({
      city,
      region,
      country,
      latitude,
      longitude,
    });

    return NextResponse.json({
      location: {
        city,
        region,
        country,
        latitude,
        longitude,
        fromFallback: false,
      },
      local: feed.local,
      national: feed.national,
      weather: feed.weather,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[api/alerts/feed] Error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to load alerts feed";

    const status =
      message.includes("AI") || message.includes("Weather data") ? 502 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
