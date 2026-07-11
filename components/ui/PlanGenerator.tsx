"use client";

import { useState } from "react";
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
};

const STEPS = [
  { id: 1, title: "Your area", icon: IconLocation },
  { id: 2, title: "Your household", icon: IconFamily },
  { id: 3, title: "Your home", icon: IconHome },
] as const;

export function PlanGenerator({ onPlanGenerated }: PlanGeneratorProps) {
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState("Yelahanka, Bengaluru");
  const [familySize, setFamilySize] = useState(4);
  const [language, setLanguage] = useState("en");
  const [specialNeeds, setSpecialNeeds] = useState("");
  const [housingType, setHousingType] = useState("Apartment");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="premium-card">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-monsoon-secondary shadow-sm">
          <IconCloudRain className="h-6 w-6" />
        </div>
        <div>
          <h2 className="citizen-heading text-xl">Create My Family Plan</h2>
          <p className="citizen-subtext">
            Step {step} of 3 — {STEPS[step - 1].title}
          </p>
        </div>
      </div>

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
                      ? "border-monsoon-secondary bg-monsoon-secondary text-white"
                      : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`hidden w-24 text-center text-xs sm:block ${
                    isCurrent
                      ? "font-semibold text-monsoon-secondary"
                      : isComplete
                        ? "font-medium text-monsoon-primary"
                        : "text-slate-400"
                  }`}
                >
                  {item.title}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`mx-2 h-0.5 flex-1 rounded-full transition-colors ${
                    step > item.id ? "bg-monsoon-secondary" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Neighborhood / Area
            </span>
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              required
              className="monsoon-input rounded-2xl"
              autoComplete="address-level2"
              placeholder="e.g. Yelahanka, Bengaluru"
            />
          </label>
          <p className="text-sm text-slate-500">
            We use your area to tailor flood and rain safety advice for your
            neighborhood.
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              How many people live in your home?
            </span>
            <input
              type="number"
              min={1}
              max={20}
              value={familySize}
              onChange={(event) => setFamilySize(Number(event.target.value))}
              required
              inputMode="numeric"
              className="monsoon-input rounded-2xl tabular-nums"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Language Preference
            </span>
            <SelectField
              value={language}
              onChange={setLanguage}
              options={LANGUAGE_OPTIONS}
              aria-label="Language preference"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Special Needs or Medical Requirements{" "}
              <span className="font-normal text-slate-400">(Optional)</span>
            </span>
            <textarea
              value={specialNeeds}
              onChange={(event) => setSpecialNeeds(event.target.value)}
              rows={3}
              placeholder="e.g., elderly family member, mobility issues, asthma..."
              className="monsoon-textarea"
            />
          </label>

          <p className="text-sm text-slate-500">
            Include everyone who shares your household. We&apos;ll tailor your
            plan in your preferred language and account for any medical or
            accessibility needs.
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              What type of home do you live in?
            </span>
            <SelectField
              value={housingType}
              onChange={setHousingType}
              options={HOUSING_OPTIONS}
              aria-label="Home type"
            />
          </label>
          <p className="text-sm text-slate-500">
            Different home types face different risks during heavy rains and
            flooding.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          {error}
        </p>
      )}

      {isLoading && (
        <p
          role="status"
          aria-live="polite"
          className="mt-4 flex items-center gap-2 rounded-2xl bg-teal-50 px-4 py-3 text-sm text-teal-800"
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
            className="monsoon-btn-ghost rounded-2xl px-6"
          >
            Back
          </button>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed || isLoading}
          className="monsoon-btn-primary w-full rounded-2xl sm:w-auto"
        >
          {isLoading
            ? "Creating your plan..."
            : step === 3
              ? "Create My Family Plan"
              : "Continue"}
        </button>
      </div>

      <div className="mt-4 flex justify-end">
        <SecurityBadge compact />
      </div>
    </div>
  );
}
