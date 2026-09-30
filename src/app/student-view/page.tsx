import { StudentShell } from "@/components/dashboard/student-shell";
import { CohortCards } from "@/components/dashboard/cohort-cards";
import { cohortsInSelectionOrder } from "@/lib/cohort-data";
import { listLiveCohorts } from "@/lib/live-cohorts";
import { STUDENT_VIEW_BASE } from "@/lib/public-path";

export const dynamic = "force-dynamic";

export default async function StudentViewHomePage() {
  const cohorts = cohortsInSelectionOrder(await listLiveCohorts());

  return (
    <StudentShell
      title="Student view"
      subtitle="No login. Old batch is on the left. Current batch is on the right, for dummy email and password."
    >
      <CohortCards cohorts={cohorts} hrefBase={STUDENT_VIEW_BASE} />
    </StudentShell>
  );
}
