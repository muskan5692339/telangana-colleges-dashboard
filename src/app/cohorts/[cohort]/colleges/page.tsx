import { OpenCohortPage } from "../open-cohort";

export const dynamic = "force-dynamic";

export default async function CollegeSelectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ cohort: string }>;
  searchParams: Promise<{ college?: string }>;
}) {
  const { cohort } = await params;
  const { college } = await searchParams;
  return <OpenCohortPage cohortSlug={cohort} collegeSlug={college} />;
}
