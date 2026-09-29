import { StudentShell } from "@/components/dashboard/student-shell";
import { CohortCards } from "@/components/dashboard/cohort-cards";
import { listLiveCohorts } from "@/lib/live-cohorts";
import { STUDENT_VIEW_BASE } from "@/lib/public-path";

export const dynamic = "force-dynamic";

export default async function StudentViewHomePage() {
  const cohorts = await listLiveCohorts();
  const studentFirst = [...cohorts].sort((left, right) =>
    left.kind === "enrollment" ? -1 : right.kind === "enrollment" ? 1 : 0,
  );

  return (
    <StudentShell
      title="Student view"
      subtitle="No login. Open 2nd Year : New Batch for dummy email and password, or 3rd Year : Old Batch for the college sheet."
    >
      <CohortCards cohorts={studentFirst} hrefBase={STUDENT_VIEW_BASE} />
    </StudentShell>
  );
}
