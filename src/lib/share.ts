import { STUDENT_VIEW_BASE } from "@/lib/public-path";

export function publicAppOrigin() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prod) return `https://${prod}`;
  return "https://telangana-colleges-dashboard.vercel.app";
}

export function studentViewPath(cohortSlug?: string, collegeSlug?: string) {
  if (cohortSlug && collegeSlug) return `${STUDENT_VIEW_BASE}/${cohortSlug}/${collegeSlug}`;
  if (cohortSlug) return `${STUDENT_VIEW_BASE}/${cohortSlug}`;
  return STUDENT_VIEW_BASE;
}

export function studentViewUrl(cohortSlug?: string, collegeSlug?: string) {
  return `${publicAppOrigin()}${studentViewPath(cohortSlug, collegeSlug)}`;
}

export function responderPath(cohortSlug: string, collegeSlug: string) {
  return studentViewPath(cohortSlug, collegeSlug);
}

export function responderUrl(cohortSlug: string, collegeSlug: string) {
  return studentViewUrl(cohortSlug, collegeSlug);
}
