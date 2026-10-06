import { StudentShell } from "@/components/dashboard/student-shell";
import { CohortCards } from "@/components/dashboard/cohort-cards";
import { cohortsForStudentView } from "@/lib/cohort-data";
import { listLiveCohorts } from "@/lib/live-cohorts";
import { STUDENT_VIEW_BASE } from "@/lib/public-path";

export const dynamic = "force-dynamic";

export default async function StudentViewHomePage() {
  const cohorts = cohortsForStudentView(await listLiveCohorts());

  return (
    <StudentShell
      title="Student view"
      subtitle="No login. Open the current batch for your college, dummy email, and password."
    >
      <CohortCards cohorts={cohorts} hrefBase={STUDENT_VIEW_BASE} />
    </StudentShell>
  );
}
