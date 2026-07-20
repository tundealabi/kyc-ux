import type { ReactNode } from "react";
import { Button } from "../../components/Button";
import { ContextualHelp } from "../../components/ContextualHelp";
import { useKyc } from "../../state/KycContext";

type Shell = (props: { children: ReactNode; footer: ReactNode }) => ReactNode;

export function CorporateFacePrimeStep({
  onContinue,
  renderShell,
}: {
  onContinue: () => void;
  renderShell: Shell;
}) {
  const { updateCorporate } = useKyc();

  return renderShell({
    footer: (
      <Button
        fullWidth
        onClick={async () => {
          await updateCorporate({ step: "face" });
          onContinue();
        }}
      >
        Continue to camera
      </Button>
    ),
    children: (
      <>
        <ul className="m-0 grid list-disc gap-[0.55rem] rounded-[14px] border border-border py-4 pr-4 pl-[1.4rem] leading-snug text-ink">
          <li>Find a well-lit space, facing a light source</li>
          <li>Remove glasses, hat, or mask if possible</li>
          <li>Hold still and look straight at the camera</li>
        </ul>
        <ContextualHelp title="Why do we need this?">
          Face verification confirms the principal is present and authorised to
          complete business verification.
        </ContextualHelp>
      </>
    ),
  });
}
