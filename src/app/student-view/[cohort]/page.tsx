import { notFound } from "next/navigation";
import { StudentShell } from "@/components/dashboard/student-shell";
import { AssignmentStatusButton } from "@/components/dashboard/assignment-status-button";
import { CollegePicker } from "@/components/dashboard/college-picker";
import { getLiveCohortBySlug } from "@/lib/live-cohorts";
import { collegesForCohort, isStudentViewCohort } from "@/lib/cohort-data";
import { STUDENT_VIEW_BASE } from "@/lib/public-path";

export const dynamic = "force-dynamic";

export default async function StudentCohortPage({
  params,
}: {
  params: Promise<{ cohort: string }>;
}) {
  const { cohort: cohortSlug } = await params;
  const cohort = await getLiveCohortBySlug(cohortSlug);
  if (!cohort || !isStudentViewCohort(cohort.slug)) notFound();

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
        <div className="flex justify-end">
          <AssignmentStatusButton label={cohort.label} students={cohort.students} />
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
