import { Link } from "react-router-dom";
import { useKyc } from "../state/KycContext";
import { FlowLayout } from "../components/FlowLayout";

function ChoiceCard({
  to,
  onClick,
  title,
  description,
  icon,
}: {
  to: string;
  onClick: () => void;
  title: string;
  description: string;
  icon: "person" | "building";
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="grid grid-cols-[auto_1fr_auto] items-center gap-[0.9rem] rounded-[14px] border-[1.5px] border-border bg-surface px-[1.05rem] py-4 no-underline transition-colors hover:border-accent hover:bg-accent-soft/55 focus-visible:border-accent focus-visible:bg-accent-soft/55 focus-visible:outline-none"
    >
      <span
        className="relative grid size-[2.6rem] place-items-center rounded-xl bg-accent-soft"
        aria-hidden="true"
      >
        {icon === "person" ? (
          <>
            <span className="absolute top-[0.55rem] size-[0.7rem] rounded-full border-2 border-accent" />
            <span className="absolute bottom-2 h-[0.65rem] w-[1.15rem] rounded-t-[0.7rem] border-2 border-b-0 border-accent" />
          </>
        ) : (
          <span className="h-[1.15rem] w-[1.05rem] rounded-sm border-2 border-accent shadow-[inset_0.22rem_0.25rem_0_-0.1rem_var(--color-accent),inset_-0.22rem_0.25rem_0_-0.1rem_var(--color-accent),inset_0.22rem_-0.2rem_0_-0.1rem_var(--color-accent),inset_-0.22rem_-0.2rem_0_-0.1rem_var(--color-accent)]" />
        )}
      </span>
      <span className="grid gap-0.5">
        <strong className="text-base">{title}</strong>
        <span className="text-sm leading-snug text-muted">{description}</span>
      </span>
      <span
        className="text-[1.4rem] leading-none text-muted"
        aria-hidden="true"
      >
        ›
      </span>
    </Link>
  );
}

export function AccountSelectPage() {
  const { startPersonal, startCorporate, draft } = useKyc();

  return (
    <FlowLayout
      title="Choose an account"
      subtitle="Select the account you want to verify. The information required depends on the account type."
      showSummary={false}
    >
      <div className="grid gap-3">
        <ChoiceCard
          to="/personal"
          onClick={() => {
            void startPersonal();
          }}
          icon="person"
          title="Personal account"
          description="Individual — 4 steps, ~3 min. BVN, NIN, address, then face check."
        />
        <ChoiceCard
          to="/corporate"
          onClick={() => {
            void startCorporate();
          }}
          icon="building"
          title="Corporate account"
          description="Business — 4 steps, ~5 min. CAC registration, principal BVN, address, then face check."
        />
      </div>

      {draft ? (
        <p className="m-0 text-[0.85rem] text-muted">
          You have a saved {draft.kind} verification in progress. Opening a path
          will continue from your draft.
        </p>
      ) : null}

      <div
        className="mt-2 flex items-center gap-2.5 rounded-xl border border-accent/20 bg-accent-soft px-4 py-[0.85rem] text-sm text-ink"
        role="note"
      >
        <span
          className="inline-grid size-[1.35rem] shrink-0 place-items-center rounded-full bg-accent text-[0.7rem] font-bold text-white"
          aria-hidden="true"
        >
          ✓
        </span>
        Your information is used only to complete verification.
      </div>
    </FlowLayout>
  );
}
