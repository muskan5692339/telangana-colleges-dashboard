import type { AssignmentStatus, Batch, College, Student } from "@/lib/types";
import { DEFAULT_ENROLLMENT_PASSWORD } from "@/lib/types";
import { enrollmentNameFromDummyEmail, INC13_COLLEGE_COUNTS } from "@/lib/inc13-roster";
import inc10Colleges from "@/lib/inc10-colleges.json";
import { asHeadcount, selectionPct } from "@/lib/selection";

const A = {
  ok: "accepted" as AssignmentStatus,
  feedback: "accepted_with_feedback" as AssignmentStatus,
  rejected: "rejected_with_feedback" as AssignmentStatus,
  none: "no_submission" as AssignmentStatus,
};

const INC10_COLLEGES: College[] = inc10Colleges as College[];

function inc10Student(
  studentCode: string,
  name: string,
  role: Student["role"],
  attendancePct: number,
  quizScore: number,
  assignmentScore: number,
  finalScore: number,
  assignments: Partial<Student["assignments"]>,
  acceleratorSelected = false,
): Student {
  return {
    studentCode,
    name,
    role,
    collegeSlug: "mjptbc-adilabad",
    collegeName: "MJPTBC Adilabad",
    email: `${studentCode}@vigyanshaala.com`,
    loginId: `${studentCode}@vigyanshaala.com`,
    password: "",
    phone: "",
    attendancePct,
    quizScore,
    assignmentScore,
    finalScore,
    acceleratorSelected,
    assignments: {
      exploringInternet: null,
      careerExperience: null,
      swot: null,
      careerPlanner: null,
      careerVisionBoard: null,
      cvResume: null,
      ...assignments,
    },
  };
}

const INC10_STUDENTS: Student[] = [
  inc10Student("13181", "Amuya", "Student", 39, 5, 20, 50, {
    careerExperience: A.ok,
    swot: A.rejected,
    careerVisionBoard: A.ok,
    exploringInternet: A.ok,
    cvResume: A.rejected,
  }),
  inc10Student("13182", "Anvika", "Student", 39, 5, 20, 50, {
    careerExperience: A.ok,
    swot: A.ok,
    careerVisionBoard: A.ok,
    exploringInternet: A.feedback,
    cvResume: A.ok,
  }),
  inc10Student("13183", "Archa", "Student", 39, 5, 20, 50, {
    careerExperience: A.ok,
    swot: A.ok,
    careerVisionBoard: A.ok,
    exploringInternet: A.feedback,
    cvResume: A.ok,
  }),
  inc10Student("13184", "Bakhila", "Student", 39, 15, 7.5, 25, {
    careerExperience: A.rejected,
    swot: A.ok,
    careerVisionBoard: A.none,
    exploringInternet: A.ok,
    cvResume: A.ok,
  }),
  inc10Student("13185", "Anamika", "Student", 39, 5, 20, 75, {
    careerExperience: A.ok,
    swot: A.ok,
    careerVisionBoard: A.ok,
    exploringInternet: A.feedback,
    cvResume: A.ok,
  }),
  inc10Student("13186", "Saipriya", "Student", 39, 5, 20, 75, {
    careerExperience: A.ok,
    swot: A.ok,
    careerVisionBoard: A.ok,
    exploringInternet: A.none,
    cvResume: A.ok,
  }),
  inc10Student("13187", "Sindha", "Student", 33, 5, 10, 25, {
    careerExperience: A.rejected,
    swot: A.ok,
    careerVisionBoard: A.none,
    exploringInternet: A.feedback,
    cvResume: A.rejected,
  }),
  inc10Student("13189", "Srenitha", "Student", 39, 10, 15, 68, {
    careerExperience: A.ok,
    swot: A.none,
    careerVisionBoard: A.none,
    exploringInternet: A.ok,
    cvResume: A.ok,
  }),
  inc10Student("13190", "Vaishali", "Student", 39, 10, 25, 75, {
    careerExperience: A.ok,
    swot: A.rejected,
    careerVisionBoard: A.ok,
    exploringInternet: A.ok,
    cvResume: A.feedback,
  }),
  inc10Student("13191", "Laxmi", "Student", 39, 10, 22.5, 75, {
    careerExperience: A.ok,
    swot: A.none,
    careerVisionBoard: A.ok,
    exploringInternet: A.ok,
    cvResume: A.feedback,
  }),
  inc10Student("13192", "Savithri", "Student", 39, 10, 25, 68, {
    careerExperience: A.ok,
    swot: A.none,
    careerVisionBoard: A.ok,
    exploringInternet: A.ok,
    cvResume: A.ok,
  }),
  inc10Student("13193", "Sowmya", "Student", 39, 10, 22.5, 65, {
    careerExperience: A.ok,
    swot: A.none,
    careerVisionBoard: A.ok,
    exploringInternet: A.ok,
    cvResume: A.ok,
  }),
  inc10Student("13194", "Deena Rechal", "Student", 39, 10, 22.5, 65, {
    careerExperience: A.rejected,
    swot: A.ok,
    careerVisionBoard: A.ok,
    exploringInternet: A.feedback,
    cvResume: A.ok,
  }),
  inc10Student("13195", "Dhanusha", "Student", 39, 10, 25, 68, {
    careerExperience: A.ok,
    swot: A.ok,
    careerVisionBoard: A.ok,
    exploringInternet: A.ok,
    cvResume: A.ok,
  }),
  inc10Student("13196", "Sakshi", "Student", 39, 5, 20, 61, {
    careerExperience: A.ok,
    swot: A.feedback,
    careerVisionBoard: A.ok,
    exploringInternet: A.ok,
    cvResume: A.ok,
  }),
  inc10Student(
    "13197",
    "Sanjana",
    "Student leader",
    39,
    10,
    25,
    68,
    {
      careerExperience: A.ok,
      swot: A.rejected,
      careerVisionBoard: A.ok,
      exploringInternet: A.ok,
      cvResume: A.ok,
    },
    true,
  ),
  inc10Student("15754", "Srinidhi", "Student", 33, 10, 25, 61, {
    careerExperience: A.rejected,
    swot: A.none,
    careerVisionBoard: A.none,
    exploringInternet: A.rejected,
    cvResume: A.none,
  }),
  inc10Student("15755", "Srivani", "Student", 33, 10, 20, 58, {
    careerExperience: A.rejected,
    swot: A.none,
    careerVisionBoard: A.feedback,
    exploringInternet: A.feedback,
    cvResume: A.feedback,
  }),
  inc10Student("13199", "Trisha", "Student", 39, 5, 18, 38, {
    careerExperience: A.none,
    swot: A.none,
    careerVisionBoard: A.ok,
    exploringInternet: A.none,
    cvResume: A.none,
  }),
  inc10Student("13200", "Nikhitha", "Student", 33, 0, 0, 38, {
    careerExperience: A.rejected,
    swot: A.none,
    careerVisionBoard: A.ok,
    exploringInternet: A.feedback,
    cvResume: A.feedback,
  }),
  inc10Student("13201", "Anikitha", "Student", 39, 10, 27.5, 75, {
    careerExperience: A.ok,
    swot: A.ok,
    careerVisionBoard: A.ok,
    exploringInternet: A.ok,
    cvResume: A.feedback,
  }),
  inc10Student("13202", "Nikitha", "Student", 39, 5, 20, 70, {
    careerExperience: A.feedback,
    swot: A.ok,
    careerVisionBoard: A.ok,
    exploringInternet: A.ok,
    cvResume: A.feedback,
  }),
  inc10Student("13203", "Vennela", "Student", 39, 10, 25, 75, {
    careerExperience: A.ok,
    swot: A.ok,
    careerVisionBoard: A.ok,
    exploringInternet: A.ok,
    cvResume: A.feedback,
  }),
  inc10Student("13204", "Malleshwari", "Student", 39, 10, 25, 70, {
    careerExperience: A.ok,
    swot: A.none,
    careerVisionBoard: A.ok,
    exploringInternet: A.ok,
    cvResume: A.feedback,
  }),
];

const emptyAssignments: Student["assignments"] = {
  exploringInternet: null,
  careerExperience: null,
  swot: null,
  careerPlanner: null,
  careerVisionBoard: null,
  cvResume: null,
};

const INC13_ENROLLMENT: { code: string; name: string }[] = Array.from({ length: 45 }, (_, index) => {
  const code = String(19850 + index);
  return { code, name: enrollmentNameFromDummyEmail(code) ?? code };
});

const INC13_STUDENTS: Student[] = INC13_ENROLLMENT.map((row) => ({
  studentCode: row.code,
  name: row.name,
  role: "Student",
  collegeSlug: "mjptbc-adilabad",
  collegeName: "MJPTBC Adilabad",
  email: `${row.code}@sfsvigyanshaala.com`,
  loginId: `${row.code}@sfsvigyanshaala.com`,
  password: DEFAULT_ENROLLMENT_PASSWORD,
  phone: "",
  attendancePct: null,
  quizScore: null,
  assignmentScore: null,
  finalScore: null,
  assignments: { ...emptyAssignments },
  acceleratorSelected: false,
}));

const INC13_COLLEGES: College[] = Object.entries(INC13_COLLEGE_COUNTS).map(([slug, row]) => ({
  slug,
  name: row.name,
  enrolled: row.enrolled,
  acceleratorSelected: 0,
}));

export const BATCHES: Record<Batch["id"], Batch> = {
  inc10: {
    id: "inc10",
    slug: "3rd-year-old-batch",
    label: "3rd Year : Old Batch",
    shortLabel: "3rd Year : Old Batch",
    period: "Telangana college cohort",
    kind: "monitoring",
    sourceSheet: "Inc10.0_Student_Facing_Monitoring.xlsx",
    importedSheets: ["College-wise selection", "Student Wise - Phase 2"],
    colleges: INC10_COLLEGES,
    students: INC10_STUDENTS,
  },
  inc13: {
    id: "inc13",
    slug: "2nd-year-new-batch",
    label: "2nd Year : New Batch",
    shortLabel: "2nd Year : New Batch",
    period: "Telangana college cohort",
    kind: "enrollment",
    appUrl: "https://mytribe.vigyanshaala.com",
    sourceSheet: "Inc13_Student Enrollment.xlsx",
    importedSheets: ["Student Enrollment"],
    colleges: INC13_COLLEGES,
    students: INC13_STUDENTS,
  },
};

export const DEFAULT_BATCH: Batch["id"] = "inc10";

export function isBatchId(value: string | null | undefined): value is Batch["id"] {
  return value === "inc10" || value === "inc13";
}

export function getBatch(id: string | null | undefined): Batch {
  return isBatchId(id) ? BATCHES[id] : BATCHES[DEFAULT_BATCH];
}

export function listCohorts(): Batch[] {
  return Object.values(BATCHES);
}

export function isCohortSlug(value: string | null | undefined): value is Batch["slug"] {
  return listCohorts().some((cohort) => cohort.slug === value);
}

export function getCohortBySlug(slug: string | null | undefined): Batch | null {
  if (!slug) return null;
  return listCohorts().find((cohort) => cohort.slug === slug) ?? null;
}

export function collegesForCohort(cohort: Batch) {
  return cohort.colleges;
}

export function getCollege(cohort: Batch, collegeSlug: string | null | undefined) {
  if (!collegeSlug) return null;
  return collegesForCohort(cohort).find((college) => college.slug === collegeSlug) ?? null;
}

export function studentsForCollege(cohort: Batch, collegeSlug: string) {
  return cohort.students.filter((student) => student.collegeSlug === collegeSlug);
}

export function acceleratorSelectedCount(college: College, students: Student[]) {
  const flagged = students.filter((student) => student.acceleratorSelected).length;
  return asHeadcount(Math.max(college.acceleratorSelected, flagged), college.enrolled);
}

export function collegeSelectionPct(college: College, students: Student[]) {
  return selectionPct(acceleratorSelectedCount(college, students), college.enrolled);
}

export function overallStatus(student: Student): AssignmentStatus | null {
  const values = Object.values(student.assignments);
  if (values.every((value) => value == null)) return null;
  if (values.includes("no_submission")) return "no_submission";
  if (values.includes("rejected_with_feedback")) return "rejected_with_feedback";
  if (values.includes("under_review")) return "under_review";
  if (values.includes("accepted_with_feedback")) return "accepted_with_feedback";
  if (values.every((value) => value === "accepted")) return "accepted";
  return "accepted_with_feedback";
}

export function batchStats(batch: Batch) {
  const enrolled = batch.colleges.reduce((sum, college) => sum + college.enrolled, 0);
  const acceleratorSelected = batch.colleges.reduce(
    (sum, college) =>
      sum + asHeadcount(college.acceleratorSelected, college.enrolled),
    0,
  );
  const tracked = batch.students.length;
  const leaders = batch.students.filter((s) => s.role === "Student leader").length;
  const scored = batch.students.filter((s) => s.finalScore != null);
  const avgAttendance = average(batch.students.map((s) => s.attendancePct));
  const avgFinal = average(scored.map((s) => s.finalScore));
  const noSubmission = countStatus(batch, "no_submission");
  const rejected = countStatus(batch, "rejected_with_feedback");
  const collegesWithZeroSelection = batch.colleges.filter(
    (c) => asHeadcount(c.acceleratorSelected, c.enrolled) === 0,
  ).length;

  return {
    enrolled,
    acceleratorSelected,
    tracked,
    leaders,
    avgAttendance,
    avgFinal,
    noSubmission,
    rejected,
    collegeCount: batch.colleges.length,
    collegesWithZeroSelection,
    selectionRate: enrolled === 0 ? 0 : (acceleratorSelected / enrolled) * 100,
  };
}

function average(values: Array<number | null | undefined>) {
  const nums = values.filter((v): v is number => typeof v === "number");
  if (nums.length === 0) return null;
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

function countStatus(batch: Batch, status: AssignmentStatus) {
  return batch.students.reduce((sum, student) => {
    return (
      sum +
      Object.values(student.assignments).filter((value) => value === status).length
    );
  }, 0);
}

export function formatScore(value: number | null) {
  if (value == null) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function formatPct(value: number | null) {
  if (value == null) return "—";
  return `${Math.round(value)}%`;
}
