import { useNavigate } from "react-router-dom";
import { FlowLayout } from "../../components/FlowLayout";
import { Button } from "../../components/Button";
import { useKyc } from "../../state/KycContext";

export function PersonalDoneStep() {
  const navigate = useNavigate();
  const { reset } = useKyc();

  return (
    <FlowLayout
      title="Identity verified"
      subtitle="Your personal verification is complete. You can continue to your account."
    >
      <p className="m-0 leading-snug text-muted">
        BVN, NIN, address, and face verification were submitted successfully.
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
