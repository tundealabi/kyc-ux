import { Modal, Pressable, Text, View } from "react-native";
import { Button } from "./Button";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
};

export function SuccessModal({
  open,
  title,
  message,
  confirmLabel = "OK",
  onConfirm,
}: Props) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        /* require explicit OK */
      }}
    >
      <View className="flex-1 items-center justify-center bg-ink/40 px-4">
        <Pressable className="absolute inset-0" accessibilityElementsHidden />
        <View className="w-full max-w-sm rounded-2xl border border-border/80 bg-surface p-6 shadow-sm">
          <View className="mb-4 items-center">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-success-soft">
              <Text className="text-xl font-bold text-success">✓</Text>
            </View>
          </View>
          <Text className="mb-2 text-center text-xl font-bold tracking-tight text-ink">
            {title}
          </Text>
          <Text className="mb-6 text-center text-[15px] leading-5 text-muted">
            {message}
          </Text>
          <Button label={confirmLabel} onPress={() => void onConfirm()} />
        </View>
      </View>
    </Modal>
  );
}
