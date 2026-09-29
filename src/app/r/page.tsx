import { redirect } from "next/navigation";
import { STUDENT_VIEW_BASE } from "@/lib/public-path";

export default function LegacyResponderHome() {
  redirect(STUDENT_VIEW_BASE);
}
