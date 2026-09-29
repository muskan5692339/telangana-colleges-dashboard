import { redirect } from "next/navigation";
import { studentViewPath } from "@/lib/share";

export default async function LegacyResponderCohortPage({
  params,
}: {
  params: Promise<{ cohort: string }>;
}) {
  const { cohort } = await params;
  redirect(studentViewPath(cohort));
}
