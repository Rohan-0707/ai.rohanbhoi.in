import { parsePhoneForInterakt } from "@/lib/phone/parse-for-interakt";
import type { OtpChannel } from "@/lib/types/otp";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginIdentifier = {
  channel: OtpChannel;
  email: string;
  phone: string;
  rawPhone: string;
  displayLabel: string;
};

export function resolveChannel(value: unknown): OtpChannel {
  if (typeof value !== "string") {
    return "email";
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "whatsapp" || normalized === "wa" ? "whatsapp" : "email";
}

export function whatsappPlaceholderEmail(
  countryCode: string,
  phoneNumber: string,
): string {
  const countryDigits = countryCode.replace(/\D/g, "");
  return `${countryDigits}${phoneNumber}@whatsapp.jalvayu`;
}

export function maskPhone(countryCode: string, phoneNumber: string): string {
  const lastFour = phoneNumber.slice(-4);
  const countryDigits = countryCode.replace(/\D/g, "");
  return `+${countryDigits} ******${lastFour}`;
}

export function resolveLoginIdentifier(
  channel: OtpChannel,
  rawEmail: string,
  rawPhone: string,
): LoginIdentifier {
  if (channel === "email") {
    const email = rawEmail.trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      throw new Error("Enter a valid email address");
    }

    return {
      channel,
      email,
      phone: "",
      rawPhone: "",
      displayLabel: email,
    };
  }

  const raw = rawPhone.trim();

  if (!raw) {
    throw new Error("Enter your WhatsApp number");
  }

  const parsed = parsePhoneForInterakt(raw);

  return {
    channel,
    email: whatsappPlaceholderEmail(parsed.countryCode, parsed.phoneNumber),
    phone: parsed.phoneNumber,
    rawPhone: raw,
    displayLabel: maskPhone(parsed.countryCode, parsed.phoneNumber),
  };
}
