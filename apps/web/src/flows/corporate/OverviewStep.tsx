import { FlowLayout } from "../../components/FlowLayout";
import { OverviewSteps } from "../../components/OverviewSteps";
import { Button } from "../../components/Button";

const STEPS = [
  {
    title: "Business registration",
    description: "The company or business-name CAC registration details.",
  },
  {
    title: "Principal verification",
    description: "BVN details for the required director or owner.",
  },
  {
    title: "Business address",
    description: "The business address for verification records.",
  },
  {
    title: "Face verification",
    description: "Face check for the principal completing this verification.",
  },
];

type Props = { onStart: () => void };

export function CorporateOverviewStep({ onStart }: Props) {
  return (
    <FlowLayout
      title="Verify your business"
      subtitle="Provide the business registration, representative and address details, then complete a face check."
    >
      <OverviewSteps steps={STEPS} />
      <Button fullWidth onClick={onStart}>
        Start business verification
      </Button>
    </FlowLayout>
  );
}
