import { useEffect, type ReactNode } from "react";
import { FlowLayout } from "../components/FlowLayout";
import { useKyc } from "../state/KycContext";
import {
  CORPORATE_STEPS,
  corporateProgressId,
  corporateReachedIndex,
  corporateStepFromProgressId,
  type CorporateUiStep,
} from "../flow/steps";
import { CorporateOverviewStep } from "./corporate/OverviewStep";
import { CorporateCacStep } from "./corporate/CacStep";
import { CorporatePrincipalBvnStep } from "./corporate/PrincipalBvnStep";
import { CorporateAddressStep } from "./corporate/AddressStep";
import { CorporateFacePrimeStep } from "./corporate/FacePrimeStep";
import { CorporateFaceStep } from "./corporate/FaceStep";
import { CorporateDoneStep } from "./corporate/DoneStep";

const META: Record<
  Exclude<CorporateUiStep, "overview" | "done">,
  { title: string; subtitle: string }
> = {
  cac: {
    title: "Business registration details",
    subtitle: "Enter the details on your CAC registration certificate.",
  },
  "principal-bvn": {
    title: "Principal BVN details",
    subtitle:
      "Enter the BVN for the director or owner completing this verification.",
  },
  address: {
    title: "Business address",
    subtitle: "Enter the registered or operating address of the business.",
  },
  "face-prime": {
    title: "Prepare for face verification",
    subtitle: "The principal should complete this camera check themselves.",
  },
  face: {
    title: "Face verification",
    subtitle: "Position the principal’s face in the frame, then capture.",
  },
};

export function CorporateFlow() {
  const { draft, ready, startCorporate, updateCorporate } = useKyc();

  useEffect(() => {
    if (!ready) return;
    if (draft?.kind !== "corporate") {
      void startCorporate();
    }
  }, [ready, draft, startCorporate]);

  if (!ready || draft?.kind !== "corporate") {
    return (
      <div className="mx-auto w-[min(100%-2rem,640px)] py-16 text-muted">
        Loading…
      </div>
    );
  }

  const step = draft.step as CorporateUiStep;
  const progressId = corporateProgressId(step);
  const reached = corporateReachedIndex(draft);

  async function goTo(next: CorporateUiStep) {
    await updateCorporate({ step: next });
  }

  function onSelectProgress(id: string) {
    void goTo(corporateStepFromProgressId(id));
  }

  function shellFor(uiStep: Exclude<CorporateUiStep, "overview" | "done">) {
    const meta = META[uiStep];
    return ({
      children,
      footer,
    }: {
      children: ReactNode;
      footer: ReactNode;
    }) => (
      <FlowLayout
        title={meta.title}
        subtitle={meta.subtitle}
        steps={CORPORATE_STEPS}
        currentStepId={progressId}
        reachedIndex={reached}
        onSelectStep={onSelectProgress}
        footer={footer}
      >
        {children}
      </FlowLayout>
    );
  }

  switch (step) {
    case "overview":
      return (
        <CorporateOverviewStep
          onStart={() => {
            void goTo("cac");
          }}
        />
      );
    case "cac":
      return (
        <CorporateCacStep renderShell={shellFor("cac")} onContinue={() => {}} />
      );
    case "principal-bvn":
      return (
        <CorporatePrincipalBvnStep
          renderShell={shellFor("principal-bvn")}
          onContinue={() => {}}
        />
      );
    case "address":
      return (
        <CorporateAddressStep
          renderShell={shellFor("address")}
          onContinue={() => {}}
        />
      );
    case "face-prime":
      return (
        <CorporateFacePrimeStep
          renderShell={shellFor("face-prime")}
          onContinue={() => {}}
        />
      );
    case "face":
      return (
        <CorporateFaceStep
          renderShell={shellFor("face")}
          onContinue={() => {}}
        />
      );
    case "done":
      return <CorporateDoneStep />;
    default:
      return (
        <CorporateOverviewStep
          onStart={() => {
            void goTo("cac");
          }}
        />
      );
  }
}
