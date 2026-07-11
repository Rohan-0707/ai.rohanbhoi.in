import { NextRequest, NextResponse } from "next/server";
import {
  checkDemoAlertCooldown,
  getDemoAlertPhase,
  getNextDemoAlert,
} from "@/lib/evaluator-demo-alert";

const SOCKET_INTERNAL_URL =
  process.env.SOCKET_INTERNAL_URL || "http://127.0.0.1:3001";

function resolveClientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret) {
      return NextResponse.json(
        { error: "Alert broadcasting is not configured" },
        { status: 503 },
      );
    }

    const clientKey = resolveClientKey(request);
    const cooldown = checkDemoAlertCooldown(clientKey);

    if (!cooldown.allowed) {
      return NextResponse.json(
        {
          error: `Please wait ${cooldown.retryAfterSeconds}s before triggering another demo alert`,
        },
        { status: 429 },
      );
    }

    const payload = getNextDemoAlert();
    const phase = getDemoAlertPhase(payload);

    const upstream = await fetch(
      `${SOCKET_INTERNAL_URL}/api/admin/trigger-alert`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminSecret}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    const data = (await upstream.json()) as {
      ok?: boolean;
      recipients?: number;
      error?: string;
    };

    if (!upstream.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to broadcast demo alert" },
        { status: upstream.status },
      );
    }

    return NextResponse.json({
      ok: true,
      phase,
      broadcast: payload,
      recipients: data.recipients ?? 0,
      message:
        "Live alert broadcast over Socket.io. Check the banner and feed on this page.",
    });
  } catch (error) {
    console.error("[api/evaluator/demo-alert] Error:", error);

    return NextResponse.json(
      { error: "Failed to trigger demo alert" },
      { status: 500 },
    );
  }
}
