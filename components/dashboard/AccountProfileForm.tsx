"use client";

import { useState } from "react";
import { SelectField } from "@/components/ui/SelectField";
import { SecurityBadge } from "@/components/ui/SecurityBadge";
import { IconShield } from "@/components/dashboard/CitizenIcons";
import { HOUSING_OPTIONS } from "@/lib/housing";

type AccountProfileFormProps = {
  defaultLocation: string;
  housingType: string;
  familySize: number;
  accountEmail: string;
  accountPhone: string | null;
};

export function AccountProfileForm({
  defaultLocation,
  housingType: initialHousingType,
  familySize: initialFamilySize,
  accountEmail,
  accountPhone,
}: AccountProfileFormProps) {
  const [location, setLocation] = useState(defaultLocation);
  const [housingType, setHousingType] = useState(initialHousingType);
  const [familySize, setFamilySize] = useState(initialFamilySize);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setSaved(false);
    setError(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultLocation: location, housingType, familySize }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save");
      }

      setSaved(true);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Failed to save changes",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <section className="premium-card space-y-5">
        <div>
          <h2 className="citizen-heading text-lg">Household Details</h2>
          <p className="citizen-subtext mt-1">
            Used to pre-fill your monsoon plans and tailor recommendations.
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Default neighborhood / area
          </span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="monsoon-input"
            placeholder="e.g. Yelahanka, Bengaluru"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Home type
          </span>
          <SelectField
            value={housingType}
            onChange={setHousingType}
            options={HOUSING_OPTIONS}
            aria-label="Home type"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Family size
          </span>
          <input
            type="number"
            min={1}
            max={20}
            value={familySize}
            onChange={(e) => setFamilySize(Number(e.target.value))}
            inputMode="numeric"
            className="monsoon-input tabular-nums"
          />
        </label>
      </section>

      <section className="premium-card space-y-4">
        <div>
          <h2 className="citizen-heading text-lg">Account Information</h2>
          <p className="citizen-subtext mt-1">
            Your connected sign-in methods. Contact support to update these.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Email / Primary contact
          </p>
          <p className="mt-1 text-sm font-medium text-monsoon-primary">{accountEmail}</p>
        </div>

        {accountPhone && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              WhatsApp number
            </p>
            <p className="mt-1 text-sm font-medium text-monsoon-primary">{accountPhone}</p>
          </div>
        )}
      </section>

      <section className="premium-card border-teal-100 bg-gradient-to-br from-teal-50/50 to-white">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-monsoon-secondary">
            <IconShield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="citizen-heading text-lg">Data Privacy</h2>
            <p className="citizen-subtext mt-2 leading-relaxed">
              Your precise location and household data are encrypted at rest using
              enterprise-grade AES-256. We do not share your survival plans with
              third parties.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <p className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          {error}
        </p>
      )}

      {saved && (
        <p className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          Your changes have been saved successfully.
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SecurityBadge />
        <button
          type="submit"
          disabled={isSaving}
          className="monsoon-btn-primary w-full sm:w-auto"
        >
          {isSaving ? "Saving changes..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
