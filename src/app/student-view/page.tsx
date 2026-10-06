import { StudentShell } from "@/components/dashboard/student-shell";
import { StudentViewPicker, type StudentViewCard } from "@/components/dashboard/student-view-picker";
import { cohortsInSelectionOrder } from "@/lib/cohort-data";
import { listLiveCohorts } from "@/lib/live-cohorts";

export const dynamic = "force-dynamic";

export default async function StudentViewHomePage() {
  const cards: StudentViewCard[] = cohortsInSelectionOrder(await listLiveCohorts()).map((cohort) => ({
    slug: cohort.slug,
    label: cohort.label,
    kind: cohort.kind,
    collegeCount: cohort.colleges.length,
  }));

  return (
    <StudentShell
      title="Student view"
      subtitle="No login. Close a batch with the X. Add it back from the plus menu. Old batch stays on the left."
    >
      <StudentViewPicker cards={cards} />
    </StudentShell>
  );
}
