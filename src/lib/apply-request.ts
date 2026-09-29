import {
  EMPTY_ASSIGNMENTS,
  enrollmentAddName,
  type ChangeRequest,
  type College,
  type Student,
} from "@/lib/types";
import type { LiveBatchOverlay, LiveStore } from "@/lib/store-types";
import { BATCHES } from "@/lib/cohort-data";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emailLocal(value: string) {
  return value.split("@")[0]?.trim() ?? "";
}

function overlayFromSeed(batchId: ChangeRequest["batchId"]): LiveBatchOverlay {
  const seed = BATCHES[batchId];
  return {
    colleges: seed.colleges.map((college) => ({ ...college })),
    students: seed.students.map((student) => ({
      ...student,
      assignments: { ...student.assignments },
    })),
    sourceSheet: seed.sourceSheet,
    importedSheets: [...seed.importedSheets],
  };
}

function syncEnrolled(overlay: LiveBatchOverlay, collegeSlug: string) {
  const count = overlay.students.filter((student) => student.collegeSlug === collegeSlug).length;
  overlay.colleges = overlay.colleges.map((college) =>
    college.slug === collegeSlug ? { ...college, enrolled: count } : college,
  );
}

function newStudent(college: College, payload: ChangeRequest["payload"]): Student {
  const loginId = (payload.loginId || "").trim();
  const name = enrollmentAddName(payload.proposedName || "", payload.subjectArea || "");
  const code =
    payload.studentCode?.trim() ||
    (/^\d+$/.test(emailLocal(loginId)) ? emailLocal(loginId) : slugify(name || loginId));
  const email = loginId.includes("@") ? loginId : loginId ? `${loginId}@sfsvigyanshaala.com` : "";
  return {
    studentCode: code || `new-${Date.now()}`,
    name: name || code,
    role: "Student",
    collegeSlug: college.slug,
    collegeName: college.name,
    email,
    loginId: loginId || email,
    password: payload.password?.trim() ?? "",
    phone: payload.phone?.trim() ?? "",
    attendancePct: null,
    quizScore: null,
    assignmentScore: null,
    finalScore: null,
    acceleratorSelected: false,
    assignments: { ...EMPTY_ASSIGNMENTS },
  };
}

export function applyChangeRequest(store: LiveStore, request: ChangeRequest): LiveStore {
  const overlay = store.batches[request.batchId] ?? overlayFromSeed(request.batchId);
  const next: LiveBatchOverlay = {
    ...overlay,
    colleges: overlay.colleges.map((college) => ({ ...college })),
    students: overlay.students.map((student) => ({
      ...student,
      assignments: { ...student.assignments },
    })),
  };

  if (request.target === "student") {
    const college =
      next.colleges.find((item) => item.slug === request.collegeSlug) ??
      ({
        slug: request.collegeSlug,
        name: request.collegeName,
        enrolled: 0,
        acceleratorSelected: 0,
      } satisfies College);
    if (!next.colleges.some((item) => item.slug === college.slug)) {
      next.colleges.push(college);
    }

    if (request.type === "add") {
      next.students.push(newStudent(college, request.payload));
      syncEnrolled(next, college.slug);
    } else if (request.type === "rename") {
      next.students = next.students.map((student) =>
        student.collegeSlug === college.slug && student.studentCode === request.payload.studentCode
          ? {
              ...student,
              name: request.payload.proposedName?.trim() || student.name,
              loginId: request.payload.loginId?.trim() || student.loginId,
              password: request.payload.password?.trim() || student.password,
            }
          : student,
      );
    } else if (request.type === "delete") {
      next.students = next.students.filter(
        (student) =>
          !(student.collegeSlug === college.slug && student.studentCode === request.payload.studentCode),
      );
      syncEnrolled(next, college.slug);
    }
  } else if (request.target === "college") {
    if (request.type === "add") {
      const name = (request.payload.collegeName || request.payload.proposedName || "").trim();
      const slug = slugify(name);
      if (name && !next.colleges.some((college) => college.slug === slug)) {
        next.colleges.push({ slug, name, enrolled: 0, acceleratorSelected: 0 });
      }
    } else if (request.type === "rename") {
      const name = (request.payload.proposedName || request.payload.collegeName || "").trim();
      next.colleges = next.colleges.map((college) =>
        college.slug === request.collegeSlug ? { ...college, name: name || college.name } : college,
      );
      next.students = next.students.map((student) =>
        student.collegeSlug === request.collegeSlug
          ? { ...student, collegeName: name || student.collegeName }
          : student,
      );
    } else if (request.type === "delete") {
      next.colleges = next.colleges.filter((college) => college.slug !== request.collegeSlug);
      next.students = next.students.filter((student) => student.collegeSlug !== request.collegeSlug);
    }
  }

  return {
    ...store,
    batches: { ...store.batches, [request.batchId]: next },
    requests: store.requests.map((item) =>
      item.id === request.id
        ? { ...item, status: "approved", reviewedAt: new Date().toISOString() }
        : item,
    ),
    updatedAt: new Date().toISOString(),
  };
}
