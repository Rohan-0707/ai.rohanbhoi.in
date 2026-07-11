"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OtpInput } from "@/components/auth/OtpInput";
import { SecurityBadge } from "@/components/ui/SecurityBadge";
import type { OtpChannel } from "@/lib/types/otp";

type Step = "credentials" | "otp";

type OtpLoginFormProps = {
  variant?: "page" | "embedded";
  tone?: "light" | "glass";
  redirectTo?: string;
};

function normalizePhoneInput(value: string): string {
  return value.replace(/[^\d+]/g, "");
}

export function OtpLoginForm({
  variant = "page",
  tone = "light",
  redirectTo = "/dashboard",
}: OtpLoginFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<OtpChannel>("email");
  const [activeChannel, setActiveChannel] = useState<OtpChannel | null>(null);
  const [deliveryLabel, setDeliveryLabel] = useState("");
  const [sendingChannel, setSendingChannel] = useState<OtpChannel | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fallbackHint, setFallbackHint] = useState<OtpChannel | null>(null);

  const isEmbedded = variant === "embedded";
  const isGlass = tone === "glass";

  const glassInputClass =
    "min-h-12 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500";

  const canSend =
    selectedChannel === "whatsapp"
      ? Boolean(normalizePhoneInput(phone))
      : Boolean(email.trim());

  function handleChannelChange(channel: OtpChannel) {
    setSelectedChannel(channel);
    setError(null);
    setFallbackHint(null);
  }

  function buildSendPayload(channel: OtpChannel) {
    if (channel === "whatsapp") {
      return {
        channel,
        phone: normalizePhoneInput(phone),
        whatsappNumber: normalizePhoneInput(phone),
      };
    }

    return {
      channel,
      email: email.trim().toLowerCase(),
    };
  }

  function buildVerifyPayload(channel: OtpChannel) {
    if (channel === "whatsapp") {
      return {
        channel,
        phone: normalizePhoneInput(phone),
        code: otp,
        otp,
      };
    }

    return {
      channel,
      email: email.trim().toLowerCase(),
      code: otp,
      otp,
    };
  }

  async function handleSendCode(channel: OtpChannel) {
    if (channel === "email" && !email.trim()) {
      setError("Enter your email address.");
      return;
    }

    if (channel === "whatsapp" && !normalizePhoneInput(phone)) {
      setError("Enter your WhatsApp number.");
      return;
    }

    setSendingChannel(channel);
    setError(null);
    setSuccessMessage(null);
    setFallbackHint(null);

    try {
      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSendPayload(channel)),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.suggestWhatsapp) {
          setFallbackHint("whatsapp");
        }
        if (data.suggestEmail) {
          setFallbackHint("email");
        }
        throw new Error(data.error || "Failed to send verification code");
      }

      setActiveChannel(channel);
      setSelectedChannel(channel);
      setDeliveryLabel(
        typeof data.deliveryLabel === "string" ? data.deliveryLabel : "",
      );
      setStep("otp");
      setOtp("");
      setSuccessMessage(
        channel === "whatsapp"
          ? "Verification code sent on WhatsApp."
          : "Verification code sent to your email.",
      );
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Failed to send verification code",
      );
    } finally {
      setSendingChannel(null);
    }
  }

  async function handleVerifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeChannel) {
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildVerifyPayload(activeChannel)),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      router.push(redirectTo);
      router.refresh();
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "Verification failed",
      );
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className={isEmbedded ? "" : "w-full max-w-md"}>
      <div
        className={
          isEmbedded
            ? ""
            : "rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.06)] sm:p-8"
        }
      >
        <div className={isEmbedded ? "mb-6" : "mb-8 text-center"}>
          {isEmbedded ? (
            <>
              <h2
                className={`text-xl font-bold ${isGlass ? "text-white" : "text-slate-900"}`}
              >
                Start your free plan
              </h2>
              <p
                className={`mt-1.5 text-sm ${isGlass ? "text-slate-300" : "text-slate-500"}`}
              >
                {step === "credentials"
                  ? "Sign in with email or WhatsApp — no password needed."
                  : `Enter the 6-digit code sent to ${deliveryLabel || (activeChannel === "whatsapp" ? "WhatsApp" : "your email")}.`}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-widest text-monsoon-secondary">
                JalVayu AI
              </p>
              <h1 className="mt-2 text-2xl font-bold text-monsoon-primary sm:text-3xl">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {step === "credentials"
                  ? "Choose how you want to receive your code."
                  : `Enter the 6-digit code sent to ${deliveryLabel || (activeChannel === "whatsapp" ? "WhatsApp" : "your email")}.`}
              </p>
            </>
          )}
        </div>

        {step === "credentials" ? (
          <div className="space-y-5">
            <div
              role="tablist"
              aria-label="Verification channel"
              className={`grid grid-cols-2 gap-2 rounded-2xl border p-1 ${
                isGlass
                  ? "border-white/20 bg-white/10 backdrop-blur-sm"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedChannel === "email"}
                onClick={() => handleChannelChange("email")}
                className={`monsoon-touch-target rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  selectedChannel === "email"
                    ? "bg-monsoon-secondary text-white shadow-sm"
                    : isGlass
                      ? "text-slate-300 hover:text-white"
                      : "text-slate-500 hover:text-monsoon-primary"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedChannel === "whatsapp"}
                onClick={() => handleChannelChange("whatsapp")}
                className={`monsoon-touch-target rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  selectedChannel === "whatsapp"
                    ? "bg-monsoon-secondary text-white shadow-sm"
                    : isGlass
                      ? "text-slate-300 hover:text-white"
                      : "text-slate-500 hover:text-monsoon-primary"
                }`}
              >
                WhatsApp
              </button>
            </div>

            {selectedChannel === "email" ? (
              <label className="block">
                <span
                  className={`mb-2 block text-sm font-semibold ${
                    isGlass ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Email address
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  className={isGlass ? glassInputClass : "monsoon-input"}
                />
                <p
                  className={`mt-2 rounded-lg px-3 py-2 text-xs leading-relaxed ${
                    isGlass
                      ? "border border-teal-400/30 bg-teal-500/10 text-teal-100"
                      : "border border-teal-200 bg-teal-50 text-teal-800"
                  }`}
                >
                  <span className="font-semibold">Evaluator Access:</span> Use{" "}
                  <span className="font-mono">judge@google.com</span> with OTP{" "}
                  <span className="font-mono">123456</span> to test the
                  dashboard.
                </p>
              </label>
            ) : (
              <label className="block">
                <span
                  className={`mb-2 block text-sm font-semibold ${
                    isGlass ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  WhatsApp number
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="10-digit mobile number"
                  className={isGlass ? glassInputClass : "monsoon-input"}
                />
                <p
                  className={`mt-2 text-xs ${isGlass ? "text-slate-400" : "text-slate-500"}`}
                >
                  With or without country code (+91).
                </p>
              </label>
            )}

            {error && (
              <p className="rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-700">
                {error}
              </p>
            )}

            {fallbackHint && (
              <p className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                Delivery failed. Try{" "}
                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={() => {
                    handleChannelChange(fallbackHint);
                    void handleSendCode(fallbackHint);
                  }}
                >
                  {fallbackHint === "whatsapp" ? "WhatsApp" : "Email"}
                </button>{" "}
                instead.
              </p>
            )}

            <button
              type="button"
              disabled={!canSend || sendingChannel !== null}
              onClick={() => handleSendCode(selectedChannel)}
              className="monsoon-btn-primary w-full"
            >
              {sendingChannel ? "Sending code..." : "Send verification code"}
            </button>

            {isEmbedded && (
              <div className="flex justify-center pt-1">
                <SecurityBadge
                  compact
                  className={
                    isGlass
                      ? "border-white/25 bg-white/15 text-white"
                      : undefined
                  }
                />
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            {successMessage && (
              <p className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                {successMessage}
              </p>
            )}

            <div>
              <span
                className={`mb-4 block text-center text-sm font-semibold ${
                  isGlass ? "text-teal-300" : "text-monsoon-secondary"
                }`}
              >
                6-digit verification code
              </span>
              <OtpInput value={otp} onChange={setOtp} disabled={isVerifying} />
            </div>

            {error && (
              <p className="rounded-2xl bg-orange-50 px-4 py-3 text-center text-sm text-orange-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isVerifying || otp.length !== 6}
              className="monsoon-btn-primary w-full"
            >
              {isVerifying ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Verifying...
                </span>
              ) : (
                "Verify & enter dashboard"
              )}
            </button>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={sendingChannel !== null}
                onClick={() => activeChannel && handleSendCode(activeChannel)}
                className={`monsoon-touch-target w-full text-sm font-medium transition disabled:opacity-60 ${
                  isGlass
                    ? "text-teal-300 hover:text-teal-200"
                    : "text-monsoon-secondary hover:text-teal-700"
                }`}
              >
                {sendingChannel ? "Resending..." : "Resend code"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setOtp("");
                  setActiveChannel(null);
                  setDeliveryLabel("");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`monsoon-touch-target w-full text-sm font-medium transition ${
                  isGlass
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-500 hover:text-monsoon-primary"
                }`}
              >
                Change email or number
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
