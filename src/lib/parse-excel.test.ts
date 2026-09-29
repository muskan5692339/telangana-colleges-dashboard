import assert from "node:assert/strict";
import test from "node:test";
import * as XLSX from "xlsx";
import { applyTabColors } from "./xlsx-zip";
import { buildTemplateWorkbook, parseWorkbook } from "./parse-excel";

function workbookFromSheets(sheets: Record<string, unknown[][]>) {
  const wb = XLSX.utils.book_new();
  for (const [name, rows] of Object.entries(sheets)) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), name);
  }
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

test("does not treat college name as the student name", () => {
  const buffer = workbookFromSheets({
    "Student Wise - Phase 2": [
      ["College Name", "Name", "Email", "Attendance", "Accelerator selected", "Quiz", "Overall"],
      ["TSWRDCW Kamareddy", "Keerthana", "14153@vigyanshaala.com", 0.89, "Yes", 9.3, 72.3],
      ["TSWRDCW Kamareddy", "Sravani", "14166@vigyanshaala.com", 0.86, "No", 8.8, 64.1],
    ],
  });
  const parsed = parseWorkbook(buffer);
  const kamareddy = parsed.students.filter((student) => student.collegeSlug === "tswrdcw-kamareddy");
  assert.equal(kamareddy.length, 2);
  assert.deepEqual(
    kamareddy.map((student) => student.name).sort(),
    ["Keerthana", "Sravani"],
  );
  assert.equal(kamareddy.find((student) => student.name === "Keerthana")?.acceleratorSelected, true);
  assert.equal(kamareddy.find((student) => student.name === "Sravani")?.acceleratorSelected, false);
  assert.equal(kamareddy[0]?.attendancePct, 89);
});

test("keeps accelerator selected when a later college sheet omits it", () => {
  const raw = workbookFromSheets({
    "College-wise selection": [
      ["College", "Enrolled", "Accelerator selected"],
      ["TSWRDCW Kamareddy", 39, 13],
    ],
    "Collegewise_Final Selection_var": [
      ["College", "Enrolled"],
      ["TSWRDCW Kamareddy", 39],
    ],
  });
  const buffer = applyTabColors(raw, [
    "College-wise selection",
    "Collegewise_Final Selection_var",
  ]);
  const parsed = parseWorkbook(buffer);
  const college = parsed.colleges.find((item) => item.slug === "tswrdcw-kamareddy");
  assert.equal(college?.enrolled, 39);
  assert.equal(college?.acceleratorSelected, 13);
});

test("counts one row per selected student on a college-wise selection list", () => {
  const rows: unknown[][] = [["College", "Student Name", "Email"]];
  for (let i = 0; i < 13; i += 1) {
    rows.push(["TSWRDCW Kamareddy", `Fellow ${i + 1}`, `${14100 + i}@vigyanshaala.com`]);
  }
  const buffer = workbookFromSheets({
    "College-wise selection": rows,
    "Collegewise_Final Selection": [
      ["College", "Enrolled"],
      ["TSWRDCW Kamareddy", 39],
    ],
  });
  const parsed = parseWorkbook(buffer);
  const college = parsed.colleges.find((item) => item.slug === "tswrdcw-kamareddy");
  assert.equal(college?.enrolled, 39);
  assert.equal(college?.acceleratorSelected, 13);
  const selected = parsed.students.filter(
    (student) => student.collegeSlug === "tswrdcw-kamareddy" && student.acceleratorSelected,
  );
  assert.equal(selected.length, 13);
  assert.equal(selected[0]?.name.startsWith("Fellow"), true);
});

test("ignores uncolored working sheets so variant college names are not added", () => {
  const raw = workbookFromSheets({
    "College-wise selection": [
      ["College", "Enrolled", "Accelerator selected"],
      ["TSWRDCW Kamareddy", 39, 13],
      ["MJPTBC Khamam", 50, 6],
    ],
    "Collegewise_Final Selection_var": [
      ["College", "Enrolled"],
      ["MJPTBC Khammam", 0],
      ["TSWRDCW Sircilla", 0],
      ["TTWRDCW Janagaon", 0],
    ],
  });
  const buffer = applyTabColors(raw, ["College-wise selection"]);
  const parsed = parseWorkbook(buffer);
  assert.equal(parsed.colleges.length, 2);
  assert.deepEqual(
    parsed.colleges.map((college) => college.name).sort(),
    ["MJPTBC Khamam", "TSWRDCW Kamareddy"],
  );
  assert.deepEqual(parsed.skippedSheets, ["Collegewise_Final Selection_var"]);
});

test("template workbook includes Kamareddy selected students", () => {
  const parsed = parseWorkbook(buildTemplateWorkbook());
  const college = parsed.colleges.find((item) => item.slug === "tswrdcw-kamareddy");
  assert.equal(college?.enrolled, 39);
  assert.equal(college?.acceleratorSelected, 1);
  const keerthana = parsed.students.find((student) => student.studentCode === "14153");
  assert.equal(keerthana?.name, "Keerthana");
  assert.equal(keerthana?.acceleratorSelected, true);
});

test("reads Accelerator Selection as a count and ignores % Selection", () => {
  const buffer = workbookFromSheets({
    "College-wise selection": [
      ["Name of College", "No. of student ", "Phase 2 Selected", "Accelerator \nSelection", "% Selection"],
      ["MJPTBC Peddapalli", 12, 12, 8, 8 / 12],
      ["MJPTBC Adilabad", 35, 35, 14, 0.4],
    ],
  });
  const parsed = parseWorkbook(buffer);
  const peddapalli = parsed.colleges.find((item) => item.slug === "mjptbc-peddapalli");
  const adilabad = parsed.colleges.find((item) => item.slug === "mjptbc-adilabad");
  assert.equal(peddapalli?.enrolled, 12);
  assert.equal(peddapalli?.acceleratorSelected, 8);
  assert.equal(adilabad?.enrolled, 35);
  assert.equal(adilabad?.acceleratorSelected, 14);
});

test("converts a selection rate such as 8/12 into a headcount of 8", () => {
  const buffer = workbookFromSheets({
    "Collegewise_Final Selection": [
      ["College", "Enrolled", "Accelerator selected"],
      ["MJPTBC Peddapalli", 12, 8 / 12],
      ["MJPTBC Adilabad", 35, 1],
    ],
  });
  const parsed = parseWorkbook(buffer);
  const peddapalli = parsed.colleges.find((item) => item.slug === "mjptbc-peddapalli");
  const adilabad = parsed.colleges.find((item) => item.slug === "mjptbc-adilabad");
  assert.equal(peddapalli?.enrolled, 12);
  assert.equal(peddapalli?.acceleratorSelected, 8);
  assert.equal(adilabad?.acceleratorSelected, 1);
});

test("reads Name of the Student and Under Review / Career Planner statuses", () => {
  const buffer = workbookFromSheets({
    "Student Wise - Phase 2": [
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
        "MJPTBC Peddapalli",
        "13181@vigyanshaala.com",
        39,
        5,
        20,
        65,
        "Accepted",
        "Under Review",
        "Accepted",
        "Rejected with Feedback",
        "Accepted",
        "Accepted with Feedback",
      ],
    ],
  });
  const parsed = parseWorkbook(buffer);
  const student = parsed.students.find((item) => item.studentCode === "13181");
  assert.equal(student?.name, "Amuya");
  assert.equal(student?.assignments.exploringInternet, "accepted");
  assert.equal(student?.assignments.careerExperience, "under_review");
  assert.equal(student?.assignments.careerPlanner, "rejected_with_feedback");
  assert.equal(student?.assignments.cvResume, "accepted_with_feedback");
});

test("uses Name of the Student even when the code is numeric, and fills a blank Assignment 4 header", () => {
  const buffer = workbookFromSheets({
    "Student Wise - Phase 2": [
      [
        "Student Code",
        "Name of the Student",
        "Student Role",
        "Name of the college",
        "Email",
        "Assignment2_Career_Exploration",
        "Assignment3_SWOT",
        "Assignment_5_Career_Vision_Board",
        "Assignment_1\nExploring_Internet_&_AI",
        "",
        "Assignment_6_CV_Resume",
      ],
      [
        13509,
        "D.Sindhuja",
        "Student Leader",
        "MJPTBC Peddapalli",
        "13509@vigyanshaala.com",
        "Accepted",
        "Accepted",
        "Accepted",
        "Accepted",
        "Under Review",
        "Accepted",
      ],
    ],
  });
  const parsed = parseWorkbook(buffer);
  const student = parsed.students.find((item) => item.studentCode === "13509");
  assert.equal(student?.name, "D.Sindhuja");
  assert.equal(student?.assignments.exploringInternet, "accepted");
  assert.equal(student?.assignments.careerExperience, "accepted");
  assert.equal(student?.assignments.swot, "accepted");
  assert.equal(student?.assignments.careerPlanner, "under_review");
  assert.equal(student?.assignments.careerVisionBoard, "accepted");
  assert.equal(student?.assignments.cvResume, "accepted");
});

test("flags Accelerator Selected and Final Selection Variable 4 as selected students", () => {
  const named = workbookFromSheets({
    "Student Wise - Phase 2": [
      ["Student Code", "Name of the Student", "College", "Email", "Accelerator Selected"],
      ["13509", "D.Sindhuja", "MJPTBC Peddapalli", "13509@vigyanshaala.com", "Yes"],
      ["15792", "G.Asmitha", "MJPTBC Peddapalli", "15792@vigyanshaala.com", "No"],
    ],
  });
  const namedParsed = parseWorkbook(named);
  assert.equal(namedParsed.students.find((s) => s.name === "D.Sindhuja")?.acceleratorSelected, true);
  assert.equal(namedParsed.students.find((s) => s.name === "G.Asmitha")?.acceleratorSelected, false);

  const scored = workbookFromSheets({
    "Student Wise - Phase 2": [
      ["Student Code", "Name of the Student", "College", "Email", "Final Selection\nVariable"],
      ["13509", "D.Sindhuja", "MJPTBC Peddapalli", "13509@vigyanshaala.com", 4],
      ["15792", "G.Asmitha", "MJPTBC Peddapalli", "15792@vigyanshaala.com", 3],
    ],
  });
  const scoredParsed = parseWorkbook(scored);
  assert.equal(scoredParsed.students.find((s) => s.name === "D.Sindhuja")?.acceleratorSelected, true);
  assert.equal(scoredParsed.students.find((s) => s.name === "G.Asmitha")?.acceleratorSelected, false);
  assert.equal(
    scoredParsed.colleges.find((c) => c.slug === "mjptbc-peddapalli")?.acceleratorSelected,
    1,
  );
});

test("a blank Final Selection Status is not selected, even when Final Selection Variable is 1", () => {
  const raw = workbookFromSheets({
    "College-wise selection": [
      ["Name of College", "No. of student ", "Accelerator \nSelection"],
      ["TTWRDCW Suryapeta", 27, 4],
      ["MJPTBC Adilabad", 35, 14],
    ],
    "Student Wise - Phase 2": [
      ["Student Code", "Name of the Student", "Name of the college", "Email", "Final Selection\nVariable", "Final Selection\nStatus"],
      [13600, "VAJJE LIKITHA", "TTWRDCW Suryapeta", "13600@vigyanshaala.com", 1, ""],
      [13601, "B STUDENT", "TTWRDCW Suryapeta", "13601@vigyanshaala.com", 3, ""],
      [13181, "A AMULYA", "MJPTBC Adilabad", "13181@vigyanshaala.com", 4, "Accelerator Selected"],
      [13182, "C STUDENT", "MJPTBC Adilabad", "13182@vigyanshaala.com", 0, ""],
    ],
  });
  const parsed = parseWorkbook(applyTabColors(raw, ["College-wise selection", "Student Wise - Phase 2"]));
  assert.equal(parsed.students.find((s) => s.name === "VAJJE LIKITHA")?.acceleratorSelected, false);
  assert.equal(parsed.students.find((s) => s.name === "A AMULYA")?.acceleratorSelected, true);
  assert.equal(parsed.colleges.find((c) => c.slug === "ttwrdcw-suryapeta")?.acceleratorSelected, 0);
  assert.equal(parsed.colleges.find((c) => c.slug === "mjptbc-adilabad")?.acceleratorSelected, 1);
  assert.equal(parsed.colleges.find((c) => c.slug === "mjptbc-adilabad")?.enrolled, 35);
});

test("reads Inc 13 student enrollment login id and password for 56-college source shape", () => {
  const buffer = workbookFromSheets({
    "Student Enrollment": [
      ["Sno.", "Name of college", "Name of the Student", "Login ID", "Password"],
      ["1", "MJPTBC Adilabad", "A Sadhana", "19850@sfsvigyanshaala.com", "SheForSTEM13"],
      ["2", "TTWRDC Janagaon", "G Kiranmai", "19863@sfsvigyanshaala.com", "SheForSTEM13"],
    ],
  });
  const parsed = parseWorkbook(buffer);
  assert.equal(parsed.colleges.length, 2);
  assert.equal(parsed.students.length, 2);
  const sadhana = parsed.students.find((student) => student.studentCode === "19850");
  assert.equal(sadhana?.name, "A Sadhana");
  assert.equal(sadhana?.loginId, "19850@sfsvigyanshaala.com");
  assert.equal(sadhana?.password, "SheForSTEM13");
  assert.equal(sadhana?.collegeName, "MJPTBC Adilabad");
  assert.equal(sadhana?.acceleratorSelected, false);
  assert.equal(parsed.colleges.find((college) => college.slug === "mjptbc-adilabad")?.enrolled, 1);
  assert.equal(parsed.colleges.find((college) => college.slug === "mjptbc-adilabad")?.acceleratorSelected, 0);
});

test("reads dummy email, password, and NAME_STREAM from the Inc 13 source sheet shape", () => {
  const buffer = workbookFromSheets({
    Sheet1: [
      ["Dummy email", "Password", "Name", "College"],
      ["19850@sfsvigyanshaala.com", "VS@123", "A SADHANA_BZC", "MJPTBC Adilabad"],
      ["19851@sfsvigyanshaala.com", "VS@123", "ADE ANJALI_MSCs", "MJPTBC Adilabad"],
    ],
  });
  const parsed = parseWorkbook(buffer);
  assert.equal(parsed.students.length, 2);
  const sadhana = parsed.students.find((student) => student.studentCode === "19850");
  assert.equal(sadhana?.name, "A SADHANA_BZC");
  assert.equal(sadhana?.loginId, "19850@sfsvigyanshaala.com");
  assert.equal(sadhana?.password, "VS@123");
  assert.equal(sadhana?.collegeName, "MJPTBC Adilabad");
});

test("reads NAME_STREAM from an unlabeled enrollment column", () => {
  const buffer = workbookFromSheets({
    Sheet1: [
      ["Dummy email", "Password", "", "College"],
      ["19866@sfsvigyanshaala.com", "VS@123", "HK KALYANI_BZC", "MJPTBC Adilabad"],
      ["19895@sfsvigyanshaala.com", "VS@123", "ANDE RENU SRI_BZC", "MJPTBC Ghanpur"],
    ],
  });
  const parsed = parseWorkbook(buffer);
  assert.equal(parsed.students.find((student) => student.studentCode === "19866")?.name, "HK KALYANI_BZC");
  assert.equal(
    parsed.students.find((student) => student.studentCode === "19895")?.name,
    "ANDE RENU SRI_BZC",
  );
  assert.equal(parsed.students.find((student) => student.studentCode === "19895")?.collegeName, "MJPTBC Ghanpur");
});




