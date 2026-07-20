import { useNavigate } from "react-router-dom";
import { FlowLayout } from "../../components/FlowLayout";
import { Button } from "../../components/Button";
import { useKyc } from "../../state/KycContext";

export function CorporateDoneStep() {
  const navigate = useNavigate();
  const { reset } = useKyc();

  return (
    <FlowLayout
      title="Business verified"
      subtitle="Your corporate verification is complete."
    >
      <p className="m-0 leading-snug text-muted">
        CAC registration, principal BVN, address, and face verification were
        submitted successfully.
      </p>
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
