"use client";

import { useEffect, useState } from "react";
import { resolveClientLocation } from "@/lib/client-location";
import { HOUSING_OPTIONS } from "@/lib/housing";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import type { PlanApiResponse } from "@/lib/types/plan";
import { SelectField } from "@/components/ui/SelectField";
import { SecurityBadge } from "@/components/ui/SecurityBadge";
import {
  IconCloudRain,
  IconFamily,
  IconHome,
  IconLocation,
  IconShield,
} from "@/components/dashboard/CitizenIcons";

type PlanGeneratorProps = {
  onPlanGenerated: (plan: PlanApiResponse) => void;
  variant?: "dashboard" | "guest";
  embedded?: boolean;
  tone?: "light" | "glass";
};

const STEPS = [
  { id: 1, title: "Your area", icon: IconLocation },
  { id: 2, title: "Your household", icon: IconFamily },
  { id: 3, title: "Your home", icon: IconHome },
] as const;

function formatDetectedLocation(city: string, region: string | null): string {
  return [city, region].filter(Boolean).join(", ");
}

export function PlanGenerator({
  onPlanGenerated,
  variant = "dashboard",
  embedded = false,
  tone = "light",
}: PlanGeneratorProps) {
  const isGlass = tone === "glass";
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState("");
  const [locationAutoFilled, setLocationAutoFilled] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(isGlass);
  const [familySize, setFamilySize] = useState(4);
  const [language, setLanguage] = useState("en");
  const [specialNeeds, setSpecialNeeds] = useState("");
  const [housingType, setHousingType] = useState("Apartment");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isGlass) {
      return;
    }

    let cancelled = false;

    async function detectLocation() {
      setDetectingLocation(true);

      try {
        const resolved = await resolveClientLocation();
        const label = formatDetectedLocation(resolved.city, resolved.region);

        if (!cancelled && label) {
          setLocation(label);
          setLocationAutoFilled(true);
        }
      } finally {
        if (!cancelled) {
          setDetectingLocation(false);
        }
      }
    }

    void detectLocation();

    return () => {
      cancelled = true;
    };
  }, [isGlass]);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          familySize,
          housingType,
          language,
          specialNeeds: specialNeeds.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create your plan");
      }

      onPlanGenerated(data as PlanApiResponse);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create your plan",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleNext() {
    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }

    void handleGenerate();
  }

  function handleBack() {
    setStep((current) => Math.max(1, current - 1));
  }

  const canProceed =
    step === 1
      ? location.trim().length > 0
      : step === 2
        ? familySize >= 1 && familySize <= 20
        : true;

  const labelClass = isGlass
    ? "mb-2 block text-sm font-medium text-slate-200"
    : "mb-2 block text-sm font-medium text-slate-700";
  const hintClass = isGlass
    ? "text-sm text-slate-400"
    : "text-sm text-slate-500";
  const inputClass = isGlass ? "hero-glass-input" : "monsoon-input rounded-2xl";
  const textareaClass = isGlass ? "hero-glass-textarea" : "monsoon-textarea";
  const primaryBtnClass = isGlass
    ? "hero-glass-btn-primary w-full sm:w-auto"
    : "monsoon-btn-primary w-full rounded-2xl sm:w-auto";
  const ghostBtnClass = isGlass
    ? "hero-glass-btn-ghost"
    : "monsoon-btn-ghost rounded-2xl px-6";

  return (
    <div className={embedded ? "" : "premium-card"}>
      {!embedded && (
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-monsoon-secondary shadow-sm">
            <IconCloudRain className="h-6 w-6" />
          </div>
          <div>
            <h2 className="citizen-heading text-xl">
              {variant === "guest"
                ? "Quick Emergency Survival Plan"
                : "Create My Family Plan"}
            </h2>
            <p className="citizen-subtext">
              Step {step} of 3 — {STEPS[step - 1].title}
              {variant === "guest" && step === 1 && (
                <span className="mt-1 block text-teal-600">
                  No login required — generate instantly below.
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {embedded && (
        <p
          className={`mb-5 text-center text-xs font-semibold uppercase tracking-[0.14em] ${
            isGlass ? "text-teal-300/90" : "font-medium text-slate-500"
          }`}
        >
          Step {step} of 3 — {STEPS[step - 1].title}
        </p>
      )}

      <div className="mb-8 flex items-center">
        {STEPS.map((item, index) => {
          const Icon = item.icon;
          const isComplete = step > item.id;
          const isCurrent = step === item.id;
          const isLast = index === STEPS.length - 1;

          return (
            <div key={item.id} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition shadow-sm ${
                    isComplete || isCurrent
                      ? "border-teal-400 bg-teal-500 text-white shadow-teal-900/30"
                      : isGlass
                        ? "border-white/20 bg-white/5 text-slate-500"
                        : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`hidden w-24 text-center text-xs sm:block ${
                    isCurrent
                      ? isGlass
                        ? "font-semibold text-teal-300"
                        : "font-semibold text-monsoon-secondary"
                      : isComplete
                        ? isGlass
                          ? "font-medium text-teal-200/80"
                          : "font-medium text-monsoon-primary"
                        : isGlass
                          ? "text-slate-500"
                          : "text-slate-400"
                  }`}
                >
                  {item.title}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`mx-2 h-0.5 flex-1 rounded-full transition-colors ${
                    step > item.id
                      ? "bg-teal-500"
                      : isGlass
                        ? "bg-white/15"
                        : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={labelClass}>Neighborhood / Area</span>
            {isGlass && locationAutoFilled && !detectingLocation && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-teal-200">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" aria-hidden />
                Auto-detected
              </span>
            )}
          </div>
          <input
            type="text"
            value={location}
            onChange={(event) => {
              setLocation(event.target.value);
              setLocationAutoFilled(false);
            }}
            required
            className={inputClass}
            autoComplete="address-level2"
            placeholder={
              detectingLocation
                ? "Detecting your area…"
                : "e.g. Yelahanka, Bengaluru"
            }
            disabled={detectingLocation}
          />
          <p className={hintClass}>
            {isGlass
              ? "We silently detect your area, then pull live Open-Meteo weather for hyper-local plans."
              : "We use your area to tailor flood and rain safety advice for your neighborhood."}
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <label className="block">
            <span className={labelClass}>How many people live in your home?</span>
            <input
              type="number"
              min={1}
              max={20}
              value={familySize}
              onChange={(event) => setFamilySize(Number(event.target.value))}
              required
              inputMode="numeric"
              className={`${inputClass} tabular-nums`}
            />
          </label>

          <label className="block">
            <span className={labelClass}>Language Preference</span>
            <SelectField
              value={language}
              onChange={setLanguage}
              options={LANGUAGE_OPTIONS}
              aria-label="Language preference"
              tone={tone}
            />
          </label>

          <label className="block">
            <span className={labelClass}>
              Special Needs or Medical Requirements{" "}
              <span className={isGlass ? "font-normal text-slate-500" : "font-normal text-slate-400"}>
                (Optional)
              </span>
            </span>
            <textarea
              value={specialNeeds}
              onChange={(event) => setSpecialNeeds(event.target.value)}
              rows={3}
              placeholder="e.g., elderly family member, mobility issues, asthma..."
              className={textareaClass}
            />
          </label>

          <p className={hintClass}>
            Include everyone who shares your household. We&apos;ll tailor your
            plan in your preferred language and account for any medical or
            accessibility needs.
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <label className="block">
            <span className={labelClass}>What type of home do you live in?</span>
            <SelectField
              value={housingType}
              onChange={setHousingType}
              options={HOUSING_OPTIONS}
              aria-label="Home type"
              tone={tone}
            />
          </label>
          <p className={hintClass}>
            Different home types face different risks during heavy rains and
            flooding.
          </p>
        </div>
      )}

      {error && (
        <p
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            isGlass
              ? "border-red-400/30 bg-red-500/10 text-red-200"
              : "border-orange-200 bg-orange-50 text-orange-700"
          }`}
        >
          {error}
        </p>
      )}

      {isLoading && (
        <p
          role="status"
          aria-live="polite"
          className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
            isGlass
              ? "bg-teal-500/15 text-teal-100"
              : "bg-teal-50 text-teal-800"
          }`}
        >
          <IconShield className="h-4 w-4 animate-pulse" />
          Building your personalized plan for {location}...
        </p>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            disabled={isLoading}
            className={ghostBtnClass}
          >
            Back
          </button>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed || isLoading || detectingLocation}
          className={primaryBtnClass}
        >
          {isLoading
            ? "Creating your plan..."
            : step === 3
              ? "Generate Survival Plan"
              : "Continue"}
        </button>
      </div>

      <div className={`mt-4 ${isGlass ? "text-center" : "flex justify-end"}`}>
        {variant === "guest" ? (
          <p className={`text-xs ${isGlass ? "text-slate-500" : "text-slate-500"}`}>
            Guest mode — nothing stored.{" "}
            {isGlass ? (
              <span className="text-slate-400">Sign in for AES-256 history.</span>
            ) : (
              "Sign in to save history with AES-256 encryption."
            )}
          </p>
        ) : (
          <SecurityBadge compact />
        )}
      </div>
    </div>
  );
}
