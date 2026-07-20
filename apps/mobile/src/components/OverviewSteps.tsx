import { Text, View } from "react-native";

type Step = { title: string; description: string };

export function OverviewSteps({ steps }: { steps: Step[] }) {
  return (
    <View className="overflow-hidden rounded-[14px] border border-border">
      {steps.map((step, index) => (
        <View
          key={step.title}
          className={`flex-row gap-3 px-4 py-4 ${
            index < steps.length - 1 ? "border-b border-border" : ""
          }`}
        >
          <View className="h-[27px] w-[27px] items-center justify-center rounded-full bg-accent-soft">
            <Text className="text-xs font-bold text-accent">{index + 1}</Text>
          </View>
          <View className="flex-1">
            <Text className="mb-0.5 font-semibold text-ink">{step.title}</Text>
            <Text className="text-sm leading-5 text-muted">
              {step.description}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
