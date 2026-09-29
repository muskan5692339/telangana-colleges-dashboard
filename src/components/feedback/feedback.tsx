import { Inbox, AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton({
  rows = 4,
}: {
  rows?: number;
}) {
  return (
    <div role="status" aria-live="polite" aria-label="Loading" className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-[var(--color-curie-border)] bg-white p-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  message,
  hint,
  cta,
}: {
  icon?: ReactNode;
  message: string;
  hint?: string;
  cta?: ReactNode;
}) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-dashed border-[var(--color-curie-border)] bg-white px-5 py-10 text-center"
    >
      <div
        className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--color-page)] text-[var(--color-curie-muted)]"
        aria-hidden
      >
        {icon ?? <Inbox size={20} />}
      </div>
      <p className="mx-auto mt-3 max-w-[320px] text-sm font-semibold text-[var(--color-navy)]">
        {message}
      </p>
      {hint && (
        <p className="mx-auto mt-1 max-w-[360px] text-xs leading-relaxed text-[var(--color-curie-muted)]">
          {hint}
        </p>
      )}
      {cta && <div className="mt-4 flex justify-center">{cta}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message = "Could not load this view. Refresh and try again.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <Alert variant="destructive" role="alert">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
