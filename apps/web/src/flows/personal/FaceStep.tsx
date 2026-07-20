import { useCallback, useRef, useState, type ReactNode } from "react";
import { verifyFace } from "@kyc/api-client";
import { Button } from "../../components/Button";
import {
  CameraPreview,
  type CameraPermission,
  type CameraPreviewHandle,
} from "../../components/CameraPreview";
import { useKyc } from "../../state/KycContext";

type Props = {
  onContinue: () => void;
  renderShell: (props: { children: ReactNode; footer: ReactNode }) => ReactNode;
};

export function PersonalFaceStep({ onContinue, renderShell }: Props) {
  const { updatePersonal } = useKyc();
  const cameraRef = useRef<CameraPreviewHandle>(null);
  const [permission, setPermission] = useState<CameraPermission>("pending");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPermissionChange = useCallback((next: CameraPermission) => {
    setPermission(next);
  }, []);

  async function captureAndVerify() {
    setBusy(true);
    setError(null);
    const payload = cameraRef.current?.captureFrame() ?? "stub-frame";
    const result = await verifyFace(payload);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    await updatePersonal({ step: "done", faceVerified: true });
    onContinue();
  }

  return renderShell({
    footer:
      permission === "granted" ? (
        <Button
          fullWidth
          disabled={busy}
          onClick={() => void captureAndVerify()}
        >
          {busy ? "Verifying…" : "Capture and verify"}
        </Button>
      ) : null,
    children: (
      <>
        <CameraPreview
          ref={cameraRef}
          onPermissionChange={onPermissionChange}
        />
        {error ? (
          <p
            className="m-0 rounded-[10px] bg-danger-soft px-[0.9rem] py-3 text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </>
    ),
  });
}
