import { notFound } from "next/navigation";
import { StudentCollegeScreen } from "@/components/dashboard/student-college-screen";
import { getLiveCohortBySlug } from "@/lib/live-cohorts";
import { getCollege, isStudentViewCohort } from "@/lib/cohort-data";

export const dynamic = "force-dynamic";

export default async function StudentCollegePage({
  params,
}: {
  params: Promise<{ cohort: string; college: string }>;
}) {
  const { cohort: cohortSlug, college: collegeSlug } = await params;
  const cohort = await getLiveCohortBySlug(cohortSlug);
  if (!cohort || !isStudentViewCohort(cohort.slug)) notFound();
  if (!getCollege(cohort, collegeSlug)) notFound();

  return <StudentCollegeScreen cohort={cohort} collegeSlug={collegeSlug} />;
}
