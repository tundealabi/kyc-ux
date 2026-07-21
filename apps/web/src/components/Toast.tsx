import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

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

  useEffect(() => {
    setMounted(true);
    return clearTimer;
  }, [clearTimer]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {mounted && toast
        ? createPortal(
            <div className="toast-root" role="status" aria-live="polite">
              <div key={toast.id} className="toast toast--success">
                <span className="toast__icon" aria-hidden="true">
                  ✓
                </span>
                <p className="toast__message">{toast.message}</p>
                <button
                  type="button"
                  className="toast__dismiss"
                  aria-label="Dismiss"
                  onClick={() => {
                    clearTimer();
                    setToast(null);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
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
