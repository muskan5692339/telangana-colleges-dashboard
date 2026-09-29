import assert from "node:assert/strict";
import test from "node:test";
import { applyChangeRequest } from "./apply-request";
import { EMPTY_STORE } from "./store-types";
import { EMPTY_ASSIGNMENTS, enrollmentAddName, studentRequestName, type ChangeRequest } from "./types";

function request(partial: Partial<ChangeRequest>): ChangeRequest {
  return {
    id: "req-1",
    cohortSlug: "2nd-year-new-batch",
    batchId: "inc13",
    collegeSlug: "mjptbc-adilabad",
    collegeName: "MJPTBC Adilabad",
    target: "student",
    type: "rename",
    status: "pending",
    payload: {},
    requestedAt: "2026-09-26T10:00:00.000Z",
    requestedFrom: "responder",
    ...partial,
  };
}

const overlay = {
  colleges: [{ slug: "mjptbc-adilabad", name: "MJPTBC Adilabad", enrolled: 1, acceleratorSelected: 0 }],
  students: [
    {
      studentCode: "19850",
      name: "19850",
      role: "Student" as const,
      collegeSlug: "mjptbc-adilabad",
      collegeName: "MJPTBC Adilabad",
      email: "19850@sfsvigyanshaala.com",
      loginId: "19850@sfsvigyanshaala.com",
      password: "SheForSTEM13",
      phone: "",
      attendancePct: null,
      quizScore: null,
      assignmentScore: null,
      finalScore: null,
      acceleratorSelected: false,
      assignments: { ...EMPTY_ASSIGNMENTS },
    },
  ],
  sourceSheet: "Inc13_Student Enrollment.xlsx",
  importedSheets: ["Student Enrollment"],
};

test("student request names are capitals only and enroll as NAME_STREAM", () => {
  assert.equal(studentRequestName("Aluri Harshitha"), "ALURI HARSHITHA");
  assert.equal(enrollmentAddName("aluri harshitha", "MPCs"), "ALURI HARSHITHA_MPCs");
});

test("approving a student rename updates the enrollment name", () => {
  const store = applyChangeRequest(
    { ...EMPTY_STORE, batches: { inc13: overlay }, requests: [request({ type: "rename" })] },
    request({
      type: "rename",
      payload: { studentCode: "19850", proposedName: "A Sadhana" },
    }),
  );
  assert.equal(store.batches.inc13?.students[0]?.name, "A Sadhana");
  assert.equal(store.requests[0]?.status, "approved");
});

test("approving add enrolls with subject area, dummy email, and password", () => {
  const added = applyChangeRequest(
    { ...EMPTY_STORE, batches: { inc13: overlay }, requests: [request({ id: "add", type: "add" })] },
    request({
      id: "add",
      type: "add",
      payload: {
        proposedName: "Aluri Harshitha",
        subjectArea: "MPCs",
        loginId: "19999@sfsvigyanshaala.com",
        password: "VS@123",
      },
    }),
  );
  assert.equal(added.batches.inc13?.students.length, 2);
  assert.equal(added.batches.inc13?.colleges[0]?.enrolled, 2);
  const enrolled = added.batches.inc13?.students.find((student) => student.loginId === "19999@sfsvigyanshaala.com");
  assert.equal(enrolled?.name, "ALURI HARSHITHA_MPCs");
  assert.equal(enrolled?.password, "VS@123");
});

test("approving add and delete changes enrollment headcount", () => {
  const added = applyChangeRequest(
    { ...EMPTY_STORE, batches: { inc13: overlay }, requests: [request({ id: "add", type: "add" })] },
    request({
      id: "add",
      type: "add",
      payload: { proposedName: "New Fellow", subjectArea: "BZC", loginId: "19999@sfsvigyanshaala.com", password: "SheForSTEM13" },
    }),
  );
  assert.equal(added.batches.inc13?.students.length, 2);
  assert.equal(added.batches.inc13?.colleges[0]?.enrolled, 2);

  const removed = applyChangeRequest(
    added,
    request({
      id: "del",
      type: "delete",
      payload: { studentCode: "19850" },
    }),
  );
  assert.equal(removed.batches.inc13?.students.length, 1);
  assert.equal(removed.batches.inc13?.colleges[0]?.enrolled, 1);
});
