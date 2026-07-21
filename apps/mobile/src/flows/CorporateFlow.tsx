import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import {
  dateOfBirthSchema,
  detectCacRegistrationType,
  getBvnFieldState,
  getCacFieldState,
  addressSchema,
  type AddressInput,
  type CacRegistrationType,
} from "@kyc/validation";
import { verifyBvn, verifyCac, verifyFace, saveAddress } from "@kyc/api-client";
import { useRouter } from "expo-router";
import { FlowLayout } from "../components/FlowLayout";
import { OverviewSteps } from "../components/OverviewSteps";
import { Field } from "../components/Field";
import { Button } from "../components/Button";
import { ContextualHelp } from "../components/ContextualHelp";
import { CameraPreview } from "../components/CameraPreview";
import { ProgressSummary } from "../components/ProgressSummary";
import { SuccessModal } from "../components/SuccessModal";
import { useKyc } from "../state/KycContext";
import {
  CORPORATE_STEPS,
  corporateProgressId,
  corporateReachedIndex,
  corporateStepFromProgressId,
  type CorporateUiStep,
} from "../flow/steps";

const OVERVIEW = [
  {
    title: "Business registration",
    description: "The company or business-name CAC registration details.",
  },
  {
    title: "Principal verification",
    description: "BVN details for the required director or owner.",
  },
  {
    title: "Business address",
    description: "The business address for verification records.",
  },
  {
    title: "Face verification",
    description: "Face check for the principal completing this verification.",
  },
];

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function CorporateFlow() {
  const { draft, ready, startCorporate, updateCorporate } = useKyc();

  useEffect(() => {
    if (!ready) return;
    if (draft?.kind !== "corporate") {
      void startCorporate();
    }
  }, [ready, draft, startCorporate]);

  if (!ready || draft?.kind !== "corporate") {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <Text className="text-muted">Loading…</Text>
      </View>
    );
  }

  const step = draft.step as CorporateUiStep;
  const progressId = corporateProgressId(step);
  const reached = corporateReachedIndex(draft);
  const shell = {
    steps: CORPORATE_STEPS,
    currentStepId: progressId,
    reachedIndex: reached,
    onSelectStep: (id: string) => {
      void updateCorporate({ step: corporateStepFromProgressId(id) });
    },
  };

  if (step === "overview") {
    return (
      <FlowLayout
        title="Verify your business"
        subtitle="Provide registration, principal, and address details, then a face check."
        footer={
          <Button
            label="Start business verification"
            onPress={() => void updateCorporate({ step: "cac" })}
          />
        }
      >
        <OverviewSteps steps={OVERVIEW} />
      </FlowLayout>
    );
  }

  if (step === "cac") return <CacStep shell={shell} />;
  if (step === "principal-bvn") return <PrincipalStep shell={shell} />;
  if (step === "address") return <AddressStep shell={shell} />;

  if (step === "face-prime") {
    return (
      <FlowLayout
        title="Prepare for face verification"
        subtitle="The principal should complete this camera check themselves."
        {...shell}
        currentStepId="face"
        footer={
          <Button
            label="Continue to camera"
            onPress={() => void updateCorporate({ step: "face" })}
          />
        }
      >
        <View className="gap-2 rounded-[14px] border border-border px-4 py-3">
          <Text className="text-[15px] text-ink">• Find a well-lit space</Text>
          <Text className="text-[15px] text-ink">
            • Remove glasses, hat, or mask if possible
          </Text>
          <Text className="text-[15px] text-ink">
            • Hold still and look straight at the camera
          </Text>
        </View>
        <ContextualHelp>
          Face verification confirms the principal is present and authorised.
        </ContextualHelp>
      </FlowLayout>
    );
  }

  if (step === "face") return <FaceStep shell={shell} />;

  return <CorporateDoneStep />;
}

function CorporateDoneStep() {
  const router = useRouter();
  const { reset } = useKyc();
  const [successOpen, setSuccessOpen] = useState(false);

  return (
    <FlowLayout
      title="Business verified"
      subtitle="Review your submitted details below, then continue."
      footer={<Button label="Done" onPress={() => setSuccessOpen(true)} />}
    >
      <ProgressSummary title="Verification summary" embedded editable />
      <SuccessModal
        open={successOpen}
        title="Verification complete"
        message="Your business verification was submitted successfully."
        onConfirm={async () => {
          await reset();
          router.replace("/");
        }}
      />
    </FlowLayout>
  );
}

type ShellProps = {
  steps: typeof CORPORATE_STEPS;
  currentStepId?: string;
  reachedIndex: number;
  onSelectStep: (id: string) => void;
};

function CacStep({ shell }: { shell: ShellProps }) {
  const { draft, updateCorporate } = useKyc();
  const [type, setType] = useState<CacRegistrationType>(
    draft?.kind === "corporate"
      ? (draft.registrationType ?? "registered_company")
      : "registered_company",
  );
  const [manual, setManual] = useState(false);
  const [cacNumber, setCacNumber] = useState(
    draft?.kind === "corporate" ? (draft.cacNumber ?? "") : "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fieldState = useMemo(
    () => getCacFieldState(cacNumber, type),
    [cacNumber, type],
  );

  useEffect(() => {
    if (manual) return;
    const detected = detectCacRegistrationType(cacNumber);
    if (detected && detected !== type) setType(detected);
  }, [cacNumber, manual, type]);

  return (
    <FlowLayout
      title="Business registration details"
      subtitle="Enter the details on your CAC registration certificate."
      {...shell}
      currentStepId="cac"
      footer={
        <Button
          label={busy ? "Verifying…" : "Continue"}
          disabled={!fieldState.isValid || busy}
          onPress={async () => {
            setBusy(true);
            const result = await verifyCac({
              registrationType: type,
              cacNumber: fieldState.display,
            });
            setBusy(false);
            if (!result.ok) {
              setError(result.message);
              void Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error,
              );
              return;
            }
            void Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            );
            await updateCorporate({
              step: "principal-bvn",
              registrationType: type,
              cacNumber: fieldState.display,
            });
          }}
        />
      }
    >
      <Text className="text-sm font-semibold text-ink">Registration type</Text>
      <View className="flex-row gap-1.5 rounded-xl bg-[#eceae7] p-1.5">
        {(
          [
            ["registered_company", "Registered company"],
            ["business_name", "Business name"],
          ] as const
        ).map(([value, label]) => (
          <Pressable
            key={value}
            onPress={() => {
              setManual(true);
              setType(value);
            }}
            className={`flex-1 items-center rounded-[10px] px-2 py-2.5 ${
              type === value ? "bg-white" : ""
            }`}
          >
            <Text
              className={`text-center text-xs font-semibold ${
                type === value ? "text-accent" : "text-muted"
              }`}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Field
        label="CAC registration number"
        placeholder="e.g. 1234567"
        value={cacNumber}
        onChangeText={setCacNumber}
        prefix={type === "business_name" ? "BN" : "RC"}
        success={fieldState.isValid ? fieldState.message : undefined}
        error={
          cacNumber.trim() && !fieldState.isValid
            ? fieldState.message
            : undefined
        }
      />
      {error ? (
        <Text className="rounded-[10px] bg-danger-soft px-3.5 py-3 text-sm text-danger">
          {error}
        </Text>
      ) : null}
    </FlowLayout>
  );
}

function PrincipalStep({ shell }: { shell: ShellProps }) {
  const { draft, updateCorporate } = useKyc();
  const [bvn, setBvn] = useState(
    draft?.kind === "corporate" ? (draft.bvn ?? "") : "",
  );
  const [dob, setDob] = useState(
    draft?.kind === "corporate" && draft.dateOfBirth
      ? new Date(draft.dateOfBirth)
      : new Date(1995, 0, 1),
  );
  const [showPicker, setShowPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bvnState = useMemo(() => getBvnFieldState(bvn), [bvn]);
  const dobIso = toIsoDate(dob);
  const canContinue =
    bvnState.isValid && dateOfBirthSchema.safeParse(dobIso).success;

  return (
    <FlowLayout
      title="Principal BVN details"
      subtitle="Enter the BVN for the director or owner completing this verification."
      {...shell}
      currentStepId="principal"
      footer={
        <Button
          label={busy ? "Verifying…" : "Continue"}
          disabled={!canContinue || busy}
          onPress={async () => {
            setBusy(true);
            const result = await verifyBvn({
              bvn: bvnState.digits,
              dateOfBirth: dobIso,
            });
            setBusy(false);
            if (!result.ok) {
              setError(result.message);
              return;
            }
            void Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            );
            await updateCorporate({
              step: "address",
              bvn: bvnState.digits,
              dateOfBirth: dobIso,
            });
          }}
        />
      }
    >
      <Field
        label="BVN"
        keyboardType="number-pad"
        maxLength={11}
        value={bvnState.digits}
        onChangeText={setBvn}
        suffix={`${bvnState.digits.length}/11`}
        success={bvnState.isValid ? bvnState.message : undefined}
        error={
          bvnState.digits.length > 0 && !bvnState.isComplete
            ? bvnState.message
            : undefined
        }
      />
      <ContextualHelp>
        The principal’s BVN links the business to a verified director or owner.
      </ContextualHelp>
      <View className="gap-1.5">
        <Text className="text-sm font-semibold text-ink">Date of birth</Text>
        <Pressable
          onPress={() => setShowPicker(true)}
          className="min-h-[50px] justify-center rounded-xl border-[1.5px] border-border bg-surface px-3.5"
        >
          <Text className="text-base text-ink">{dobIso}</Text>
        </Pressable>
      </View>
      {showPicker ? (
        <DateTimePicker
          value={dob}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()}
          onChange={(_, date) => {
            if (Platform.OS !== "ios") setShowPicker(false);
            if (date) setDob(date);
          }}
        />
      ) : null}
      {error ? (
        <Text className="rounded-[10px] bg-danger-soft px-3.5 py-3 text-sm text-danger">
          {error}
        </Text>
      ) : null}
    </FlowLayout>
  );
}

function AddressStep({ shell }: { shell: ShellProps }) {
  const { draft, updateCorporate } = useKyc();
  const [address, setAddress] = useState<AddressInput>(
    draft?.kind === "corporate" && draft.address
      ? draft.address
      : { street: "", city: "", state: "", postalCode: "" },
  );
  const [busy, setBusy] = useState(false);
  const parsed = addressSchema.safeParse(address);

  return (
    <FlowLayout
      title="Business address"
      subtitle="Enter the registered or operating address of the business."
      {...shell}
      currentStepId="address"
      footer={
        <Button
          label={busy ? "Saving…" : "Continue"}
          disabled={!parsed.success || busy}
          onPress={async () => {
            if (!parsed.success) return;
            setBusy(true);
            await saveAddress(parsed.data);
            setBusy(false);
            await updateCorporate({
              step: "face-prime",
              address: parsed.data,
            });
          }}
        />
      }
    >
      <Field
        label="Street address"
        value={address.street}
        onChangeText={(street) => setAddress((a) => ({ ...a, street }))}
      />
      <Field
        label="City"
        value={address.city}
        onChangeText={(city) => setAddress((a) => ({ ...a, city }))}
      />
      <Field
        label="State"
        value={address.state}
        onChangeText={(state) => setAddress((a) => ({ ...a, state }))}
      />
    </FlowLayout>
  );
}

function FaceStep({ shell }: { shell: ShellProps }) {
  const { updateCorporate } = useKyc();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <FlowLayout
      title="Face verification"
      subtitle="Position the principal’s face in the frame, then capture."
      {...shell}
      currentStepId="face"
    >
      <CameraPreview
        busy={busy}
        onCapture={async (uri) => {
          setBusy(true);
          const result = await verifyFace(uri);
          setBusy(false);
          if (!result.ok) {
            setError(result.message);
            return;
          }
          await updateCorporate({ step: "done", faceVerified: true });
        }}
      />
      {error ? (
        <Text className="rounded-[10px] bg-danger-soft px-3.5 py-3 text-sm text-danger">
          {error}
        </Text>
      ) : null}
    </FlowLayout>
  );
}
