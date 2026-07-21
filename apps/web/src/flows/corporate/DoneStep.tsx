import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlowLayout } from "../../components/FlowLayout";
import { ProgressSummary } from "../../components/ProgressSummary";
import { Button } from "../../components/Button";
import { SuccessModal } from "../../components/SuccessModal";
import { useKyc } from "../../state/KycContext";

export function CorporateDoneStep() {
  const navigate = useNavigate();
  const { reset } = useKyc();
  const [successOpen, setSuccessOpen] = useState(false);

  return (
    <FlowLayout
      title="Business verified"
      subtitle="Review your submitted details below, then continue."
    >
      <ProgressSummary title="Verification summary" embedded editable />
      <Button fullWidth onClick={() => setSuccessOpen(true)}>
        Done
      </Button>
      <SuccessModal
        open={successOpen}
        title="Verification complete"
        message="Your business verification was submitted successfully."
        onConfirm={async () => {
          await reset();
          navigate("/");
        }}
      />
    </FlowLayout>
  );
}
