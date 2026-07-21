import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FlowLayout } from "../../components/FlowLayout";
import { ProgressSummary } from "../../components/ProgressSummary";
import { Button } from "../../components/Button";
import { useToast } from "../../components/Toast";
import { useKyc } from "../../state/KycContext";

export function CorporateDoneStep() {
  const navigate = useNavigate();
  const { reset } = useKyc();
  const { showToast } = useToast();

  useEffect(() => {
    showToast("Business verification completed successfully.");
  }, [showToast]);

  return (
    <FlowLayout
      title="Business verified"
      subtitle="Review your submitted details below, then continue."
    >
      <ProgressSummary title="Verification summary" embedded editable />
      <Button
        fullWidth
        onClick={async () => {
          await reset();
          navigate("/");
        }}
      >
        Done
      </Button>
    </FlowLayout>
  );
}
