import { Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKyc } from "../src/state/KycContext";

export default function AccountSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startPersonal, startCorporate, draft } = useKyc();

  return (
    <View
      className="flex-1 bg-canvas px-4"
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }}
    >
      <Text className="mb-6 text-base font-bold tracking-wide text-accent">
        KYC
      </Text>
      <Text className="mb-1.5 text-2xl font-bold text-ink">
        Choose an account
      </Text>
      <Text className="mb-5 text-[15px] leading-5 text-muted">
        Select the account you want to verify. The information required depends
        on the account type.
      </Text>

      <View className="gap-3">
        <Pressable
          className="flex-row items-center gap-3 rounded-[14px] border-[1.5px] border-border bg-surface px-4 py-4 active:border-accent"
          onPress={async () => {
            await startPersonal();
            router.push("/personal");
          }}
        >
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-accent-soft">
            <Text className="font-bold text-accent">P</Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-ink">Personal account</Text>
            <Text className="text-sm leading-5 text-muted">
              Individual — 4 steps, ~3 min. BVN, NIN, address, then face check.
            </Text>
          </View>
          <Text className="text-xl text-muted">›</Text>
        </Pressable>

        <Pressable
          className="flex-row items-center gap-3 rounded-[14px] border-[1.5px] border-border bg-surface px-4 py-4 active:border-accent"
          onPress={async () => {
            await startCorporate();
            router.push("/corporate");
          }}
        >
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-accent-soft">
            <Text className="font-bold text-accent">C</Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-ink">Corporate account</Text>
            <Text className="text-sm leading-5 text-muted">
              Business — 4 steps, ~5 min. CAC, principal BVN, address, then face
              check.
            </Text>
          </View>
          <Text className="text-xl text-muted">›</Text>
        </Pressable>
      </View>

      {draft ? (
        <Text className="mt-4 text-sm text-muted">
          You have a saved {draft.kind} verification in progress.
        </Text>
      ) : null}

      <View className="mt-auto flex-row items-center gap-2.5 rounded-xl border border-accent/20 bg-accent-soft px-4 py-3">
        <View className="h-5 w-5 items-center justify-center rounded-full bg-accent">
          <Text className="text-[10px] font-bold text-white">✓</Text>
        </View>
        <Text className="flex-1 text-sm text-ink">
          Your information is used only to complete verification.
        </Text>
      </View>
    </View>
  );
}
