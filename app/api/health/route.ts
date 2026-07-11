import { NextResponse } from "next/server";
import { isGoogleTranslateAvailable } from "@/lib/google-translate";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "jalvayu-web",
    timestamp: new Date().toISOString(),
    googleTranslate: isGoogleTranslateAvailable() ? "configured" : "missing",
  });
}
