"use client";

import Link from "next/link";
import { useState } from "react";
import { PlanGenerator } from "@/components/ui/PlanGenerator";
import { PlanResults } from "@/components/ui/PlanResults";
import type { PlanApiResponse } from "@/lib/types/plan";

type HomePlanSectionProps = {
  onPlanGenerated?: () => void;
  variant?: "dashboard" | "guest";
  loginHref?: string;
};

export function HomePlanSection({
  onPlanGenerated,
  variant = "dashboard",
  loginHref = "/#get-started",
}: HomePlanSectionProps) {
  const [plan, setPlan] = useState<PlanApiResponse | null>(null);

  function handlePlanGenerated(nextPlan: PlanApiResponse) {
    setPlan(nextPlan);
    onPlanGenerated?.();
  }

  return (
    <>
      <div className="print:hidden">
        <PlanGenerator
          onPlanGenerated={handlePlanGenerated}
          variant={variant}
        />
      </div>
      {plan && (
        <PlanResults
          plan={plan}
          variant={variant}
          loginHref={loginHref}
        />
      )}
    </>
  );
}
