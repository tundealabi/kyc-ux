import { useState, type FormEvent, type ReactNode } from "react";
import { addressSchema, type AddressInput } from "@kyc/validation";
import { saveAddress } from "@kyc/api-client";
import { Field } from "../../components/Field";
import { Button } from "../../components/Button";
import { useKyc } from "../../state/KycContext";

const empty: AddressInput = {
  street: "",
  city: "",
  state: "",
  postalCode: "",
};

type Shell = (props: { children: ReactNode; footer: ReactNode }) => ReactNode;

export function CorporateAddressStep({
  onContinue,
  renderShell,
}: {
  onContinue: () => void;
  renderShell: Shell;
}) {
  const { draft, updateCorporate } = useKyc();
  const [address, setAddress] = useState<AddressInput>(
    draft?.kind === "corporate" && draft.address ? draft.address : empty,
  );
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const parsed = addressSchema.safeParse(address);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!parsed.success) return;
    setSubmitting(true);
    setFormError(null);
    const result = await saveAddress(parsed.data);
    setSubmitting(false);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    await updateCorporate({ step: "face-prime", address: parsed.data });
    onContinue();
  }

  function fieldError(key: keyof AddressInput) {
    if (!touched || parsed.success) return undefined;
    return parsed.error.flatten().fieldErrors[key]?.[0];
  }

  return renderShell({
    footer: (
      <Button
        fullWidth
        type="submit"
        form="corporate-address-form"
        disabled={!parsed.success || submitting}
      >
        {submitting ? "Saving…" : "Continue"}
      </Button>
    ),
    children: (
      <form
        id="corporate-address-form"
        onSubmit={onSubmit}
        className="grid gap-4"
      >
        <Field
          label="Street address"
          name="street"
          value={address.street}
          onChange={(e) =>
            setAddress((a) => ({ ...a, street: e.target.value }))
          }
          error={fieldError("street")}
        />
        <Field
          label="City"
          name="city"
          value={address.city}
          onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
          error={fieldError("city")}
        />
        <Field
          label="State"
          name="state"
          value={address.state}
          onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
          error={fieldError("state")}
        />
        <Field
          label="Postal code (optional)"
          name="postalCode"
          value={address.postalCode ?? ""}
          onChange={(e) =>
            setAddress((a) => ({ ...a, postalCode: e.target.value }))
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
