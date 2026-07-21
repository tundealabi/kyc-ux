import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import {
  dateOfBirthSchema,
  getBvnFieldState,
  getNinFieldState,
  addressSchema,
  type AddressInput,
} from "@kyc/validation";
import { verifyBvn, verifyNin, verifyFace, saveAddress } from "@kyc/api-client";
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
  PERSONAL_STEPS,
  personalProgressId,
  personalReachedIndex,
  personalStepFromProgressId,
  type PersonalUiStep,
} from "../flow/steps";

const OVERVIEW = [
  {
    title: "Identity information",
    description: "Your BVN and date of birth registered with your bank.",
  },
  {
    title: "NIN confirmation",
    description: "Your NIN details must match the BVN you provided.",
  },
  {
    title: "Address",
    description: "Your residential address for verification records.",
  },
  {
    title: "Face verification",
    description:
      "A quick face check to confirm you are completing this yourself.",
  },
];

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function PersonalFlow() {
  const { draft, ready, startPersonal, updatePersonal } = useKyc();

  useEffect(() => {
    if (!ready) return;
    if (draft?.kind !== "personal") {
      void startPersonal();
    }
  }, [ready, draft, startPersonal]);

  if (!ready || draft?.kind !== "personal") {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <Text className="text-muted">Loading…</Text>
      </View>
    );
  }

  const step = draft.step as PersonalUiStep;
  const progressId = personalProgressId(step);
  const reached = personalReachedIndex(draft);

  const shell = {
    steps: PERSONAL_STEPS,
    currentStepId: progressId,
    reachedIndex: reached,
    onSelectStep: (id: string) => {
      void updatePersonal({ step: personalStepFromProgressId(id) });
    },
  };

  if (step === "overview") {
    return (
      <FlowLayout
        title="Verify your identity"
        subtitle="Provide your BVN, NIN and address, then complete a face check."
        footer={
          <Button
            label="Start identity verification"
            onPress={() => void updatePersonal({ step: "bvn" })}
          />
        }
      >
        <OverviewSteps steps={OVERVIEW} />
      </FlowLayout>
    );
  }

  if (step === "bvn") return <BvnStep shell={shell} />;
  if (step === "nin") return <NinStep shell={shell} />;
  if (step === "address") return <AddressStep shell={shell} />;

  if (step === "face-prime") {
    return (
      <FlowLayout
        title="Prepare for face verification"
        subtitle="Good lighting, remove glasses/mask, hold still."
        {...shell}
        currentStepId="face"
        footer={
          <Button
            label="Continue to camera"
            onPress={() => void updatePersonal({ step: "face" })}
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
          Face verification confirms you are present and completing this
          yourself.
        </ContextualHelp>
      </FlowLayout>
    );
  }

  if (step === "face") return <FaceStep shell={shell} />;

  return <PersonalDoneStep />;
}

function PersonalDoneStep() {
  const router = useRouter();
  const { reset } = useKyc();
  const [successOpen, setSuccessOpen] = useState(false);

  return (
    <FlowLayout
      title="Identity verified"
      subtitle="Review your submitted details below, then continue to your account."
      footer={<Button label="Done" onPress={() => setSuccessOpen(true)} />}
    >
      <ProgressSummary title="Verification summary" embedded editable />
      <SuccessModal
        open={successOpen}
        title="Verification complete"
        message="Your personal verification was submitted successfully."
        onConfirm={async () => {
          await reset();
          router.replace("/");
        }}
      />
    </FlowLayout>
  );
}

type ShellProps = {
  steps: typeof PERSONAL_STEPS;
  currentStepId?: string;
  reachedIndex: number;
  onSelectStep: (id: string) => void;
};

function BvnStep({ shell }: { shell: ShellProps }) {
  const { draft, updatePersonal } = useKyc();
  const [bvn, setBvn] = useState(
    draft?.kind === "personal" ? (draft.bvn ?? "") : "",
  );
  const [dob, setDob] = useState(
    draft?.kind === "personal" && draft.dateOfBirth
      ? new Date(draft.dateOfBirth)
      : new Date(1995, 0, 1),
  );
  const [showPicker, setShowPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bvnState = useMemo(() => getBvnFieldState(bvn), [bvn]);
  const dobIso = toIsoDate(dob);
  const dobOk = dateOfBirthSchema.safeParse(dobIso).success;
  const canContinue = bvnState.isValid && dobOk;

  return (
    <FlowLayout
      title="Enter your BVN details"
      subtitle="Use the BVN and date of birth registered with your bank."
      {...shell}
      currentStepId="bvn"
      footer={
        <Button
          label={busy ? "Verifying…" : "Continue"}
          disabled={!canContinue || busy}
          onPress={async () => {
            setBusy(true);
            setError(null);
            const result = await verifyBvn({
              bvn: bvnState.digits,
              dateOfBirth: dobIso,
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
            await updatePersonal({
              step: "nin",
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
        placeholder="11-digit BVN"
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
        Your Bank Verification Number confirms your identity with Nigerian
        banks.
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
      {Platform.OS === "ios" && showPicker ? (
        <Button
          label="Done"
          variant="secondary"
          onPress={() => setShowPicker(false)}
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

function NinStep({ shell }: { shell: ShellProps }) {
  const { draft, updatePersonal } = useKyc();
  const bvn = draft?.kind === "personal" ? draft.bvn : undefined;
  const [nin, setNin] = useState(
    draft?.kind === "personal" ? (draft.nin ?? "") : "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ninState = useMemo(() => getNinFieldState(nin), [nin]);

  return (
    <FlowLayout
      title="Confirm your NIN"
      subtitle="Your NIN must match the BVN you provided."
      {...shell}
      currentStepId="nin"
      footer={
        <Button
          label={busy ? "Verifying…" : "Continue"}
          disabled={!ninState.isValid || !bvn || busy}
          onPress={async () => {
            if (!bvn) return;
            setBusy(true);
            const result = await verifyNin({ nin: ninState.digits, bvn });
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
            await updatePersonal({ step: "address", nin: ninState.digits });
          }}
        />
      }
    >
      <Field
        label="NIN"
        keyboardType="number-pad"
        maxLength={11}
        placeholder="11-digit NIN"
        value={ninState.digits}
        onChangeText={setNin}
        suffix={`${ninState.digits.length}/11`}
        success={ninState.isValid ? ninState.message : undefined}
        error={
          ninState.digits.length > 0 && !ninState.isComplete
            ? ninState.message
            : undefined
        }
      />
      <ContextualHelp>
        Your NIN is issued by NIMC and confirms identity details linked to your
        BVN.
      </ContextualHelp>
      {error ? (
        <Text className="rounded-[10px] bg-danger-soft px-3.5 py-3 text-sm text-danger">
          {error}
        </Text>
      ) : null}
    </FlowLayout>
  );
}

function AddressStep({ shell }: { shell: ShellProps }) {
  const { draft, updatePersonal } = useKyc();
  const [address, setAddress] = useState<AddressInput>(
    draft?.kind === "personal" && draft.address
      ? draft.address
      : { street: "", city: "", state: "", postalCode: "" },
  );
  const [busy, setBusy] = useState(false);
  const parsed = addressSchema.safeParse(address);

  return (
    <FlowLayout
      title="Enter your address"
      subtitle="Use the residential address linked to your identity documents."
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
            void Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            );
            await updatePersonal({
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
        placeholder="House number and street"
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
      <Field
        label="Postal code (optional)"
        value={address.postalCode ?? ""}
        onChangeText={(postalCode) => setAddress((a) => ({ ...a, postalCode }))}
      />
    </FlowLayout>
  );
}

function FaceStep({ shell }: { shell: ShellProps }) {
  const { updatePersonal } = useKyc();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <FlowLayout
      title="Face verification"
      subtitle="Position your face in the frame, then capture."
      {...shell}
      currentStepId="face"
    >
      <CameraPreview
        busy={busy}
        onCapture={async (uri) => {
          setBusy(true);
          setError(null);
          const result = await verifyFace(uri);
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
          await updatePersonal({ step: "done", faceVerified: true });
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
