import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { CollegeSelectionView } from "@/components/dashboard/college-selection-view";
import { LoadingSkeleton } from "@/components/feedback/feedback";
import { getCollege } from "@/lib/cohort-data";
import { getLiveCohortBySlug } from "@/lib/live-cohorts";

export async function OpenCohortPage({
  cohortSlug,
  collegeSlug,
}: {
  cohortSlug: string;
  collegeSlug?: string;
}) {
  const cohort = await getLiveCohortBySlug(cohortSlug);
  if (!cohort) notFound();

  const selected = getCollege(cohort, collegeSlug);
  if (collegeSlug && selected) {
    redirect(`/cohorts/${cohort.slug}/colleges/${selected.slug}`);
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CollegeSelectionView cohort={cohort} selected={null} />
    </Suspense>
  );
}
