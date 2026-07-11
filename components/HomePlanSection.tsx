"use client";

import { useState } from "react";
import { PlanGenerator } from "@/components/ui/PlanGenerator";
import { PlanResults } from "@/components/ui/PlanResults";
import type { PlanApiResponse } from "@/lib/types/plan";

type HomePlanSectionProps = {
  onPlanGenerated?: () => void;
};

export function HomePlanSection({ onPlanGenerated }: HomePlanSectionProps) {
  const [plan, setPlan] = useState<PlanApiResponse | null>(null);

  function handlePlanGenerated(nextPlan: PlanApiResponse) {
    setPlan(nextPlan);
    onPlanGenerated?.();
  }

  return (
    <>
      <PlanGenerator onPlanGenerated={handlePlanGenerated} />
      {plan && <PlanResults plan={plan} />}
    </>
  );
}
