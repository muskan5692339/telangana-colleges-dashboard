import {
  DEFAULT_ENROLLMENT_PASSWORD,
  enrollmentRosterName,
  type Batch,
  type BatchId,
  type ChangeRequest,
  type College,
  type CohortSlug,
  type Student,
} from "@/lib/types";
import { enrollmentNameFromDummyEmail, isSyntheticTestEnrollment } from "@/lib/inc13-roster";
import { asHeadcount } from "@/lib/selection";

export type LiveBatchOverlay = {
  colleges: College[];
  students: Student[];
  sourceSheet: string;
  importedSheets: string[];
};

export type UploadRecord = {
  cohortSlug: CohortSlug;
  batchId: BatchId;
  fileName: string;
  sheets: string[];
  collegeCount: number;
  studentCount: number;
  uploadedAt: string;
};

export type LiveStore = {
  updatedAt: string | null;
  uploads: UploadRecord[];
  batches: Partial<Record<BatchId, LiveBatchOverlay>>;
  requests: ChangeRequest[];
};

export const EMPTY_STORE: LiveStore = {
  updatedAt: null,
  uploads: [],
  batches: {},
  requests: [],
};

function coerceCollege(college: College): College {
  return {
    ...college,
    enrolled: Number.isFinite(college.enrolled) ? college.enrolled : 0,
    acceleratorSelected: asHeadcount(college.acceleratorSelected, college.enrolled),
  };
}

function coerceStudent(student: Batch["students"][number], seedName?: string): Batch["students"][number] {
  const codeFromEmail = student.email.split("@")[0]?.trim() ?? "";
  const nameIsCollege =
    student.name.trim().toLowerCase() === student.collegeName.trim().toLowerCase() ||
    student.studentCode === student.collegeSlug;
  const numericEmail = /^\d+$/.test(codeFromEmail);
  const numericName = /^\d+$/.test(student.name.trim());
  const assignments = student.assignments ?? {
    exploringInternet: null,
    careerExperience: null,
    swot: null,
    careerPlanner: null,
    careerVisionBoard: null,
    cvResume: null,
  };
  const loginId = student.loginId || student.email || "";
  const enrollment = loginId.toLowerCase().includes("sfsvigyanshaala.com");
  let name = nameIsCollege && numericEmail ? codeFromEmail : student.name;
  const rosterName =
    enrollmentNameFromDummyEmail(loginId) ||
    enrollmentNameFromDummyEmail(student.email) ||
    enrollmentNameFromDummyEmail(student.studentCode);
  if (numericName && rosterName) {
    name = rosterName;
  } else if (numericName && seedName && !/^\d+$/.test(seedName.trim())) {
    name = seedName;
  }
  if (enrollment) name = enrollmentRosterName(name);
  return {
    ...student,
    acceleratorSelected: Boolean(student.acceleratorSelected),
    studentCode: nameIsCollege && numericEmail ? codeFromEmail : student.studentCode,
    name,
    loginId,
    password: student.password || (enrollment ? DEFAULT_ENROLLMENT_PASSWORD : ""),
    phone: student.phone ?? "",
    assignments: {
      exploringInternet: assignments.exploringInternet ?? null,
      careerExperience: assignments.careerExperience ?? null,
      swot: assignments.swot ?? null,
      careerPlanner: assignments.careerPlanner ?? null,
      careerVisionBoard: assignments.careerVisionBoard ?? null,
      cvResume: assignments.cvResume ?? null,
    },
  };
}

export function overlayBatch(seed: Batch, overlay?: LiveBatchOverlay): Batch {
  if (!overlay) return seed;
  const seedByCode = new Map(seed.students.map((student) => [student.studentCode, student.name]));
  const students = overlay.students
    .filter((student) => !isSyntheticTestEnrollment(student))
    .map((student) => coerceStudent(student, seedByCode.get(student.studentCode)));
  const enrolledBySlug = new Map<string, number>();
  for (const student of students) {
    enrolledBySlug.set(student.collegeSlug, (enrolledBySlug.get(student.collegeSlug) ?? 0) + 1);
  }
  const colleges = overlay.colleges.map((college) => {
    if (seed.kind !== "enrollment") return coerceCollege(college);
    return coerceCollege({
      ...college,
      enrolled: enrolledBySlug.get(college.slug) ?? 0,
    });
  });
  return {
    ...seed,
    colleges,
    students,
    sourceSheet: overlay.sourceSheet || seed.sourceSheet,
    importedSheets: overlay.importedSheets.length ? overlay.importedSheets : seed.importedSheets,
  };
}
