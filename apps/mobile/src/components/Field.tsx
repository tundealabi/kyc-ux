import { Text, TextInput, View, type TextInputProps } from "react-native";

type Props = TextInputProps & {
  label: string;
  error?: string;
  success?: string;
  prefix?: string;
  suffix?: string;
};

export function Field({
  label,
  error,
  success,
  prefix,
  suffix,
  ...rest
}: Props) {
  const border = error
    ? "border-danger"
    : success
      ? "border-success"
      : "border-border";

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-semibold text-ink">{label}</Text>
      <View
        className={`min-h-[50px] flex-row items-center gap-2 rounded-xl border-[1.5px] bg-surface px-3.5 ${border}`}
      >
        {prefix ? (
          <Text className="font-semibold text-ink">{prefix}</Text>
        ) : null}
        <TextInput
          className="flex-1 py-3 text-base text-ink"
          placeholderTextColor="#9a9a9a"
          {...rest}
        />
        {suffix ? <Text className="text-xs text-muted">{suffix}</Text> : null}
      </View>
      {error || success ? (
        <Text className={`text-xs ${error ? "text-danger" : "text-success"}`}>
          {error ? `⚠ ${error}` : `✓ ${success}`}
        </Text>
      ) : null}
    </View>
  );
}
