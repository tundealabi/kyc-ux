import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { getBvnFieldState, dateOfBirthSchema } from "@kyc/validation";
import { verifyBvn } from "@kyc/api-client";
import { Field } from "../../components/Field";
import { Button } from "../../components/Button";
import { ContextualHelp } from "../../components/ContextualHelp";
import { useKyc } from "../../state/KycContext";

type Props = {
  onContinue: () => void;
  renderShell: (props: { children: ReactNode; footer: ReactNode }) => ReactNode;
};

export function PersonalBvnStep({ onContinue, renderShell }: Props) {
  const { draft, updatePersonal } = useKyc();
  const initial =
    draft?.kind === "personal"
      ? { bvn: draft.bvn ?? "", dob: draft.dateOfBirth ?? "" }
      : { bvn: "", dob: "" };

  const [bvn, setBvn] = useState(initial.bvn);
  const [dob, setDob] = useState(initial.dob);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const bvnState = useMemo(() => getBvnFieldState(bvn), [bvn]);
  const dobResult = dateOfBirthSchema.safeParse(dob);
  const canContinue = bvnState.isValid && dobResult.success;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canContinue) return;
    setSubmitting(true);
    setFormError(null);
    const result = await verifyBvn({
      bvn: bvnState.digits,
      dateOfBirth: dob,
    });
    setSubmitting(false);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    await updatePersonal({
      step: "nin",
      bvn: bvnState.digits,
      dateOfBirth: dob,
    });
    onContinue();
  }

  return renderShell({
    footer: (
      <Button
        fullWidth
        type="submit"
        form="personal-bvn-form"
        disabled={!canContinue || submitting}
      >
        {submitting ? "Verifying…" : "Continue"}
      </Button>
    ),
    children: (
      <form id="personal-bvn-form" onSubmit={onSubmit} className="grid gap-4">
        <Field
          label="BVN"
          name="bvn"
          inputMode="numeric"
          autoComplete="off"
          placeholder="11-digit BVN"
          value={bvnState.digits}
          onChange={(e) => setBvn(e.target.value)}
          suffix={`${bvnState.digits.length}/11`}
          success={bvnState.isValid ? bvnState.message : undefined}
          error={
            bvnState.digits.length > 0 && !bvnState.isComplete
              ? bvnState.message
              : undefined
          }
          maxLength={11}
        />
        <ContextualHelp>
          Your Bank Verification Number confirms your identity with Nigerian
          banks and helps prevent account fraud.
        </ContextualHelp>
        <Field
          label="Date of birth"
          name="dateOfBirth"
          type="date"
          value={dob}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDob(e.target.value)}
          error={
            dob && !dobResult.success
              ? dobResult.error.issues[0]?.message
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
