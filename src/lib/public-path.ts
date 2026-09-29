export const STUDENT_VIEW_BASE = "/student-view";

export function isPublicPath(pathname: string) {
  if (pathname === "/login") return true;
  if (pathname === STUDENT_VIEW_BASE || pathname.startsWith(`${STUDENT_VIEW_BASE}/`)) return true;
  if (pathname === "/r" || pathname.startsWith("/r/")) return true;
  return false;
}
