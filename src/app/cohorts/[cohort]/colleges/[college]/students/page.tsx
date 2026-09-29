import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CollegeStudentsPage({
  params,
}: {
  params: Promise<{ cohort: string; college: string }>;
}) {
  const { cohort, college } = await params;
  redirect(`/cohorts/${cohort}/colleges/${college}`);
}
