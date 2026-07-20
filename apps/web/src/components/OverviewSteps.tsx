type Step = { title: string; description: string };

type Props = {
  steps: Step[];
};

export function OverviewSteps({ steps }: Props) {
  return (
    <ol className="m-0 list-none overflow-hidden rounded-[14px] border border-border p-0">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="grid grid-cols-[auto_1fr] gap-[0.85rem] border-b border-border px-[1.05rem] py-4 last:border-b-0"
        >
          <span
            className="inline-grid size-[1.7rem] place-items-center rounded-full bg-accent-soft text-[0.8rem] font-bold text-accent"
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <span>
            <strong className="mb-0.5 block">{step.title}</strong>
            <span className="block text-sm leading-snug text-muted">
              {step.description}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
