import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plans = await prisma.emergencyPlan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        location: true,
        familySize: true,
        housingType: true,
        checklist: true,
        safetyRecommendations: true,
        summary: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("[api/user/history] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan history" },
      { status: 500 },
    );
  }
}
