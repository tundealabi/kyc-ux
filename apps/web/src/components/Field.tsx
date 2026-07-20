import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  success?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
};

export function Field({
  label,
  hint,
  error,
  success,
  prefix,
  suffix,
  id,
  className = "",
  ...rest
}: Props) {
  const fieldId = id ?? rest.name;
  const message = error || success || hint;
  const controlBorder = error
    ? "border-danger"
    : success
      ? "border-success"
      : "border-border focus-within:border-accent focus-within:outline focus-within:outline-2 focus-within:outline-accent/25 focus-within:outline-offset-1";

  return (
    <label className={`grid gap-1.5 ${className}`} htmlFor={fieldId}>
      <span className="text-sm font-semibold">{label}</span>
      <span
        className={`flex min-h-[3.1rem] items-center gap-2 rounded-xl border-[1.5px] bg-surface px-[0.9rem] transition-colors ${controlBorder}`}
      >
        {prefix ? (
          <span className="font-semibold text-ink">{prefix}</span>
        ) : null}
        <input
          id={fieldId}
          className="w-full min-w-0 border-none bg-transparent py-[0.85rem] text-ink outline-none"
          {...rest}
        />
        {suffix ? (
          <span className="whitespace-nowrap text-[0.8rem] tabular-nums text-muted">
            {suffix}
          </span>
        ) : null}
      </span>
      {message ? (
        <span
          className={`text-[0.8rem] ${
            error ? "text-danger" : success ? "text-success" : "text-muted"
          }`}
          role={error ? "alert" : undefined}
        >
          {error ? (
            <span aria-hidden="true">⚠ </span>
          ) : success ? (
            <span aria-hidden="true">✓ </span>
          ) : null}
          {message}
        </span>
      ) : null}
    </label>
  );
}
