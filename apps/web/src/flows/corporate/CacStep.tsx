import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  detectCacRegistrationType,
  getCacFieldState,
  type CacRegistrationType,
} from "@kyc/validation";
import { verifyCac } from "@kyc/api-client";
import { Field } from "../../components/Field";
import { Button } from "../../components/Button";
import { useKyc } from "../../state/KycContext";

type Shell = (props: { children: ReactNode; footer: ReactNode }) => ReactNode;

export function CorporateCacStep({
  onContinue,
  renderShell,
}: {
  onContinue: () => void;
  renderShell: Shell;
}) {
  const { draft, updateCorporate } = useKyc();
  const initialType =
    draft?.kind === "corporate"
      ? (draft.registrationType ?? "registered_company")
      : "registered_company";
  const [type, setType] = useState<CacRegistrationType>(initialType);
  const [manualOverride, setManualOverride] = useState(false);
  const [cacNumber, setCacNumber] = useState(
    draft?.kind === "corporate" ? (draft.cacNumber ?? "") : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fieldState = useMemo(
    () => getCacFieldState(cacNumber, type),
    [cacNumber, type],
  );

  useEffect(() => {
    if (manualOverride) return;
    const detected = detectCacRegistrationType(cacNumber);
    if (detected && detected !== type) setType(detected);
  }, [cacNumber, manualOverride, type]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fieldState.isValid) return;
    setSubmitting(true);
    setFormError(null);
    const result = await verifyCac({
      registrationType: type,
      cacNumber: fieldState.display,
    });
    setSubmitting(false);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    await updateCorporate({
      step: "principal-bvn",
      registrationType: type,
      cacNumber: fieldState.display,
    });
    onContinue();
  }

  return renderShell({
    footer: (
      <Button
        fullWidth
        type="submit"
        form="corporate-cac-form"
        disabled={!fieldState.isValid || submitting}
      >
        {submitting ? "Verifying…" : "Continue"}
      </Button>
    ),
    children: (
      <form id="corporate-cac-form" onSubmit={onSubmit} className="grid gap-4">
        <div>
          <span
            className="mb-1.5 block text-sm font-semibold"
            id="reg-type-label"
          >
            Registration type
          </span>
          <div
            className="grid grid-cols-2 gap-1.5 rounded-xl bg-[#eceae7] p-1.5"
            role="group"
            aria-labelledby="reg-type-label"
          >
            {(
              [
                ["registered_company", "Registered company"],
                ["business_name", "Business name"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`rounded-[10px] border-none px-2 py-[0.7rem] text-sm font-semibold ${
                  type === value
                    ? "bg-white text-accent shadow-sm"
                    : "bg-transparent text-muted"
                }`}
                aria-pressed={type === value}
                onClick={() => {
                  setManualOverride(true);
                  setType(value);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {!manualOverride && fieldState.detectedType ? (
            <p className="mt-2 m-0 text-[0.85rem] text-muted">
              Detected from number format — change the toggle if this is wrong.
            </p>
          ) : null}
        </div>
        <Field
          label="CAC registration number"
          name="cacNumber"
          placeholder="e.g. 1234567"
          value={cacNumber}
          onChange={(e) => setCacNumber(e.target.value)}
          prefix={type === "business_name" ? "BN" : "RC"}
          success={fieldState.isValid ? fieldState.message : undefined}
          error={
            cacNumber.trim() && !fieldState.isValid
              ? fieldState.message
              : undefined
          }
        />
        {formError ? (
          <p
            className="m-0 rounded-[10px] bg-danger-soft px-[0.9rem] py-3 text-sm text-danger"
            role="alert"
          >
            {formError}
          </p>
        ) : null}
      </form>
    ),
  });
}
