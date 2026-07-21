import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ProgressBar } from "./ProgressBar";
import { ProgressSummary } from "./ProgressSummary";
import type { FlowStep } from "../flow/steps";

type Props = {
  title: string;
  subtitle?: string;
  steps?: FlowStep[];
  currentStepId?: string;
  reachedIndex?: number;
  onSelectStep?: (stepId: string) => void;
  children: ReactNode;
  footer?: ReactNode;
  showSummary?: boolean;
};

export function FlowLayout({
  title,
  subtitle,
  steps,
  currentStepId,
  reachedIndex = -1,
  onSelectStep,
  children,
  footer,
  showSummary = false,
}: Props) {
  return (
    <div className="mx-auto w-[min(100%-2rem,1080px)] py-5 pb-12">
      <header className="mb-5">
        <Link
          to="/"
          className="inline-flex items-center font-bold tracking-wide text-accent no-underline"
        >
          KYC
        </Link>
      </header>

      <div
        className={
          showSummary
            ? "grid items-start gap-5 max-[860px]:grid-cols-1 min-[861px]:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.8fr)]"
            : "mx-auto grid max-w-[640px] grid-cols-1"
        }
      >
        <main className="grid gap-5 rounded-[18px] border border-border/80 bg-surface p-[1.35rem_1.4rem_1.4rem] shadow-panel">
          {steps && currentStepId ? (
            <ProgressBar
              steps={steps}
              currentId={currentStepId}
              reachedIndex={reachedIndex}
              onSelectStep={onSelectStep}
            />
          ) : null}
          <div>
            <h1 className="mb-1.5 text-[clamp(1.5rem,2.4vw,1.85rem)] leading-tight tracking-tight">
              {title}
            </h1>
            {subtitle ? (
              <p className="m-0 leading-snug text-muted">{subtitle}</p>
            ) : null}
          </div>
          <div className="grid gap-4">{children}</div>
          {footer ? <div className="pt-1">{footer}</div> : null}
        </main>

        {showSummary ? (
          <aside className="sticky top-4 max-[860px]:static max-[860px]:order-first">
            <ProgressSummary />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
