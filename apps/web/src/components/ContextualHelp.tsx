import { useId, useState, type ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
};

export function ContextualHelp({
  title = "Why do we need this?",
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="mt-2">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 border-none bg-transparent p-0 text-sm font-semibold text-accent"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div
          id={panelId}
          className="mt-2 rounded-[10px] bg-accent-soft px-[0.9rem] py-3 text-sm leading-snug text-ink"
          role="note"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
