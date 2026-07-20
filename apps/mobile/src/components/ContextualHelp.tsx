import { useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

export function ContextualHelp({
  title = "Why do we need this?",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View className="mt-1">
      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="flex-row items-center gap-1 self-start"
        accessibilityRole="button"
      >
        <Text className="text-sm font-semibold text-accent">{title}</Text>
        <Text className="text-sm font-semibold text-accent">
          {open ? "−" : "+"}
        </Text>
      </Pressable>
      {open ? (
        <View className="mt-2 rounded-[10px] bg-accent-soft px-3.5 py-3">
          <Text className="text-sm leading-5 text-ink">{children}</Text>
        </View>
      ) : null}
    </View>
  );
}
