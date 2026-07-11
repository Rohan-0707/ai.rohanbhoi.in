import { NextRequest, NextResponse } from "next/server";
import {
  generateOtpCode,
  getOtpExpiry,
  OTP_EXPIRY_MINUTES,
} from "@/lib/auth";
import {
  isJudgeTestEmail,
  JUDGE_TEST_OTP,
} from "@/lib/auth/judge-access";
import {
  resolveChannel,
  resolveLoginIdentifier,
} from "@/lib/auth/login-identifier";
import type { OtpChannel } from "@/lib/types/otp";
import { sendEmailOtp } from "@/lib/email/send-otp-email";
import { sendWhatsappOtp } from "@/lib/interakt/send-whatsapp-otp";
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

    const isJudgeBypass =
      channel === "email" && isJudgeTestEmail(identifier.email);
    const otpCode = isJudgeBypass ? JUDGE_TEST_OTP : generateOtpCode();
    const otpExpiry = getOtpExpiry();

    await prisma.user.upsert({
      where: { email: identifier.email },
      update: {
        otpCode,
        otpExpiry,
        otpAttempts: 0,
        otpChannel: channel,
        ...(channel === "whatsapp" ? { phone: identifier.phone } : {}),
      },
      create: {
        email: identifier.email,
        otpCode,
        otpExpiry,
        otpAttempts: 0,
        otpChannel: channel,
        phone: channel === "whatsapp" ? identifier.phone : null,
        emailVerified: isJudgeBypass,
      },
    });

    if (!isJudgeBypass) {
      try {
        if (channel === "whatsapp") {
          await sendWhatsappOtp({
            phone: identifier.rawPhone,
            otp: otpCode,
            email: identifier.email,
          });
        } else {
          await sendEmailOtp({ email: identifier.email, otp: otpCode });
        }
      } catch (deliveryError) {
        const message =
          deliveryError instanceof Error
            ? deliveryError.message
            : "Failed to deliver verification code";

        console.error("[api/auth/otp] Delivery failed:", channel, message);

        return NextResponse.json(
          {
            error: message,
            suggestWhatsapp: channel === "email",
            suggestEmail: channel === "whatsapp",
          },
          { status: 502 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      channel: channel as OtpChannel,
      deliveryLabel: identifier.displayLabel,
      message: isJudgeBypass
        ? "Evaluator test access enabled. Use OTP 123456."
        : channel === "whatsapp"
          ? "Verification code sent via WhatsApp."
          : "Verification code sent via email.",
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } catch (error) {
    console.error("[api/auth/otp] Error:", error);
    return NextResponse.json(
      { error: "Failed to send secure code" },
      { status: 500 },
    );
  }
}
