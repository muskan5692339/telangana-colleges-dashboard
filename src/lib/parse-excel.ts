import * as XLSX from "xlsx";
import { ASSIGNMENT_COLUMNS, type AssignmentStatus, type College, type Student } from "@/lib/types";
import { asHeadcount } from "@/lib/selection";
import { applyTabColors, coloredSheetNames } from "@/lib/xlsx-zip";

export type ParsedWorkbook = {
  colleges: College[];
  students: Student[];
  sheets: string[];
  usedSheets: string[];
  skippedSheets: string[];
};

function norm(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asText(value: unknown) {
  if (value == null) return "";
  return String(value).trim();
}

function asNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const raw = String(value).replace(/%/g, "").replace(/,/g, "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function asPct(value: unknown): number | null {
  const n = asNumber(value);
  if (n == null) return null;
  if (n > 0 && n <= 1) return n * 100;
  return n;
}

function namedCount(text: string): number | null {
  const parts = text
    .split(/[,;\n|]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 1);
  return parts.length >= 2 ? parts.length : null;
}

function pick(row: Record<string, unknown>, aliases: string[]) {
  const keys = Object.keys(row);
  for (const alias of aliases) {
    const want = norm(alias);
    const exact = keys.find((key) => norm(key) === want);
    if (exact) return row[exact];
  }
  for (const alias of aliases) {
    const want = norm(alias);
    if (want.length < 5) continue;
    const partial = keys.find((key) => {
      const have = norm(key);
      return have.includes(want);
    });
    if (partial) return row[partial];
  }
  return undefined;
}

function pickNumeric(row: Record<string, unknown>, aliases: string[]): number | null {
  for (const alias of aliases) {
    const value = pick(row, [alias]);
    const n = asNumber(value);
    if (n != null) return n;
    const listed = namedCount(asText(value));
    if (listed != null) return listed;
  }
  return null;
}

function isRateishKey(key: string) {
  if (key.includes("%")) return true;
  const nk = norm(key);
  return (
    nk.includes("percent") ||
    nk.includes("pct") ||
    nk.includes("ratio") ||
    nk.includes("rate")
  );
}

function pickEnrolled(row: Record<string, unknown>): number {
  return (
    pickNumeric(row, [
      "enrolled",
      "enrollment",
      "no of student",
      "no of students",
      "number of students",
      "total enrolled",
      "total students",
    ]) ?? 0
  );
}

function pickAcceleratorCount(row: Record<string, unknown>, enrolled = 0): number | null {
  const usable = Object.fromEntries(
    Object.entries(row).filter(([key]) => {
      if (isRateishKey(key)) return false;
      const nk = norm(key);
      if (nk.includes("phase")) return false;
      if (nk.includes("intern")) return false;
      return true;
    }),
  );
  const fromAlias = pickNumeric(usable, [
    "accelerator selected",
    "accelerator selection",
    "no of accelerator selected",
    "accelerator count",
    "selected count",
  ]);
  if (fromAlias != null) return asHeadcount(fromAlias, enrolled);

  let best: number | null = null;
  for (const key of Object.keys(usable)) {
    const nk = norm(key);
    if (nk.includes("enroll") || nk.includes("attendance") || nk.includes("email")) continue;
    const relevant =
      nk.includes("accelerator") ||
      nk.includes("accel") ||
      (nk.includes("select") && !nk.includes("deselect") && !nk.includes("phase"));
    if (!relevant) continue;
    const n = asNumber(usable[key]);
    if (n != null) {
      best = Math.max(best ?? 0, n);
      continue;
    }
    const listed = namedCount(asText(usable[key]));
    if (listed != null) best = Math.max(best ?? 0, listed);
  }
  return best == null ? null : asHeadcount(best, enrolled);
}

function parseFlag(value: unknown): boolean {
  const text = asText(value).toLowerCase();
  if (!text) return false;
  if (["no", "n", "false", "0", "none", "na", "n/a", "-"].includes(text)) return false;
  if (text.includes("not selected") || text.includes("unselected") || text.includes("reject")) {
    return false;
  }
  if (
    ["yes", "y", "true", "1", "selected", "select", "accelerator", "final", "ok", "done"].includes(
      text,
    )
  ) {
    return true;
  }
  if (/\bselected\b/.test(text) || /\baccelerator\b/.test(text)) return true;
  return false;
}

function hasMeaningfulFlag(value: unknown) {
  if (value == null || value === "") return false;
  const text = asText(value);
  if (!text) return false;
  const lower = text.toLowerCase();
  return lower !== "n/a" && lower !== "na" && lower !== "-";
}

function flagFromValue(value: unknown): boolean | null {
  if (!hasMeaningfulFlag(value)) return null;
  if (parseFlag(value)) return true;
  const n = asNumber(value);
  if (n === 1) return true;
  if (n != null && n >= 4) return true;
  if (n === 0) return false;
  const text = asText(value).toLowerCase();
  if (["no", "n", "false", "none", "unselected", "not selected"].some((token) => text === token || text.includes(token))) {
    return false;
  }
  return false;
}

const SELECTION_STATUS_ALIASES = [
  "accelerator selected",
  "final selection status",
  "selected for accelerator",
];
const SELECTION_VARIABLE_ALIASES = ["final selection variable"];
/** Final Selection Variable counts the criteria met; only a full score is an accelerator selection. */
const SELECTION_VARIABLE_FULL_SCORE = 4;

function hasSelectionColumn(rows: Record<string, unknown>[]) {
  const sample = rows[0];
  if (!sample) return false;
  return (
    pick(sample, SELECTION_STATUS_ALIASES) !== undefined ||
    pick(sample, SELECTION_VARIABLE_ALIASES) !== undefined
  );
}

/** A present status column is authoritative: a blank cell means not selected. */
function studentAcceleratorFlag(row: Record<string, unknown>): boolean {
  const status = pick(row, SELECTION_STATUS_ALIASES);
  if (status !== undefined) return flagFromValue(status) === true;

  const variable = pick(row, SELECTION_VARIABLE_ALIASES);
  if (variable !== undefined) {
    if (!hasMeaningfulFlag(variable)) return false;
    const n = asNumber(variable);
    return n != null ? n >= SELECTION_VARIABLE_FULL_SCORE : parseFlag(variable);
  }

  const loose = pick(row, ["final selection", "selection status"]);
  return flagFromValue(loose) === true;
}

function parseStatus(value: unknown): AssignmentStatus | null {
  const text = asText(value).toLowerCase();
  if (!text) return null;
  if (text.includes("no submission") || text === "ns" || text.includes("not submitted")) {
    return "no_submission";
  }
  if (text.includes("under review") || text === "review") return "under_review";
  if (text.includes("reject")) return "rejected_with_feedback";
  if (text.includes("feedback") || text.includes("with fb")) return "accepted_with_feedback";
  if (text.includes("accept") || text === "ok" || text === "done") return "accepted";
  return null;
}

function assignmentNumberFromHeader(text: string): number | null {
  const match = norm(text).match(/assignment_?(\d)/);
  if (!match) return null;
  const num = Number(match[1]);
  if (!Number.isInteger(num) || num < 1 || num > ASSIGNMENT_COLUMNS.length) return null;
  return num;
}

function isUnnamedKey(key: string) {
  const nk = norm(key);
  return key.startsWith("__EMPTY") || nk === "empty" || /^empty\d+$/.test(nk) || nk === "";
}

function labelBlankAssignmentHeaders(sheet: XLSX.WorkSheet) {
  const ref = sheet["!ref"];
  if (!ref) return;
  const range = XLSX.utils.decode_range(ref);
  const present = new Set<number>();
  for (let c = range.s.c; c <= range.e.c; c += 1) {
    const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c })];
    const num = assignmentNumberFromHeader(asText(cell?.v ?? ""));
    if (num != null) present.add(num);
  }
  const missing = ASSIGNMENT_COLUMNS.map((_, index) => index + 1).filter((num) => !present.has(num));
  if (missing.length === 0) return;

  for (let c = range.s.c; c <= range.e.c && missing.length > 0; c += 1) {
    const headerAddr = XLSX.utils.encode_cell({ r: range.s.r, c });
    const headerCell = sheet[headerAddr];
    const header = asText(headerCell?.v ?? headerCell?.w ?? "");
    if (header) continue;
    const scanTo = Math.min(range.e.r, range.s.r + 20);
    let statusful = false;
    for (let r = range.s.r + 1; r <= scanTo; r += 1) {
      const value = sheet[XLSX.utils.encode_cell({ r, c })]?.v;
      if (parseStatus(value) != null) {
        statusful = true;
        break;
      }
    }
    if (!statusful) continue;
    const num = missing.shift();
    if (num == null) break;
    const col = ASSIGNMENT_COLUMNS[num - 1];
    if (!col) break;
    sheet[headerAddr] = { t: "s", v: col.label };
  }
}

function fillUnnamedAssignments(row: Record<string, unknown>, assignments: Student["assignments"]) {
  const unnamed = Object.keys(row).filter(
    (key) => isUnnamedKey(key) && parseStatus(row[key]) != null,
  );
  for (const col of ASSIGNMENT_COLUMNS) {
    if (assignments[col.key] != null) continue;
    const key = unnamed.shift();
    if (!key) break;
    assignments[col.key] = parseStatus(row[key]);
  }
}

function isUsablePersonName(value: string, studentCode: string, collegeName: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.toLowerCase() === collegeName.trim().toLowerCase()) return false;
  if (/^\d+$/.test(trimmed) && (!studentCode || trimmed === studentCode)) return false;
  return true;
}

function looksLikeDummyEmail(value: string) {
  const at = value.indexOf("@");
  if (at < 1) return false;
  return value.slice(at + 1).includes(".");
}

function looksLikeCollegeName(value: string) {
  return /mjptbc|tswrdc|ttwrdc|\bcollege\b/i.test(value);
}

function looksLikePassword(value: string) {
  if (!value || looksLikeDummyEmail(value) || looksLikeCollegeName(value) || /\s/.test(value)) {
    return false;
  }
  if (/^vs@/i.test(value)) return true;
  return value.length >= 4 && value.length <= 24 && /[A-Za-z]/.test(value) && /[\d@#$%*&!]/.test(value);
}

function looksLikePersonName(value: string, studentCode: string, collegeName: string) {
  if (!isUsablePersonName(value, studentCode, collegeName)) return false;
  if (looksLikeDummyEmail(value) || looksLikePassword(value) || looksLikeCollegeName(value)) return false;
  return /[A-Za-z]{2,}/.test(value);
}

function cellTexts(row: Record<string, unknown>) {
  return Object.values(row)
    .map((value) => asText(value))
    .filter(Boolean);
}

function inferEnrollmentField(
  row: Record<string, unknown>,
  kind: "email" | "password" | "name" | "college",
  studentCode = "",
  collegeName = "",
) {
  for (const value of cellTexts(row)) {
    if (kind === "email" && looksLikeDummyEmail(value)) return value;
    if (kind === "password" && looksLikePassword(value)) return value;
    if (kind === "college" && looksLikeCollegeName(value)) return value;
    if (kind === "name" && looksLikePersonName(value, studentCode, collegeName)) return value;
  }
  return "";
}

function looksLikeRosterName(value: string) {
  return /^[A-Za-z][A-Za-z0-9 .']+_[A-Za-z]{2,6}$/.test(value.trim());
}

function pickStudentName(row: Record<string, unknown>, studentCode: string, collegeName: string) {
  const preferred = asText(
    pick(row, [
      "name of the student",
      "student name",
      "fellow",
      "full name",
      "leader name",
      "participant",
      "learner",
      "student",
    ]),
  );
  if (isUsablePersonName(preferred, studentCode, collegeName) && !looksLikeCollegeName(preferred)) {
    return preferred;
  }
  const loose = asText(pick(row, ["name"]));
  if (isUsablePersonName(loose, studentCode, collegeName) && !looksLikeCollegeName(loose)) return loose;
  const roster = cellTexts(row).find((value) => looksLikeRosterName(value));
  if (roster) return roster;
  return inferEnrollmentField(row, "name", studentCode, collegeName);
}

function sheetKind(
  name: string,
  rows: Record<string, unknown>[],
): "colleges" | "students" | "unknown" {
  const n = name.toLowerCase();
  const sample = rows[0] ?? {};
  const keys = Object.keys(sample).map(norm);

  const hasEmail = keys.some(
    (key) =>
      key.includes("email") ||
      key === "mail" ||
      key.includes("loginid") ||
      key.includes("userid") ||
      key.includes("dummy"),
  );
  const hasPassword = keys.some(
    (key) => key.includes("password") || key === "pwd" || key === "pass" || key.includes("passwd"),
  );
  const hasStudentCode = keys.some(
    (key) => key.includes("studentcode") || key.includes("studentid") || key === "code",
  );
  const hasAttendance = keys.some((key) => key.includes("attendance"));
  const hasQuiz = keys.some((key) => key.includes("quiz"));
  const hasEnrolled = keys.some((key) => key.includes("enrolled") || key === "enrollment");
  const looksLikeRoster =
    hasEmail ||
    hasStudentCode ||
    hasAttendance ||
    hasQuiz ||
    n.includes("student") ||
    n.includes("phase") ||
    n.includes("roster") ||
    n.includes("performance") ||
    n.includes("otherstudent") ||
    n.includes("enroll");

  if (hasPassword || (hasEmail && n.includes("enroll"))) return "students";
  if (looksLikeRoster && (hasEmail || hasAttendance || hasQuiz || hasStudentCode)) {
    return "students";
  }
  if (looksLikeRoster && !hasEnrolled) return "students";
  if ((n.includes("college") || hasEnrolled) && !hasEmail && !hasAttendance) return "colleges";
  if (looksLikeRoster) return "students";
  if (hasEnrolled || n.includes("college")) return "colleges";
  return "unknown";
}

function rowsFromSheet(sheet: XLSX.WorkSheet) {
  labelBlankAssignmentHeaders(sheet);
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
}

function uniqueCollegeCount(rows: Record<string, unknown>[]) {
  const names = new Set<string>();
  for (const row of rows) {
    const name = asText(
      pick(row, ["name of college", "name of the college", "college name", "college", "campus", "institute"]),
    );
    if (name) names.add(slugify(name));
  }
  return names.size;
}

function aggregateCollegeGroups(rows: Record<string, unknown>[]): College[] {
  const groups = new Map<string, { name: string; enrolled: number; selectedRows: number }>();
  for (const row of rows) {
    const name = asText(
      pick(row, [
        "name of college",
        "name of the college",
        "college name",
        "college",
        "campus",
        "institute",
        "name",
      ]),
    );
    if (!name) continue;
    const slug = slugify(name);
    const enrolled = pickEnrolled(row);
    const current = groups.get(slug) ?? { name, enrolled: 0, selectedRows: 0 };
    current.enrolled = Math.max(current.enrolled, enrolled);
    current.selectedRows += 1;
    groups.set(slug, current);
  }
  return Array.from(groups.entries()).map(([slug, group]) => ({
    slug,
    name: group.name,
    enrolled: group.enrolled,
    acceleratorSelected: Math.max(pickAcceleratorFromGroup(rows, slug), group.selectedRows),
  }));
}

function pickAcceleratorFromGroup(rows: Record<string, unknown>[], slug: string) {
  let best = 0;
  for (const row of rows) {
    const name = asText(
      pick(row, [
        "name of college",
        "name of the college",
        "college name",
        "college",
        "campus",
        "institute",
        "name",
      ]),
    );
    if (slugify(name) !== slug) continue;
    const enrolled = pickEnrolled(row);
    best = Math.max(best, pickAcceleratorCount(row, enrolled) ?? 0);
  }
  return best;
}

function parseColleges(rows: Record<string, unknown>[]): College[] {
  const colleges: College[] = [];
  for (const row of rows) {
    const name = asText(
      pick(row, [
        "name of college",
        "name of the college",
        "college name",
        "college",
        "campus",
        "institute",
        "name",
      ]),
    );
    if (!name) continue;
    const enrolled = pickEnrolled(row);
    const acceleratorSelected = pickAcceleratorCount(row, enrolled) ?? 0;
    colleges.push({
      slug: slugify(name),
      name,
      enrolled,
      acceleratorSelected,
    });
  }
  return mergeColleges([], colleges);
}

function emailLocal(email: string) {
  return email.split("@")[0]?.trim() ?? "";
}

function parseStudents(rows: Record<string, unknown>[], markSelected: boolean): Student[] {
  const students: Student[] = [];
  for (const row of rows) {
    const email =
      asText(
        pick(row, [
          "dummy email",
          "dummy id",
          "allotted email",
          "email",
          "mail",
          "login id",
          "login",
          "userid",
          "user id",
          "username",
        ]),
      ) || inferEnrollmentField(row, "email");
    const loginId =
      asText(
        pick(row, [
          "dummy email",
          "dummy id",
          "allotted email",
          "login id",
          "login",
          "userid",
          "user id",
          "username",
          "app id",
          "email",
          "mail",
        ]),
      ) || email;
    const password =
      asText(pick(row, ["password", "pwd", "pass", "passwd", "passcode", "login password", "app password"])) ||
      inferEnrollmentField(row, "password");
    const phone = asText(pick(row, ["phone", "mobile", "whatsapp", "contact"]));
    const studentCode =
      asText(pick(row, ["student code", "student id", "enrollment no", "enrolment no"])) ||
      (/^\d+$/.test(emailLocal(loginId || email)) ? emailLocal(loginId || email) : "");
    const collegeName =
      asText(
        pick(row, [
          "name of college",
          "name of the college",
          "college name",
          "college",
          "campus",
        ]),
      ) ||
      inferEnrollmentField(row, "college") ||
      "Unassigned college";
    const name = pickStudentName(row, studentCode, collegeName);
    if (!name && !studentCode && !email) continue;

    const roleRaw = asText(pick(row, ["role", "student role"])).toLowerCase();
    const assignments = {} as Student["assignments"];
    for (const col of ASSIGNMENT_COLUMNS) {
      assignments[col.key] = parseStatus(pick(row, [col.label, col.short, col.key, ...col.aliases]));
    }
    if (assignments.careerExperience == null) {
      assignments.careerExperience = parseStatus(pick(row, ["career experience", "career exp", "assignment 2"]));
    }
    if (assignments.swot == null) assignments.swot = parseStatus(pick(row, ["swot", "assignment 3"]));
    if (assignments.careerPlanner == null) {
      assignments.careerPlanner = parseStatus(pick(row, ["career planner", "career panner", "assignment 4"]));
    }
    if (assignments.careerVisionBoard == null) {
      assignments.careerVisionBoard = parseStatus(pick(row, ["vision board", "career vision", "assignment 5"]));
    }
    if (assignments.exploringInternet == null) {
      assignments.exploringInternet = parseStatus(pick(row, ["internet", "exploring"]));
    }
    if (assignments.cvResume == null) {
      assignments.cvResume = parseStatus(pick(row, ["cv", "resume", "assignment 6"]));
    }
    fillUnnamedAssignments(row, assignments);

    const code = studentCode || slugify(name || loginId || email);
    const resolvedEmail = email || loginId || `${code}@sfsvigyanshaala.com`;
    const resolvedLogin = loginId || resolvedEmail;
    students.push({
      studentCode: code,
      name: name || code,
      role: roleRaw.includes("leader") ? "Student leader" : "Student",
      collegeSlug: slugify(collegeName),
      collegeName,
      email: resolvedEmail,
      loginId: resolvedLogin,
      password,
      phone,
      attendancePct: asPct(pick(row, ["attendance", "att %", "attendance %"])),
      quizScore: asNumber(pick(row, ["quiz score", "quiz"])),
      assignmentScore: asNumber(
        pick(row, [
          "assignment / performance",
          "assignment score",
          "assignment set score",
          "assignment set",
          "performance",
        ]),
      ),
      finalScore: asNumber(pick(row, ["final score", "overall", "final", "total"])),
      acceleratorSelected: markSelected || studentAcceleratorFlag(row),
      assignments,
    });
  }
  return students;
}

function mergeColleges(existing: College[], incoming: College[]): College[] {
  const bySlug = new Map(existing.map((college) => [college.slug, { ...college }]));
  for (const college of incoming) {
    const current = bySlug.get(college.slug);
    if (!current) {
      bySlug.set(college.slug, { ...college });
      continue;
    }
    current.name = current.name || college.name;
    current.enrolled = Math.max(current.enrolled, college.enrolled);
    current.acceleratorSelected = asHeadcount(
      Math.max(current.acceleratorSelected, college.acceleratorSelected),
      current.enrolled,
    );
  }
  return Array.from(bySlug.values());
}

function preferNumber(a: number | null, b: number | null) {
  if (a != null && b != null) return b;
  return b ?? a;
}

function mergeStudents(existing: Student[], incoming: Student[]): Student[] {
  const byKey = new Map<string, Student>();

  function keyFor(student: Student) {
    const local = emailLocal(student.email).toLowerCase();
    if (/^\d+$/.test(local)) return `${student.collegeSlug}::${local}`;
    if (/^\d+$/.test(student.studentCode)) return `${student.collegeSlug}::${student.studentCode}`;
    return `${student.collegeSlug}::${student.email.toLowerCase()}::${slugify(student.name)}`;
  }

  function put(student: Student) {
    const key = keyFor(student);
    const current = byKey.get(key);
    if (!current) {
      byKey.set(key, { ...student, assignments: { ...student.assignments } });
      return;
    }
    const nameIsCollege =
      current.name.trim().toLowerCase() === current.collegeName.trim().toLowerCase();
    const nameIsCode = /^\d+$/.test(current.name.trim()) && current.name.trim() === current.studentCode;
    const incomingLooksReal =
      Boolean(student.name.trim()) &&
      student.name.trim().toLowerCase() !== student.collegeName.trim().toLowerCase() &&
      !(/^\d+$/.test(student.name.trim()) && student.name.trim() === student.studentCode);
    byKey.set(key, {
      ...current,
      name:
        (nameIsCollege || nameIsCode) && incomingLooksReal
          ? student.name
          : current.name || student.name,
      studentCode: /^\d+$/.test(student.studentCode) ? student.studentCode : current.studentCode,
      email: student.email.includes("@") ? student.email : current.email,
      loginId: student.loginId || current.loginId,
      password: student.password || current.password,
      phone: student.phone || current.phone,
      role: student.role === "Student leader" ? student.role : current.role,
      attendancePct: preferNumber(current.attendancePct, student.attendancePct),
      quizScore: preferNumber(current.quizScore, student.quizScore),
      assignmentScore: preferNumber(current.assignmentScore, student.assignmentScore),
      finalScore: preferNumber(current.finalScore, student.finalScore),
      acceleratorSelected: current.acceleratorSelected || student.acceleratorSelected,
      assignments: {
        exploringInternet: student.assignments.exploringInternet ?? current.assignments.exploringInternet,
        careerExperience: student.assignments.careerExperience ?? current.assignments.careerExperience,
        swot: student.assignments.swot ?? current.assignments.swot,
        careerPlanner: student.assignments.careerPlanner ?? current.assignments.careerPlanner,
        careerVisionBoard: student.assignments.careerVisionBoard ?? current.assignments.careerVisionBoard,
        cvResume: student.assignments.cvResume ?? current.assignments.cvResume,
      },
    });
  }

  existing.forEach(put);
  incoming.forEach(put);
  return Array.from(byKey.values());
}

function collegesFromStudents(
  students: Student[],
  existing: College[],
  addMissing = true,
  countFromStudents = false,
): College[] {
  const bySlug = new Map(existing.map((college) => [college.slug, { ...college }]));
  for (const student of students) {
    if (bySlug.has(student.collegeSlug) || !addMissing) continue;
    bySlug.set(student.collegeSlug, {
      slug: student.collegeSlug,
      name: student.collegeName,
      enrolled: 0,
      acceleratorSelected: 0,
    });
  }
  for (const college of bySlug.values()) {
    const atCollege = students.filter((student) => student.collegeSlug === college.slug);
    const flagged = atCollege.filter((student) => student.acceleratorSelected).length;
    if (college.enrolled === 0 && atCollege.length > 0) {
      college.enrolled = atCollege.length;
    }
    if (countFromStudents) {
      college.acceleratorSelected = flagged;
      continue;
    }
    college.acceleratorSelected = asHeadcount(
      Math.max(college.acceleratorSelected, flagged),
      college.enrolled || atCollege.length,
    );
  }
  return Array.from(bySlug.values());
}

function isSelectionRoster(name: string) {
  const n = name.toLowerCase();
  if (
    n.includes("phase") ||
    n.includes("performance") ||
    n.includes("enroll") ||
    n.includes("roster") ||
    n.includes("student wise")
  ) {
    return false;
  }
  return n.includes("select");
}

export function parseWorkbook(buffer: ArrayBuffer | Buffer): ParsedWorkbook {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const workbook = XLSX.read(buf, { type: "buffer" });
  const allSheets = workbook.SheetNames;
  const colored = coloredSheetNames(buf);
  const sheets = colored.length > 0 ? allSheets.filter((name) => colored.includes(name)) : allSheets;
  const skippedSheets =
    colored.length > 0 ? allSheets.filter((name) => !colored.includes(name)) : [];
  let colleges: College[] = [];
  let students: Student[] = [];
  const usedSheets: string[] = [];
  let hadCollegeSheet = false;
  let rosterHasSelection = false;

  for (const name of sheets) {
    const rows = rowsFromSheet(workbook.Sheets[name]);
    if (rows.length === 0) continue;
    const kind = sheetKind(name, rows);
    if (kind === "colleges") {
      const unique = uniqueCollegeCount(rows);
      const expandedSelection = unique > 0 && rows.length >= unique * 2;
      if (expandedSelection) {
        colleges = mergeColleges(colleges, aggregateCollegeGroups(rows));
        students = mergeStudents(students, parseStudents(rows, true));
      } else {
        colleges = mergeColleges(colleges, parseColleges(rows));
      }
      hadCollegeSheet = true;
      usedSheets.push(name);
    } else if (kind === "students") {
      const selectionRoster = isSelectionRoster(name);
      if (!selectionRoster && hasSelectionColumn(rows)) rosterHasSelection = true;
      students = mergeStudents(students, parseStudents(rows, selectionRoster));
      usedSheets.push(name);
    }
  }

  if (colleges.length === 0 && students.length === 0 && sheets[0]) {
    const rows = rowsFromSheet(workbook.Sheets[sheets[0]]);
    students = parseStudents(rows, false);
    colleges = parseColleges(rows);
    if (students.length || colleges.length) usedSheets.push(sheets[0]);
  }

  if (students.length > 0 || colleges.length > 0) {
    colleges = collegesFromStudents(students, colleges, !hadCollegeSheet, rosterHasSelection);
  }

  return { colleges, students, sheets: allSheets, usedSheets, skippedSheets };
}

export function buildTemplateWorkbook() {
  const colleges = [
    ["College", "Enrolled", "Accelerator selected"],
    ["MJPTBC Adilabad", 35, 1],
    ["MJPTBC Jogulamba Gadwal", 50, 0],
    ["TSWRDCW Kamareddy", 39, 1],
  ];
  const students = [
    [
      "Student Code",
      "Name of the Student",
      "Student Role",
      "College",
      "Email",
      "Attendance %",
      "Quiz Score",
      "Assignment Score",
      "Final Score",
      "Accelerator selected",
      "Assignment_1 Exploring_Internet_&_AI",
      "Assignment2_Career_Exploration",
      "Assignment3_SWOT",
      "Assignment_4_Career_Panner",
      "Assignment_5_Career_Vision_Board",
      "Assignment_6_CV_Resume",
    ],
    [
      "13181",
      "Amuya",
      "Student",
      "MJPTBC Adilabad",
      "13181@vigyanshaala.com",
      39,
      5,
      20,
      50,
      "No",
      "Accepted",
      "Accepted",
      "Rejected with Feedback",
      "Under Review",
      "Accepted",
      "Rejected with Feedback",
    ],
    [
      "13197",
      "Sanjana",
      "Student leader",
      "MJPTBC Adilabad",
      "13197@vigyanshaala.com",
      39,
      10,
      25,
      68,
      "Yes",
      "Accepted",
      "Accepted",
      "Rejected with Feedback",
      "Accepted",
      "Accepted",
      "Accepted",
    ],
    [
      "14153",
      "Keerthana",
      "Student",
      "TSWRDCW Kamareddy",
      "14153@vigyanshaala.com",
      89,
      9.3,
      30,
      72.3,
      "Yes",
      "Accepted",
      "Accepted",
      "Accepted",
      "Accepted",
      "Accepted",
      "Accepted",
    ],
    [
      "14166",
      "Sravani",
      "Student",
      "TSWRDCW Kamareddy",
      "14166@vigyanshaala.com",
      86,
      8.8,
      23.3,
      64.1,
      "No",
      "Accepted",
      "Rejected with Feedback",
      "Accepted",
      "Under Review",
      "Accepted",
      "Rejected with Feedback",
    ],
  ];
  const enrollment = [
    ["Dummy email", "Password", "Name", "College"],
    ["19850@sfsvigyanshaala.com", "VS@123", "A SADHANA_BZC", "MJPTBC Adilabad"],
    ["19851@sfsvigyanshaala.com", "VS@123", "ADE ANJALI_MSCs", "MJPTBC Adilabad"],
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(colleges), "Collegewise_Final Selection");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(students), "Student Wise - Phase 2");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(enrollment), "Student Enrollment");
  const raw = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return applyTabColors(raw, [
    "Collegewise_Final Selection",
    "Student Wise - Phase 2",
    "Student Enrollment",
  ]);
}
