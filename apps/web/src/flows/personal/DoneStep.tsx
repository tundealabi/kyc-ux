import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlowLayout } from "../../components/FlowLayout";
import { ProgressSummary } from "../../components/ProgressSummary";
import { Button } from "../../components/Button";
import { SuccessModal } from "../../components/SuccessModal";
import { useKyc } from "../../state/KycContext";

export function PersonalDoneStep() {
  const navigate = useNavigate();
  const { reset } = useKyc();
  const [successOpen, setSuccessOpen] = useState(false);

  return (
    <FlowLayout
      title="Identity verified"
      subtitle="Review your submitted details below, then continue to your account."
    >
      <ProgressSummary title="Verification summary" embedded editable />
      <Button fullWidth onClick={() => setSuccessOpen(true)}>
        Done
      </Button>
      <SuccessModal
        open={successOpen}
        title="Verification complete"
        message="Your personal verification was submitted successfully."
        onConfirm={async () => {
          await reset();
          navigate("/");
        }}
      />
    </FlowLayout>
  );
}
