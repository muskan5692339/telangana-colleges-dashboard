import names from "./inc13-enrollment-names.json";
import collegeCounts from "./inc13-college-counts.json";

const roster = names as Record<string, string>;

export const INC13_SOURCE_ENROLLMENT_COUNT = 2331;
export const INC13_DUMMY_EMAIL_DOMAIN = "sfsvigyanshaala.com";
export const INC13_ADILABAD_SLUG = "mjptbc-adilabad";
export const INC13_ADILABAD_SOURCE_COUNT = 45;

export const INC13_COLLEGE_COUNTS = collegeCounts as Record<
  string,
  { name: string; enrolled: number }
>;

export function dummyEmailFromCode(code: string) {
  return `${code.trim()}@${INC13_DUMMY_EMAIL_DOMAIN}`;
}

export function enrollmentNameFromDummyEmail(emailOrCode: string): string | undefined {
  const raw = emailOrCode.trim().toLowerCase();
  if (!raw) return undefined;
  if (raw.includes("@")) return roster[raw];
  return roster[dummyEmailFromCode(raw).toLowerCase()];
}

export function isSourceInc13Email(emailOrCode: string) {
  return Boolean(enrollmentNameFromDummyEmail(emailOrCode));
}

/** Browser-test fixtures that must never appear as Excel enrollment rows. */
export function isSyntheticTestEnrollment(student: {
  name?: string;
  studentCode?: string;
  email?: string;
  loginId?: string;
}) {
  const code = (student.studentCode || "").trim();
  const email = (student.loginId || student.email || "").trim().toLowerCase();
  const local = email.split("@")[0] || "";
  if (code === "29998" || code === "29999" || local === "29998" || local === "29999") return true;
  return /^(test|demo)\s+student\b/i.test((student.name || "").trim());
}

export function sourceInc13Emails() {
  return Object.keys(roster);
}
