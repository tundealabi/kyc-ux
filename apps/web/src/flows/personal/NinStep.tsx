import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { getNinFieldState } from "@kyc/validation";
import { verifyNin } from "@kyc/api-client";
import { Field } from "../../components/Field";
import { Button } from "../../components/Button";
import { ContextualHelp } from "../../components/ContextualHelp";
import { useKyc } from "../../state/KycContext";

type Props = {
  onContinue: () => void;
  renderShell: (props: { children: ReactNode; footer: ReactNode }) => ReactNode;
};

export function PersonalNinStep({ onContinue, renderShell }: Props) {
  const { draft, updatePersonal } = useKyc();
  const bvn = draft?.kind === "personal" ? draft.bvn : undefined;
  const [nin, setNin] = useState(
    draft?.kind === "personal" ? (draft.nin ?? "") : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const ninState = useMemo(() => getNinFieldState(nin), [nin]);
  const canContinue = ninState.isValid && Boolean(bvn);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canContinue || !bvn) return;
    setSubmitting(true);
    setFormError(null);
    const result = await verifyNin({ nin: ninState.digits, bvn });
    setSubmitting(false);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    await updatePersonal({ step: "address", nin: ninState.digits });
    onContinue();
  }

  return renderShell({
    footer: (
      <Button
        fullWidth
        type="submit"
        form="personal-nin-form"
        disabled={!canContinue || submitting}
      >
        {submitting ? "Verifying…" : "Continue"}
      </Button>
    ),
    children: (
      <form id="personal-nin-form" onSubmit={onSubmit} className="grid gap-4">
        <Field
          label="NIN"
          name="nin"
          inputMode="numeric"
          autoComplete="off"
          placeholder="11-digit NIN"
          value={ninState.digits}
          onChange={(e) => setNin(e.target.value)}
          suffix={`${ninState.digits.length}/11`}
          success={ninState.isValid ? ninState.message : undefined}
          error={
            ninState.digits.length > 0 && !ninState.isComplete
              ? ninState.message
              : undefined
          }
          maxLength={11}
        />
        <ContextualHelp>
          Your NIN is issued by NIMC and lets us confirm the identity details
          linked to your BVN.
        </ContextualHelp>
        {!bvn ? (
          <p
            className="m-0 rounded-[10px] bg-danger-soft px-[0.9rem] py-3 text-sm text-danger"
            role="alert"
          >
            Complete BVN details first.
          </p>
        ) : null}
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
