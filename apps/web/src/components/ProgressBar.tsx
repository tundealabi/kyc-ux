import type { FlowStep } from "../flow/steps";

type Props = {
  steps: FlowStep[];
  currentId: string;
  /** Highest completed/reachable index (inclusive). */
  reachedIndex: number;
  onSelectStep?: (stepId: string) => void;
};

export function ProgressBar({
  steps,
  currentId,
  reachedIndex,
  onSelectStep,
}: Props) {
  const current = Math.max(
    0,
    steps.findIndex((s) => s.id === currentId),
  );

  return (
    <nav className="grid gap-3" aria-label="Verification progress">
      <p className="m-0 text-sm font-semibold text-ink">
        Step {current + 1} of {steps.length} — {steps[current]?.label}
      </p>
      <ol className="m-0 grid list-none grid-cols-4 gap-2 p-0 max-sm:gap-1.5">
        {steps.map((step, index) => {
          const status =
            index === current
              ? "current"
              : index <= reachedIndex
                ? "done"
                : "upcoming";

          const canJump =
            Boolean(onSelectStep) && status === "done" && index !== current;

          const dotClass =
            status === "current"
              ? "bg-accent text-white"
              : status === "done"
                ? "bg-success-soft text-success"
                : "bg-[#eceae7] text-muted";

          const textClass =
            status === "current"
              ? "font-semibold text-ink"
              : status === "done"
                ? "text-success"
                : "text-muted";

          const content = (
            <>
              <span
                className={`inline-grid size-6 shrink-0 place-items-center rounded-full text-[0.7rem] font-bold ${dotClass}`}
                aria-hidden="true"
              >
                {status === "done" ? "✓" : index + 1}
              </span>
              <span className={`truncate text-xs max-sm:hidden ${textClass}`}>
                {step.shortLabel}
              </span>
            </>
          );

          return (
            <li
              key={step.id}
              className="flex min-w-0 items-center gap-1.5"
              aria-current={status === "current" ? "step" : undefined}
            >
              {canJump ? (
                <button
                  type="button"
                  className="flex min-w-0 cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-left hover:opacity-80"
                  onClick={() => onSelectStep?.(step.id)}
                >
                  {content}
                </button>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
