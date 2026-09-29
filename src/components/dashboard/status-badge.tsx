import { cn } from "@/lib/utils";
import type { AssignmentStatus } from "@/lib/types";
import { STATUS_FILL, STATUS_LABEL } from "@/lib/types";

export function StatusBadge({
  status,
  compact = false,
}: {
  status: AssignmentStatus | null;
  compact?: boolean;
}) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded-full border border-dashed border-[var(--color-curie-border)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-curie-muted)]">
        Not yet tracked
      </span>
    );
  }

  const fill = STATUS_FILL[status];

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-sm px-2 py-0.5 text-[10px] font-bold leading-tight",
        compact && "px-1.5",
      )}
      style={{ background: fill.bg, color: fill.fg }}
      title={STATUS_LABEL[status]}
    >
      {compact ? shortLabel(status) : STATUS_LABEL[status]}
    </span>
  );
}

export function StatusFillCell({ status }: { status: AssignmentStatus | null }) {
  if (!status) {
    return <span className="text-[var(--color-curie-muted)]">—</span>;
  }
  return <span className="font-semibold">{STATUS_LABEL[status]}</span>;
}

function shortLabel(status: AssignmentStatus) {
  switch (status) {
    case "accepted":
      return "Accepted";
    case "accepted_with_feedback":
      return "With feedback";
    case "rejected_with_feedback":
      return "Rejected";
    case "under_review":
      return "Under Review";
    case "no_submission":
      return "No submission";
  }
}
