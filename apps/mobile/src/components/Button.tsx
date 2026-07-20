import { Pressable, Text, type PressableProps } from "react-native";

type Props = PressableProps & {
  label: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export function Button({
  label,
  variant = "primary",
  disabled,
  className,
  ...rest
}: Props & { className?: string }) {
  const bg =
    variant === "primary"
      ? disabled
        ? "bg-accent-disabled"
        : "bg-accent"
      : "bg-accent-soft";
  const text = variant === "primary" ? "text-white" : "text-accent";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={`w-full items-center rounded-xl px-4 py-3.5 active:opacity-90 ${bg} ${className ?? ""}`}
      {...rest}
    >
      <Text className={`text-[15px] font-bold ${text}`}>{label}</Text>
    </Pressable>
  );
}
