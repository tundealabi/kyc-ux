import { useEffect, type ReactNode } from "react";
import { FlowLayout } from "../components/FlowLayout";
import { useKyc } from "../state/KycContext";
import {
  PERSONAL_STEPS,
  personalProgressId,
  personalReachedIndex,
  personalStepFromProgressId,
  type PersonalUiStep,
} from "../flow/steps";
import { PersonalOverviewStep } from "./personal/OverviewStep";
import { PersonalBvnStep } from "./personal/BvnStep";
import { PersonalNinStep } from "./personal/NinStep";
import { PersonalAddressStep } from "./personal/AddressStep";
import { PersonalFacePrimeStep } from "./personal/FacePrimeStep";
import { PersonalFaceStep } from "./personal/FaceStep";
import { PersonalDoneStep } from "./personal/DoneStep";

const META: Record<
  Exclude<PersonalUiStep, "overview" | "done">,
  { title: string; subtitle: string }
> = {
  bvn: {
    title: "Enter your BVN details",
    subtitle: "Use the BVN and date of birth registered with your bank.",
  },
  nin: {
    title: "Confirm your NIN",
    subtitle:
      "Your National Identification Number must match the BVN you provided.",
  },
  address: {
    title: "Enter your address",
    subtitle: "Use the residential address linked to your identity documents.",
  },
  "face-prime": {
    title: "Prepare for face verification",
    subtitle:
      "We’ll use your camera for a quick liveness check. This usually takes under a minute.",
  },
  face: {
    title: "Face verification",
    subtitle: "Position your face in the frame, then capture.",
  },
};

export function PersonalFlow() {
  const { draft, ready, startPersonal, updatePersonal } = useKyc();

  useEffect(() => {
    if (!ready) return;
    if (draft?.kind !== "personal") {
      void startPersonal();
    }
  }, [ready, draft, startPersonal]);

  if (!ready || draft?.kind !== "personal") {
    return (
      <div className="mx-auto w-[min(100%-2rem,640px)] py-16 text-muted">
        Loading…
      </div>
    );
  }

  const step = draft.step as PersonalUiStep;
  const progressId = personalProgressId(step);
  const reached = personalReachedIndex(draft);

  async function goTo(next: PersonalUiStep) {
    await updatePersonal({ step: next });
  }

  function onSelectProgress(id: string) {
    void goTo(personalStepFromProgressId(id));
  }

  function shellFor(uiStep: Exclude<PersonalUiStep, "overview" | "done">) {
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
        steps={PERSONAL_STEPS}
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
        <PersonalOverviewStep
          onStart={() => {
            void goTo("bvn");
          }}
        />
      );
    case "bvn":
      return (
        <PersonalBvnStep
          renderShell={shellFor("bvn")}
          onContinue={() => {
            /* step already set in submit */
          }}
        />
      );
    case "nin":
      return (
        <PersonalNinStep renderShell={shellFor("nin")} onContinue={() => {}} />
      );
    case "address":
      return (
        <PersonalAddressStep
          renderShell={shellFor("address")}
          onContinue={() => {}}
        />
      );
    case "face-prime":
      return (
        <PersonalFacePrimeStep
          renderShell={shellFor("face-prime")}
          onContinue={() => {}}
        />
      );
    case "face":
      return (
        <PersonalFaceStep
          renderShell={shellFor("face")}
          onContinue={() => {}}
        />
      );
    case "done":
      return <PersonalDoneStep />;
    default:
      return (
        <PersonalOverviewStep
          onStart={() => {
            void goTo("bvn");
          }}
        />
      );
  }
}
