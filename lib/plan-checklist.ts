export const CHECKLIST_PHASES = [
  "Before the storm",
  "During the storm",
  "After the storm",
] as const;

export type ChecklistPhaseName = (typeof CHECKLIST_PHASES)[number];

export type ChecklistPhase = {
  phase: string;
  items: string[];
};

export function isChecklistPhase(value: unknown): value is ChecklistPhase {
  if (!value || typeof value !== "object") {
    return false;
  }

  const phase = value as ChecklistPhase;

  return (
    typeof phase.phase === "string" &&
    phase.phase.trim().length > 0 &&
    Array.isArray(phase.items) &&
    phase.items.length > 0 &&
    phase.items.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

export function isPhasedChecklist(value: unknown): value is ChecklistPhase[] {
  return Array.isArray(value) && value.length > 0 && value.every(isChecklistPhase);
}

/** Supports legacy flat string[] plans stored before phased checklists. */
export function normalizeChecklist(checklist: unknown): ChecklistPhase[] {
  if (!Array.isArray(checklist) || checklist.length === 0) {
    return [];
  }

  if (typeof checklist[0] === "string") {
    return [
      {
        phase: "Checklist",
        items: checklist.filter((item): item is string => typeof item === "string"),
      },
    ];
  }

  if (isPhasedChecklist(checklist)) {
    return checklist;
  }

  return [];
}

export function flattenChecklistItems(checklist: ChecklistPhase[]): string[] {
  return checklist.flatMap((entry) => entry.items);
}

export function countChecklistItems(checklist: ChecklistPhase[]): number {
  return flattenChecklistItems(checklist).length;
}

export function reassemblePhasedChecklist(
  phases: ChecklistPhase[],
  translatedTexts: string[],
): ChecklistPhase[] {
  let offset = 0;

  return phases.map((entry) => {
    const phaseLabel = translatedTexts[offset];
    offset += 1;

    const items = translatedTexts.slice(offset, offset + entry.items.length);
    offset += entry.items.length;

    return {
      phase: phaseLabel || entry.phase,
      items,
    };
  });
}
