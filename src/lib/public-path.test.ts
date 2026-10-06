import assert from "node:assert/strict";
import test from "node:test";
import { isPublicPath } from "./public-path";
import { INC13_SOURCE_OVERLAY } from "./inc13-source";
import { INC10_SOURCE_COLLEGE_COUNT, INC10_SOURCE_OVERLAY, INC10_SOURCE_STUDENT_COUNT } from "./inc10-source";
import { overlayBatch } from "./store-types";
import { BATCHES, cohortsForStudentView, listCohorts } from "./cohort-data";
import { studentViewUrl } from "./share";
import { INC13_ADILABAD_SLUG, INC13_ADILABAD_SOURCE_COUNT, INC13_SOURCE_ENROLLMENT_COUNT } from "./inc13-roster";

test("responder and student-view paths are public", () => {
  assert.equal(isPublicPath("/login"), true);
  assert.equal(isPublicPath("/student-view"), true);
  assert.equal(isPublicPath("/student-view/2nd-year-new-batch"), true);
  assert.equal(isPublicPath("/student-view/2nd-year-new-batch/mjptbc-adilabad"), true);
  assert.equal(isPublicPath("/r"), true);
  assert.equal(isPublicPath("/r/2nd-year-new-batch"), true);
  assert.equal(isPublicPath("/cohorts"), false);
  assert.equal(isPublicPath("/admin/share"), false);
});

test("student-view Vercel URL is the public responder hub", () => {
  assert.equal(studentViewUrl(), "https://telangana-colleges-dashboard.vercel.app/student-view");
  assert.equal(
    studentViewUrl("2nd-year-new-batch"),
    "https://telangana-colleges-dashboard.vercel.app/student-view/2nd-year-new-batch",
  );
  assert.equal(
    studentViewUrl("2nd-year-new-batch", "mjptbc-adilabad"),
    "https://telangana-colleges-dashboard.vercel.app/student-view/2nd-year-new-batch/mjptbc-adilabad",
  );
});

test("student view keeps the current batch and omits the old batch", () => {
  assert.deepEqual(
    cohortsForStudentView(listCohorts()).map((cohort) => cohort.slug),
    ["2nd-year-new-batch"],
  );
});

test("3rd Year old batch seed lists all 53 source colleges", () => {
  assert.equal(BATCHES.inc10.colleges.length, INC10_SOURCE_COLLEGE_COUNT);
});

test("Inc 10 source overlay ships 53 colleges from the monitoring workbook", () => {
  const batch = overlayBatch(BATCHES.inc10, INC10_SOURCE_OVERLAY);
  assert.equal(batch.colleges.length, INC10_SOURCE_COLLEGE_COUNT);
  assert.equal(batch.students.length, INC10_SOURCE_STUDENT_COUNT);
  assert.match(batch.sourceSheet, /Student_Facing_Monitoring/i);
});

test("Inc 13 source overlay ships 56 colleges and 2,331 Excel students", () => {
  const batch = overlayBatch(BATCHES.inc13, INC13_SOURCE_OVERLAY);
  assert.equal(batch.colleges.length, 56);
  assert.equal(batch.students.length, INC13_SOURCE_ENROLLMENT_COUNT);
  assert.equal(
    batch.students.filter((student) => student.collegeSlug === INC13_ADILABAD_SLUG).length,
    INC13_ADILABAD_SOURCE_COUNT,
  );
});
