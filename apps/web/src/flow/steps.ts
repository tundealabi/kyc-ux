export type FlowStep = {
  id: string;
  label: string;
  shortLabel: string;
};

export const PERSONAL_STEPS: FlowStep[] = [
  { id: "bvn", label: "Identity information", shortLabel: "Identity" },
  { id: "nin", label: "NIN confirmation", shortLabel: "NIN" },
  { id: "address", label: "Address", shortLabel: "Address" },
  { id: "face", label: "Face verification", shortLabel: "Face" },
];

export const CORPORATE_STEPS: FlowStep[] = [
  { id: "cac", label: "Business registration", shortLabel: "Registration" },
  { id: "principal", label: "Principal verification", shortLabel: "Principal" },
  { id: "address", label: "Business address", shortLabel: "Address" },
  { id: "face", label: "Face verification", shortLabel: "Face" },
];

export type PersonalUiStep =
  | "overview"
  | "bvn"
  | "nin"
  | "address"
  | "face-prime"
  | "face"
  | "done";

export type CorporateUiStep =
  | "overview"
  | "cac"
  | "principal-bvn"
  | "address"
  | "face-prime"
  | "face"
  | "done";

/** Progress bar id for a UI step (undefined = hide progress) */
export function personalProgressId(step: PersonalUiStep): string | undefined {
  switch (step) {
    case "bvn":
      return "bvn";
    case "nin":
      return "nin";
    case "address":
      return "address";
    case "face-prime":
    case "face":
      return "face";
    default:
      return undefined;
  }
}

export function corporateProgressId(step: CorporateUiStep): string | undefined {
  switch (step) {
    case "cac":
      return "cac";
    case "principal-bvn":
      return "principal";
    case "address":
      return "address";
    case "face-prime":
    case "face":
      return "face";
    default:
      return undefined;
  }
}

/** Jump target when clicking a completed progress item */
export function personalStepFromProgressId(id: string): PersonalUiStep {
  if (id === "face") return "face-prime";
  return id as PersonalUiStep;
}

export function corporateStepFromProgressId(id: string): CorporateUiStep {
  if (id === "face") return "face-prime";
  if (id === "principal") return "principal-bvn";
  return id as CorporateUiStep;
}

export function stepIndex(steps: FlowStep[], id: string): number {
  return steps.findIndex((s) => s.id === id);
}

/** Highest progress index the user may jump back to (based on filled data) */
export function personalReachedIndex(draft: {
  bvn?: string;
  nin?: string;
  address?: unknown;
  faceVerified?: boolean;
  step: PersonalUiStep;
}): number {
  const current = personalProgressId(draft.step);
  let reached = current ? stepIndex(PERSONAL_STEPS, current) : -1;
  if (draft.bvn) reached = Math.max(reached, 0);
  if (draft.nin) reached = Math.max(reached, 1);
  if (draft.address) reached = Math.max(reached, 2);
  if (draft.faceVerified) reached = Math.max(reached, 3);
  return reached;
}

export function corporateReachedIndex(draft: {
  cacNumber?: string;
  bvn?: string;
  address?: unknown;
  faceVerified?: boolean;
  step: CorporateUiStep;
}): number {
  const current = corporateProgressId(draft.step);
  let reached = current ? stepIndex(CORPORATE_STEPS, current) : -1;
  if (draft.cacNumber) reached = Math.max(reached, 0);
  if (draft.bvn) reached = Math.max(reached, 1);
  if (draft.address) reached = Math.max(reached, 2);
  if (draft.faceVerified) reached = Math.max(reached, 3);
  return reached;
}
