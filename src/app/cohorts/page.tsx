import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CohortCards } from "@/components/dashboard/cohort-cards";
import { Trail } from "@/components/dashboard/trail";
import { LoadingSkeleton } from "@/components/feedback/feedback";
import { cohortsInSelectionOrder } from "@/lib/cohort-data";
import { listLiveCohorts } from "@/lib/live-cohorts";

export const dynamic = "force-dynamic";

export default async function CohortsPage() {
  const cohorts = cohortsInSelectionOrder(await listLiveCohorts());

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AppShell title="Cohorts" subtitle="Telangana Colleges Dashboard">
        <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 md:px-8 md:py-8">
          <Trail items={[{ label: "Cohorts" }]} />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-curie-muted)]">
              Choose a branch
            </p>
            <h2 className="font-display text-[22px] font-semibold text-[var(--color-navy)] md:text-3xl">
              Cohort selection
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--color-curie-muted)]">
              Old batch is on the left. Current batch is on the right, for tablet enrollment dummy emails and passwords.
            </p>
          </div>
          <CohortCards cohorts={cohorts} />
        </div>
      </AppShell>
    </Suspense>
  );
}
