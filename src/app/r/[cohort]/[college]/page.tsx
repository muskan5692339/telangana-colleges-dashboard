import { redirect } from "next/navigation";
import { studentViewPath } from "@/lib/share";

export default async function LegacyResponderCollegePage({
  params,
}: {
  params: Promise<{ cohort: string; college: string }>;
}) {
  const { cohort, college } = await params;
  redirect(studentViewPath(cohort, college));
}
