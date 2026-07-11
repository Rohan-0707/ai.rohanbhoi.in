import { parsePhoneForInterakt } from "@/lib/phone/parse-for-interakt";

type SendWhatsappOtpInput = {
  phone: string;
  otp: string;
  email: string;
};

type InteraktResponse = {
  result?: boolean;
  message?: string;
};

export async function sendWhatsappOtp({
  phone,
  otp,
  email,
}: SendWhatsappOtpInput): Promise<void> {
  const apiKey = process.env.INTERAKT_API_KEY;
  const templateName =
    process.env.INTERAKT_OTP_TEMPLATE_NAME || "otp_for_help_desk";
  const languageCode = process.env.INTERAKT_OTP_LANGUAGE_CODE || "en";

  if (!apiKey) {
    throw new Error("WhatsApp OTP is not configured");
  }

  const { countryCode, phoneNumber } = parsePhoneForInterakt(phone);

  const payload = {
    countryCode,
    phoneNumber,
    type: "Template",
    callbackData: JSON.stringify({
      purpose: "jalvayu_access",
      email,
      channel: "whatsapp",
    }),
    template: {
      name: templateName,
      languageCode,
      bodyValues: [otp],
      buttonValues: {
        "0": [otp],
      },
    },
  };

  const response = await fetch("https://api.interakt.ai/v1/public/message/", {
    method: "POST",
    headers: {
      Authorization: `Basic ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as InteraktResponse;

  if (!response.ok || data.result !== true) {
    console.error("[interakt] WhatsApp OTP failed:", data);
    throw new Error(data.message || "Failed to send WhatsApp verification code");
  }
}
