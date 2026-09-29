export type BatchId = "inc10" | "inc13";

export type CohortSlug = "3rd-year-old-batch" | "2nd-year-new-batch";

export type CohortKind = "monitoring" | "enrollment";

export const MYTRIBE_APP_URL = "https://mytribe.vigyanshaala.com";

export const DEFAULT_ENROLLMENT_PASSWORD = "VS@123";

export const SUBJECT_AREAS = ["BZC", "MPCs", "MSCs", "MPC", "BPC", "CEC", "HEC", "MEC"] as const;

/** Source enrollment names look like A SADHANA_BZC, not A Sadhana (BZC). */
export function enrollmentRosterName(name: string) {
  const trimmed = name.trim().replace(/\s+/g, " ").replace(/\s*_+\s*/g, "_");
  const match = trimmed.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (!match) return trimmed;
  return `${match[1].trim().toUpperCase()}_${match[2].trim()}`;
}

/** Student request names are typed and stored in capitals only. */
export function studentRequestName(name: string) {
  return name.toUpperCase();
}

export function enrollmentAddName(name: string, subjectArea = "") {
  const roster = enrollmentRosterName(name.trim());
  const subject = subjectArea.trim();
  const split = roster.match(/^(.*)_([^_]+)$/);
  const base = (split ? split[1] : roster).toUpperCase();
  if (!subject) return split ? `${base}_${split[2]}` : base;
  if (base.toLowerCase().endsWith(`_${subject.toLowerCase()}`)) return base;
  return `${base}_${subject}`;
}

export type StudentRole = "Student" | "Student leader";

export type AssignmentStatus =
  | "accepted"
  | "accepted_with_feedback"
  | "rejected_with_feedback"
  | "under_review"
  | "no_submission";

export type AssignmentKey =
  | "exploringInternet"
  | "careerExperience"
  | "swot"
  | "careerPlanner"
  | "careerVisionBoard"
  | "cvResume";

export type College = {
  slug: string;
  name: string;
  enrolled: number;
  acceleratorSelected: number;
};

export const EMPTY_ASSIGNMENTS: Record<AssignmentKey, AssignmentStatus | null> = {
  exploringInternet: null,
  careerExperience: null,
  swot: null,
  careerPlanner: null,
  careerVisionBoard: null,
  cvResume: null,
};

export type Student = {
  studentCode: string;
  name: string;
  role: StudentRole;
  collegeSlug: string;
  collegeName: string;
  email: string;
  loginId: string;
  password: string;
  phone: string;
  attendancePct: number | null;
  quizScore: number | null;
  assignmentScore: number | null;
  finalScore: number | null;
  acceleratorSelected: boolean;
  assignments: Record<AssignmentKey, AssignmentStatus | null>;
};

export type Batch = {
  id: BatchId;
  slug: CohortSlug;
  label: string;
  shortLabel: string;
  period: string;
  kind: CohortKind;
  appUrl?: string;
  sourceSheet: string;
  importedSheets: string[];
  colleges: College[];
  students: Student[];
};

export type ChangeRequestType = "rename" | "add" | "delete";
export type ChangeRequestTarget = "student" | "college";
export type ChangeRequestStatus = "pending" | "approved" | "rejected";

export type ChangeRequest = {
  id: string;
  cohortSlug: CohortSlug;
  batchId: BatchId;
  collegeSlug: string;
  collegeName: string;
  target: ChangeRequestTarget;
  type: ChangeRequestType;
  status: ChangeRequestStatus;
  payload: {
    studentCode?: string;
    currentName?: string;
    proposedName?: string;
    subjectArea?: string;
    loginId?: string;
    password?: string;
    phone?: string;
    collegeName?: string;
    reason?: string;
  };
  requestedAt: string;
  requestedFrom: string;
  reviewedAt?: string;
  reviewNote?: string;
};

export const ASSIGNMENT_COLUMNS: {
  key: AssignmentKey;
  label: string;
  short: string;
  aliases: string[];
}[] = [
  {
    key: "exploringInternet",
    label: "Assignment_1 Exploring_Internet_&_AI",
    short: "Assignment_1",
    aliases: [
      "assignment_1",
      "assignment 1",
      "exploring_internet_&_ai",
      "exploring internet",
      "exploring",
      "internet",
    ],
  },
  {
    key: "careerExperience",
    label: "Assignment2_Career_Exploration",
    short: "Assignment 2",
    aliases: [
      "assignment2",
      "assignment 2",
      "assignment2_career_exploration",
      "career exploration",
      "career experience",
      "career exp",
    ],
  },
  {
    key: "swot",
    label: "Assignment3_SWOT",
    short: "Assignment 3",
    aliases: ["assignment3", "assignment 3", "assignment3_swot", "swot"],
  },
  {
    key: "careerPlanner",
    label: "Assignment_4_Career_Panner",
    short: "Assignment 4",
    aliases: [
      "assignment_4",
      "assignment 4",
      "assignment_4_career_panner",
      "career planner",
      "career panner",
    ],
  },
  {
    key: "careerVisionBoard",
    label: "Assignment_5_Career_Vision_Board",
    short: "Assignment 5",
    aliases: [
      "assignment_5",
      "assignment 5",
      "assignment_5_career_vision_board",
      "vision board",
      "career vision",
    ],
  },
  {
    key: "cvResume",
    label: "Assignment_6_CV_Resume",
    short: "Assignment 6",
    aliases: ["assignment_6", "assignment 6", "assignment_6_cv_resume", "cv resume", "resume"],
  },
];

export const STATUS_LABEL: Record<AssignmentStatus, string> = {
  accepted: "Accepted",
  accepted_with_feedback: "Accepted with Feedback",
  rejected_with_feedback: "Rejected with Feedback",
  under_review: "Under Review",
  no_submission: "No Submission",
};

export const STATUS_FILL: Record<AssignmentStatus, { bg: string; fg: string }> = {
  accepted: { bg: "#C6EFCE", fg: "#006100" },
  accepted_with_feedback: { bg: "#FCE4D6", fg: "#C65911" },
  rejected_with_feedback: { bg: "#F8CBAD", fg: "#C65911" },
  under_review: { bg: "#FFF2CC", fg: "#7F6000" },
  no_submission: { bg: "#FFC7CE", fg: "#9C0006" },
};
