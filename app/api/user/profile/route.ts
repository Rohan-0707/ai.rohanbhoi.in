import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";

function formatAccountEmail(email: string, phone: string | null): string {
  if (email.includes("@whatsapp.jalvayu")) {
    return phone ? `+91 ${phone}` : "WhatsApp account";
  }

  return email;
}

export async function GET() {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        phone: true,
        defaultLocation: true,
        housingType: true,
        familySize: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      email: formatAccountEmail(user.email, user.phone),
      phone: user.phone ? `+91 ${user.phone}` : null,
      defaultLocation: user.defaultLocation ?? "",
      housingType: user.housingType ?? "Apartment",
      familySize: user.familySize ?? 4,
    });
  } catch (error) {
    console.error("[api/user/profile] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const defaultLocation =
      typeof body.defaultLocation === "string"
        ? body.defaultLocation.trim()
        : undefined;
    const housingType =
      typeof body.housingType === "string" ? body.housingType.trim() : undefined;
    const familySize =
      typeof body.familySize === "number"
        ? body.familySize
        : typeof body.familySize === "string"
          ? Number.parseInt(body.familySize, 10)
          : undefined;

    if (
      familySize !== undefined &&
      (Number.isNaN(familySize) || familySize < 1 || familySize > 20)
    ) {
      return NextResponse.json(
        { error: "Family size must be between 1 and 20" },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(defaultLocation !== undefined ? { defaultLocation } : {}),
        ...(housingType !== undefined ? { housingType } : {}),
        ...(familySize !== undefined ? { familySize } : {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/user/profile] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
