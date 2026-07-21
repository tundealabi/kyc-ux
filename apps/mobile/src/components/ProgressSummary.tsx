import { Pressable, Text, View } from "react-native";
import { useKyc } from "../state/KycContext";
import type { CorporateUiStep, PersonalUiStep } from "../flow/steps";

type Props = {
  title?: string;
  embedded?: boolean;
  editable?: boolean;
};

export function ProgressSummary({
  title = "Your progress",
  embedded = false,
  editable = false,
}: Props) {
  const { summary, draft, updatePersonal, updateCorporate } = useKyc();

  async function goToStep(step: string) {
    if (draft?.kind === "personal") {
      await updatePersonal({ step: step as PersonalUiStep });
      return;
    }
    if (draft?.kind === "corporate") {
      await updateCorporate({ step: step as CorporateUiStep });
    }
  }

  const body =
    summary.lines.length === 0 ? (
      <Text className="text-sm leading-5 text-muted">
        Details you enter will appear here as you go.
      </Text>
    ) : (
      <View className="gap-3">
        {summary.lines.map((line) => (
          <View
            key={line.label}
            className="flex-row items-start gap-3 border-b border-border pb-3"
          >
            <View className="min-w-0 flex-1 gap-0.5">
              <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
                {line.label}
              </Text>
              <Text className="text-[15px] text-ink">{line.value}</Text>
            </View>
            {editable ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Edit ${line.label}`}
                hitSlop={8}
                className="mt-0.5 h-8 w-8 items-center justify-center rounded-lg active:bg-accent-soft"
                onPress={() => void goToStep(line.step)}
              >
                <Text className="text-[15px] leading-4 text-muted">✎</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>
    );

  if (embedded) {
    return (
      <View className="gap-3" accessibilityLabel="Progress summary">
        <View className="gap-1">
          <Text className="text-base font-semibold text-ink">{title}</Text>
          <Text className="text-sm text-muted">{summary.accountLabel}</Text>
        </View>
        {body}
      </View>
    );
  }

  return (
    <View
      className="rounded-2xl border border-border/80 bg-surface p-5 shadow-sm"
      accessibilityLabel="Progress summary"
    >
      <Text className="mb-1.5 text-base font-semibold text-ink">{title}</Text>
      <Text className="mb-4 text-sm text-muted">{summary.accountLabel}</Text>
      {body}
    </View>
  );
}
