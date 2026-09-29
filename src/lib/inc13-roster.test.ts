import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { overlayBatch } from "./store-types";
import { BATCHES } from "./cohort-data";
import { EMPTY_ASSIGNMENTS, DEFAULT_ENROLLMENT_PASSWORD } from "./types";
import {
  INC13_ADILABAD_SLUG,
  INC13_ADILABAD_SOURCE_COUNT,
  INC13_COLLEGE_COUNTS,
  INC13_SOURCE_ENROLLMENT_COUNT,
  dummyEmailFromCode,
  enrollmentNameFromDummyEmail,
  isSourceInc13Email,
  isSyntheticTestEnrollment,
  sourceInc13Emails,
} from "./inc13-roster";

const livePath = path.join(process.cwd(), "data", "live-store.json");

function extraStudent(code: string, name: string) {
  const email = dummyEmailFromCode(code);
  return {
    studentCode: code,
    name,
    role: "Student" as const,
    collegeSlug: INC13_ADILABAD_SLUG,
    collegeName: "MJPTBC Adilabad",
    email,
    loginId: email,
    password: DEFAULT_ENROLLMENT_PASSWORD,
    phone: "",
    attendancePct: null,
    quizScore: null,
    assignmentScore: null,
    finalScore: null,
    acceleratorSelected: false,
    assignments: { ...EMPTY_ASSIGNMENTS },
  };
}

test("Adilabad source roster uses Excel NAME_STREAM and dummy email", () => {
  assert.equal(enrollmentNameFromDummyEmail("19850@sfsvigyanshaala.com"), "A SADHANA_BZC");
  assert.equal(enrollmentNameFromDummyEmail("19852"), "ALURI HARSHITHA_MPCs");
  assert.equal(enrollmentNameFromDummyEmail("19857"), "BERKUNTI NANDINI_MPCs");
  assert.equal(enrollmentNameFromDummyEmail("19866"), "HK KALYANI_BZC");
  assert.equal(enrollmentNameFromDummyEmail("19886"), "SALENDRA NAVANEETHA_MPCs");
  assert.equal(enrollmentNameFromDummyEmail("19893"), "VAIRAGADE SHILAVANTHA_MSCs");
  assert.equal(enrollmentNameFromDummyEmail("19894"), "VANGAR PREETHI_MPCs");
});

test("other colleges keep NAME_STREAM from the source enrollment sheet", () => {
  assert.equal(enrollmentNameFromDummyEmail("19895@sfsvigyanshaala.com"), "ANDE RENU SRI_BZC");
});

test("source dummy-email roster is the full Excel sheet: 2,331 names, 45 Adilabad", () => {
  const emails = sourceInc13Emails();
  assert.equal(emails.length, INC13_SOURCE_ENROLLMENT_COUNT);
  assert.equal(Object.keys(INC13_COLLEGE_COUNTS).length, 56);
  assert.equal(INC13_COLLEGE_COUNTS[INC13_ADILABAD_SLUG]?.enrolled, INC13_ADILABAD_SOURCE_COUNT);
  assert.equal(
    Object.values(INC13_COLLEGE_COUNTS).reduce((sum, college) => sum + college.enrolled, 0),
    INC13_SOURCE_ENROLLMENT_COUNT,
  );
  for (let index = 0; index < INC13_ADILABAD_SOURCE_COUNT; index += 1) {
    const code = String(19850 + index);
    const name = enrollmentNameFromDummyEmail(code);
    assert.ok(name, `missing Adilabad code ${code}`);
    assert.equal(/^\d+$/.test(name), false, `numeric name for ${code}`);
  }
  assert.equal(enrollmentNameFromDummyEmail("29998"), undefined);
  assert.equal(enrollmentNameFromDummyEmail("29999"), undefined);
});

test("numeric overlay names are replaced from the source dummy-email roster", () => {
  const overlay = overlayBatch(BATCHES.inc13, {
    colleges: [{ slug: "mjptbc-adilabad", name: "MJPTBC Adilabad", enrolled: 1, acceleratorSelected: 0 }],
    students: [
      {
        studentCode: "19866",
        name: "19866",
        role: "Student",
        collegeSlug: "mjptbc-adilabad",
        collegeName: "MJPTBC Adilabad",
        email: "19866@sfsvigyanshaala.com",
        loginId: "19866@sfsvigyanshaala.com",
        password: "VS@123",
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
    importedSheets: ["Sheet1"],
  });
  assert.equal(overlay.students[0]?.name, "HK KALYANI_BZC");
  assert.equal(overlay.students[0]?.loginId, "19866@sfsvigyanshaala.com");
});

test("overlay strips TEST/DEMO enrollments so Adilabad stays at the Excel 45", () => {
  const overlay = overlayBatch(BATCHES.inc13, {
    colleges: [
      {
        slug: INC13_ADILABAD_SLUG,
        name: "MJPTBC Adilabad",
        enrolled: INC13_ADILABAD_SOURCE_COUNT + 2,
        acceleratorSelected: 0,
      },
    ],
    students: [
      ...BATCHES.inc13.students,
      extraStudent("29999", "TEST STUDENT ONE_MPCs"),
      extraStudent("29998", "DEMO STUDENT TWO_BZC"),
    ],
    sourceSheet: "Inc13_Student Enrollment.xlsx",
    importedSheets: ["Sheet1"],
  });
  assert.equal(overlay.students.length, INC13_ADILABAD_SOURCE_COUNT);
  assert.equal(overlay.colleges[0]?.enrolled, INC13_ADILABAD_SOURCE_COUNT);
  assert.equal(overlay.students.some(isSyntheticTestEnrollment), false);
  assert.equal(
    overlay.students.some((student) => student.studentCode === "29999" || student.studentCode === "29998"),
    false,
  );
});

if (existsSync(livePath)) {
  test("live Inc 13 overlay matches source Excel for every college", () => {
    const live = JSON.parse(readFileSync(livePath, "utf8")) as {
      batches?: { inc13?: Parameters<typeof overlayBatch>[1] };
    };
    const batch = overlayBatch(BATCHES.inc13, live.batches?.inc13);
    const extras = batch.students.filter((student) => !isSourceInc13Email(student.loginId || student.email));
    const sourceStudents = batch.students.filter((student) =>
      isSourceInc13Email(student.loginId || student.email),
    );

    assert.equal(sourceStudents.length, INC13_SOURCE_ENROLLMENT_COUNT);
    assert.equal(extras.filter(isSyntheticTestEnrollment).length, 0);
    assert.equal(
      extras.filter((student) => student.studentCode === "29998" || student.studentCode === "29999").length,
      0,
    );

    const issues: string[] = [];
    for (const [slug, expected] of Object.entries(INC13_COLLEGE_COUNTS)) {
      const atCollege = sourceStudents.filter((student) => student.collegeSlug === slug);
      const college = batch.colleges.find((item) => item.slug === slug);
      if (atCollege.length !== expected.enrolled) {
        issues.push(`${expected.name}: Excel ${expected.enrolled} vs live source rows ${atCollege.length}`);
      }
      if (college && extras.length === 0 && college.enrolled !== expected.enrolled) {
        issues.push(`${expected.name}: enrolled field ${college.enrolled} vs Excel ${expected.enrolled}`);
      }
      if (college && college.name !== expected.name) {
        issues.push(`${slug}: college name ${college.name} vs ${expected.name}`);
      }
    }

    for (const student of sourceStudents) {
      const email = (student.loginId || student.email).trim().toLowerCase();
      const expectedName = enrollmentNameFromDummyEmail(email);
      if (student.name !== expectedName) {
        issues.push(`${email}: name ${student.name} vs Excel ${expectedName}`);
      }
      if (!email.endsWith("@sfsvigyanshaala.com")) {
        issues.push(`${email}: dummy email domain`);
      }
      if (email.split("@")[0] !== student.studentCode) {
        issues.push(`${email}: code ${student.studentCode}`);
      }
      if (student.password !== DEFAULT_ENROLLMENT_PASSWORD) {
        issues.push(`${email}: password ${student.password}`);
      }
      if (/^\d+$/.test(student.name.trim())) {
        issues.push(`${email}: numeric name`);
      }
    }

    assert.equal(issues.length, 0, issues.join("\n"));
  });
}
