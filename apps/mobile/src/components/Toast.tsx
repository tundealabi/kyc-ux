import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastVariant = "success";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DISMISS_MS = 4200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);
  const insets = useSafeAreaInsets();

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      clearTimer();
      const id = ++idRef.current;
      setToast({ id, message, variant });
      timerRef.current = setTimeout(() => {
        setToast((current) => (current?.id === id ? null : current));
        timerRef.current = null;
      }, DISMISS_MS);
    },
    [clearTimer],
  );

  useEffect(() => () => clearTimer(), [clearTimer]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <View className="flex-1">
        {children}
        {toast ? (
          <View
            pointerEvents="box-none"
            className="absolute inset-x-0 z-50 items-center px-4"
            style={{ top: insets.top + 8 }}
            accessibilityLiveRegion="polite"
          >
            <View className="w-full max-w-md flex-row items-start gap-3 rounded-xl border border-success/30 bg-success-soft px-4 py-3 shadow-sm">
              <View className="mt-0.5 h-5 w-5 items-center justify-center rounded-full bg-success">
                <Text className="text-[10px] font-bold text-white">✓</Text>
              </View>
              <Text className="flex-1 text-sm font-semibold leading-5 text-ink">
                {toast.message}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dismiss"
                hitSlop={8}
                onPress={() => {
                  clearTimer();
                  setToast(null);
                }}
              >
                <Text className="text-sm font-semibold text-muted">✕</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
