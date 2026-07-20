import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProgressBar } from "./ProgressBar";
import type { FlowStep } from "../flow/steps";

type Props = {
  title: string;
  subtitle?: string;
  steps?: FlowStep[];
  currentStepId?: string;
  reachedIndex?: number;
  onSelectStep?: (stepId: string) => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function FlowLayout({
  title,
  subtitle,
  steps,
  currentStepId,
  reachedIndex = -1,
  onSelectStep,
  children,
  footer,
}: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ paddingTop: insets.top }}
    >
      <View className="px-4 pb-2 pt-3">
        <Pressable onPress={() => router.replace("/")} accessibilityRole="link">
          <Text className="text-base font-bold tracking-wide text-accent">
            KYC
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-5 rounded-2xl border border-border/80 bg-surface p-4 shadow-sm">
          {steps && currentStepId ? (
            <ProgressBar
              steps={steps}
              currentId={currentStepId}
              reachedIndex={reachedIndex}
              onSelectStep={onSelectStep}
            />
          ) : null}
          <View className="gap-1.5">
            <Text className="text-2xl font-bold tracking-tight text-ink">
              {title}
            </Text>
            {subtitle ? (
              <Text className="text-[15px] leading-5 text-muted">
                {subtitle}
              </Text>
            ) : null}
          </View>
          <View className="gap-4">{children}</View>
        </View>
      </ScrollView>

      {footer ? (
        <View
          className="border-t border-border bg-surface px-4 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          {footer}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
