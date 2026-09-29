import { notFound } from "next/navigation";
import { StudentShell } from "@/components/dashboard/student-shell";
import { CollegePicker } from "@/components/dashboard/college-picker";
import { CollegeWiseButton } from "@/components/dashboard/college-wise-button";
import { getLiveCohortBySlug } from "@/lib/live-cohorts";
import { collegesForCohort, studentsTrackedByCollege } from "@/lib/cohort-data";
import { STUDENT_VIEW_BASE } from "@/lib/public-path";

export const dynamic = "force-dynamic";

export default async function StudentCohortPage({
  params,
}: {
  params: Promise<{ cohort: string }>;
}) {
  const { cohort: cohortSlug } = await params;
  const cohort = await getLiveCohortBySlug(cohortSlug);
  if (!cohort) notFound();

  const colleges = collegesForCohort(cohort);
  const enrollment = cohort.kind === "enrollment";

  return (
    <StudentShell
      title={cohort.label}
      subtitle={
        enrollment
          ? "No login. Select your college for name, dummy email, and password (VS@123)."
          : "No login. Select your college for the student monitoring sheet."
      }
      backHref={STUDENT_VIEW_BASE}
      backLabel="Back to student view"
    >
      {!enrollment && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm text-[var(--color-curie-muted)]">
            Open one college, or see nomination and accelerator selection for every college.
          </p>
          <CollegeWiseButton
            cohortSlug={cohort.slug}
            label={cohort.label}
            colleges={colleges}
            trackedBySlug={studentsTrackedByCollege(cohort)}
            kind={cohort.kind}
            hrefBase={STUDENT_VIEW_BASE}
          />
        </div>
      )}
      <CollegePicker
        colleges={colleges}
        cohortSlug={cohort.slug}
        kind={cohort.kind}
        hrefBase={STUDENT_VIEW_BASE}
      />
    </StudentShell>
  );
}
