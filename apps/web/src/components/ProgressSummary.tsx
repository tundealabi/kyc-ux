import { useKyc } from "../state/KycContext";
import type { CorporateUiStep, PersonalUiStep } from "../flow/steps";

type Props = {
  title?: string;
  /** When true, omit the outer panel chrome (for use inside FlowLayout main). */
  embedded?: boolean;
  /** When true, show an edit control that jumps back to the related step. */
  editable?: boolean;
  className?: string;
};

function EditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11.3 2.3a1 1 0 0 1 1.4 1.4l-.7.7-1.4-1.4.7-.7ZM3 11.6 9.9 4.7l1.4 1.4L4.4 13H3v-1.4Z"
        fill="currentColor"
      />
      <path
        d="M2.5 14h11"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ProgressSummary({
  title = "Your progress",
  embedded = false,
  editable = false,
  className = "",
}: Props) {
  const { summary, draft, updatePersonal, updateCorporate } = useKyc();

  async function goToStep(step: string) {
    if (draft?.kind === "personal") {
      await updatePersonal({ step: step as PersonalUiStep });
      return;
    }
    if (draft?.kind === "corporate") {
      await updateCorporate({ step: step as CorporateUiStep });
    }
  }

  const body =
    summary.lines.length === 0 ? (
      <p className="m-0 text-sm leading-snug text-muted">
        Details you enter will appear here as you go.
      </p>
    ) : (
      <dl className="m-0 grid gap-3">
        {summary.lines.map((line) => (
          <div
            key={line.label}
            className="grid grid-cols-[1fr_auto] items-start gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0"
          >
            <div className="grid gap-0.5 min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                {line.label}
              </dt>
              <dd className="m-0 break-words text-[0.95rem]">{line.value}</dd>
            </div>
            {editable ? (
              <button
                type="button"
                className="mt-0.5 inline-grid size-8 place-items-center rounded-lg border-none bg-transparent text-muted transition-colors hover:bg-accent-soft hover:text-accent"
                aria-label={`Edit ${line.label}`}
                onClick={() => void goToStep(line.step)}
              >
                <EditIcon />
              </button>
            ) : null}
          </div>
        ))}
      </dl>
    );

  if (embedded) {
    return (
      <section
        className={`grid gap-3 ${className}`}
        aria-label="Progress summary"
      >
        <div>
          <h2 className="m-0 mb-1 text-base">{title}</h2>
          <p className="m-0 text-sm text-muted">{summary.accountLabel}</p>
        </div>
        {body}
      </section>
    );
  }

  return (
    <section
      className={`rounded-[18px] border border-border/80 bg-surface p-5 shadow-panel ${className}`}
      aria-label="Progress summary"
    >
      <h2 className="mb-1.5 text-base">{title}</h2>
      <p className="mb-4 text-sm text-muted">{summary.accountLabel}</p>
      {body}
    </section>
  );
}
