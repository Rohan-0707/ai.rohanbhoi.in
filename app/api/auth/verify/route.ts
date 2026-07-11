import { NextRequest, NextResponse } from "next/server";
import {
  getSessionCookieOptions,
  OTP_MAX_ATTEMPTS,
  SESSION_COOKIE,
} from "@/lib/auth";
import {
  resolveChannel,
  resolveLoginIdentifier,
} from "@/lib/auth/login-identifier";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const channel = resolveChannel(body.channel);
    const rawEmail = typeof body.email === "string" ? body.email : "";
    const rawPhone =
      typeof body.phone === "string"
        ? body.phone
        : typeof body.whatsappNumber === "string"
          ? body.whatsappNumber
          : "";
    const code =
      typeof body.code === "string"
        ? body.code.trim()
        : typeof body.otp === "string"
          ? body.otp.trim()
          : "";

    if (!code) {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 },
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Verification code must be 6 digits" },
        { status: 400 },
      );
    }

    let identifier;

    try {
      identifier = resolveLoginIdentifier(channel, rawEmail, rawPhone);
    } catch (validationError) {
      const message =
        validationError instanceof Error
          ? validationError.message
          : "Invalid login details";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: identifier.email },
    });

    if (!user || !user.otpCode || !user.otpExpiry) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 401 },
      );
    }

    if (user.otpChannel && user.otpChannel !== channel) {
      return NextResponse.json(
        { error: "Use the same sign-in method you chose when requesting the code" },
        { status: 401 },
      );
    }

    if (user.otpExpiry < new Date()) {
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 401 },
      );
    }

    if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many failed attempts. Request a new code." },
        { status: 429 },
      );
    }

    if (user.otpCode !== code) {
      await prisma.user.update({
        where: { id: user.id },
        data: { otpAttempts: user.otpAttempts + 1 },
      });

      const attemptsLeft = OTP_MAX_ATTEMPTS - (user.otpAttempts + 1);

      return NextResponse.json(
        {
          error: "Invalid verification code",
          attemptsLeft: Math.max(attemptsLeft, 0),
        },
        { status: 401 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiry: null,
        otpAttempts: 0,
        otpChannel: null,
        emailVerified: channel === "email",
        lastLoginAt: new Date(),
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: channel === "email" ? user.email : null,
        phone: channel === "whatsapp" ? user.phone : null,
        name: user.name,
      },
    });

    response.cookies.set(
      SESSION_COOKIE,
      user.id,
      getSessionCookieOptions(),
    );

    return response;
  } catch (error) {
    console.error("[api/auth/verify] Error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 },
    );
  }
}
