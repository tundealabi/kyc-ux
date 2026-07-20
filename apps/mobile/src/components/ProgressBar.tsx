import { Pressable, Text, View } from "react-native";
import type { FlowStep } from "../flow/steps";

type Props = {
  steps: FlowStep[];
  currentId: string;
  reachedIndex: number;
  onSelectStep?: (stepId: string) => void;
};

export function ProgressBar({
  steps,
  currentId,
  reachedIndex,
  onSelectStep,
}: Props) {
  const current = Math.max(
    0,
    steps.findIndex((s) => s.id === currentId),
  );

  return (
    <View className="gap-3">
      <Text className="text-sm font-semibold text-ink">
        Step {current + 1} of {steps.length} — {steps[current]?.label}
      </Text>
      <View className="flex-row gap-2">
        {steps.map((step, index) => {
          const status =
            index === current
              ? "current"
              : index <= reachedIndex
                ? "done"
                : "upcoming";
          const canJump =
            Boolean(onSelectStep) && status === "done" && index !== current;

          const dot =
            status === "current"
              ? "bg-accent"
              : status === "done"
                ? "bg-success-soft"
                : "bg-[#eceae7]";
          const dotText =
            status === "current"
              ? "text-white"
              : status === "done"
                ? "text-success"
                : "text-muted";

          const content = (
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              <View
                className={`h-6 w-6 items-center justify-center rounded-full ${dot}`}
              >
                <Text className={`text-[10px] font-bold ${dotText}`}>
                  {status === "done" ? "✓" : index + 1}
                </Text>
              </View>
              <Text
                numberOfLines={1}
                className={`flex-1 text-[11px] ${
                  status === "current"
                    ? "font-semibold text-ink"
                    : status === "done"
                      ? "text-success"
                      : "text-muted"
                }`}
              >
                {step.shortLabel}
              </Text>
            </View>
          );

          return canJump ? (
            <Pressable
              key={step.id}
              onPress={() => onSelectStep?.(step.id)}
              className="min-w-0 flex-1"
              accessibilityRole="button"
            >
              {content}
            </Pressable>
          ) : (
            <View key={step.id} className="min-w-0 flex-1">
              {content}
            </View>
          );
        })}
      </View>
    </View>
  );
}
