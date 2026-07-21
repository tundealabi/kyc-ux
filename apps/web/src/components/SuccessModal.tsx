import { useEffect, useId } from "react";
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
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-ink/40 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-[22rem] rounded-[18px] border border-border/80 bg-surface p-6 shadow-panel"
      >
        <div className="mb-4 grid place-items-center">
          <span
            className="grid size-12 place-items-center rounded-full bg-success-soft text-xl font-bold text-success"
            aria-hidden="true"
          >
            ✓
          </span>
        </div>
        <h2
          id={titleId}
          className="m-0 mb-2 text-center text-xl font-bold tracking-tight"
        >
          {title}
        </h2>
        <p className="m-0 mb-6 text-center text-[0.95rem] leading-snug text-muted">
          {message}
        </p>
        <Button fullWidth autoFocus onClick={() => void onConfirm()}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
