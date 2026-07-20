import { FlowLayout } from "../../components/FlowLayout";
import { OverviewSteps } from "../../components/OverviewSteps";
import { Button } from "../../components/Button";

const STEPS = [
  {
    title: "Identity information",
    description: "Your BVN and date of birth registered with your bank.",
  },
  {
    title: "NIN confirmation",
    description: "Your NIN details must match the BVN you provided.",
  },
  {
    title: "Address",
    description: "Your residential address for verification records.",
  },
  {
    title: "Face verification",
    description:
      "A quick face check to confirm you are completing this yourself.",
  },
];

type Props = {
  onStart: () => void;
};

export function PersonalOverviewStep({ onStart }: Props) {
  return (
    <FlowLayout
      title="Verify your identity"
      subtitle="Provide your BVN, NIN and address, then complete a face check."
    >
      <OverviewSteps steps={STEPS} />
      <Button fullWidth onClick={onStart}>
        Start identity verification
      </Button>
    </FlowLayout>
  );
}
