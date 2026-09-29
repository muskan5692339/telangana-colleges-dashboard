import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CollegeSelectionView } from "@/components/dashboard/college-selection-view";
import { LoadingSkeleton } from "@/components/feedback/feedback";
import { getCollege } from "@/lib/cohort-data";
import { getLiveCohortBySlug } from "@/lib/live-cohorts";

export const dynamic = "force-dynamic";

export default async function SelectedCollegePage({
  params,
}: {
  params: Promise<{ cohort: string; college: string }>;
}) {
  const { cohort: cohortSlug, college: collegeSlug } = await params;
  const cohort = await getLiveCohortBySlug(cohortSlug);
  if (!cohort) notFound();

  const selected = getCollege(cohort, collegeSlug);
  if (!selected) notFound();

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CollegeSelectionView cohort={cohort} selected={selected} />
    </Suspense>
  );
}
