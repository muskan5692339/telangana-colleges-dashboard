"use client";

import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/feedback/feedback";
import { CaptureButton } from "@/components/dashboard/capture-button";
import {
  HeaderFilter,
  matchesHeaderFilter,
  uniqueSorted,
} from "@/components/dashboard/header-filter";
import { StatusFillCell } from "@/components/dashboard/status-badge";
import { StudentDetail } from "@/components/dashboard/student-detail";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ASSIGNMENT_COLUMNS, STATUS_FILL, type AssignmentStatus, type Student } from "@/lib/types";
import { formatPct, formatScore } from "@/lib/cohort-data";
import { cn } from "@/lib/utils";

export function StudentTable({
  students = [],
  collegeName,
  showCollege = false,
}: {
  students?: Student[];
  collegeName: string;
  showCollege?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);
  const [collegeFilter, setCollegeFilter] = useState<Set<string> | null>(
    showCollege ? new Set([collegeName]) : null,
  );
  const [codeFilter, setCodeFilter] = useState<Set<string> | null>(null);
  const [nameFilter, setNameFilter] = useState<Set<string> | null>(null);
  const [emailFilter, setEmailFilter] = useState<Set<string> | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  const collegeOptions = useMemo(
    () => uniqueSorted(students.map((student) => student.collegeName)),
    [students],
  );
  const codeOptions = useMemo(
    () => uniqueSorted(students.map((student) => student.studentCode)),
    [students],
  );
  const nameOptions = useMemo(
    () => uniqueSorted(students.map((student) => student.name)),
    [students],
  );
  const emailOptions = useMemo(
    () => uniqueSorted(students.map((student) => student.email)),
    [students],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((student) => {
      if (showCollege && !matchesHeaderFilter(student.collegeName, collegeFilter)) return false;
      if (!matchesHeaderFilter(student.studentCode, codeFilter)) return false;
      if (!matchesHeaderFilter(student.name, nameFilter)) return false;
      if (!matchesHeaderFilter(student.email, emailFilter)) return false;
      if (!q) return true;
      return (
        student.name.toLowerCase().includes(q) ||
        student.studentCode.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q) ||
        student.collegeName.toLowerCase().includes(q)
      );
    });
  }, [collegeFilter, codeFilter, emailFilter, nameFilter, query, showCollege, students]);

  const selectedCount = students.filter((student) => student.acceleratorSelected).length;

  return (
    <div className="space-y-4">
      {students.length > 0 && (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-[var(--color-curie-muted)] md:text-base">
            {collegeName} · {selectedCount} accelerator selected of {students.length}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
              <Search className="pointer-events-none absolute top-3.5 left-3 h-5 w-5 text-[var(--color-curie-muted)]" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={showCollege ? "Search student or college" : "Search student name"}
                aria-label={showCollege ? "Search student or college" : "Search student name"}
                className="h-12 rounded-2xl bg-white pl-11 text-base"
              />
            </div>
            <CaptureButton
              targetRef={captureRef}
              filename={`${collegeName}-student-wise`}
              label="Screenshot table"
            />
          </div>
        </div>
      )}

      {students.length === 0 ? (
        <EmptyState
          message={`No students are tracked for ${collegeName} yet`}
          hint={
            showCollege
              ? "College-wise nomination and selection is available in the top right. Import Student Wise Phase 2 to fill this tracker."
              : "College-wise nomination and selection is available. Student Wise Phase 2 has not been imported for this college."
          }
        />
      ) : rows.length === 0 ? (
        <EmptyState message="No students match this filter" hint="Clear a header filter or try another name." />
      ) : (
        <div
          ref={captureRef}
          className="overflow-x-auto rounded-[20px] bg-white"
          style={{ border: "1px solid var(--color-curie-border)", boxShadow: "var(--shadow-card)" }}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-[#fbf4ea] hover:bg-[#fbf4ea]">
                <TableHead className="sticky left-0 z-10 h-16 min-w-[140px] bg-[#fbf4ea] whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span>Student Code</span>
                    <HeaderFilter
                      label="Student Code"
                      options={codeOptions}
                      selected={codeFilter}
                      onChange={setCodeFilter}
                    />
                  </div>
                </TableHead>
                <TableHead className="sticky left-[140px] z-10 h-16 min-w-[240px] bg-[#fbf4ea] whitespace-normal">
                  <div className="flex items-center gap-1">
                    <span>Name of the Student</span>
                    <HeaderFilter label="Name" options={nameOptions} selected={nameFilter} onChange={setNameFilter} />
                  </div>
                </TableHead>
                {showCollege && (
                  <TableHead className="h-16 min-w-[220px] whitespace-normal">
                    <div className="flex items-center gap-1">
                      <span>Name of college</span>
                      <HeaderFilter
                        label="Name of college"
                        options={collegeOptions}
                        selected={collegeFilter}
                        onChange={setCollegeFilter}
                      />
                    </div>
                  </TableHead>
                )}
                <TableHead className="h-16 min-w-[120px] whitespace-nowrap">Student Role</TableHead>
                <TableHead className="h-16 min-w-[200px]">
                  <div className="flex items-center gap-1">
                    <span>Email</span>
                    <HeaderFilter
                      label="Email"
                      options={emailOptions}
                      selected={emailFilter}
                      onChange={setEmailFilter}
                    />
                  </div>
                </TableHead>
                <TableHead className="h-14 text-right whitespace-nowrap">Attendance %</TableHead>
                <TableHead className="h-14 text-right whitespace-nowrap">Quiz Score</TableHead>
                <TableHead className="h-14 text-right whitespace-nowrap">Assignment Score</TableHead>
                <TableHead className="h-14 text-right whitespace-nowrap">Final Score</TableHead>
                {ASSIGNMENT_COLUMNS.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      "h-14 min-w-[160px] whitespace-normal align-top",
                      col.mandatory && "bg-[#FFCC29] text-[var(--color-navy)]",
                    )}
                  >
                    <span className="block font-semibold">{col.label}</span>
                    {col.mandatory ? (
                      <span className="mt-1 inline-flex rounded-full bg-[var(--color-navy)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-white">
                        Mandatory Accepted
                      </span>
                    ) : null}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((student) => (
                <TableRow
                  key={`${student.studentCode}-${student.email}`}
                  className={cn(
                    "cursor-pointer transition-colors",
                    student.acceleratorSelected
                      ? "bg-[var(--color-curie-green-light)] hover:!bg-[#d4ebc8]"
                      : "hover:!bg-[#efebe3]",
                  )}
                  style={
                    student.acceleratorSelected
                      ? { boxShadow: "inset 4px 0 0 var(--color-curie-green)" }
                      : undefined
                  }
                  onClick={() => setSelected(student)}
                >
                  <TableCell
                    className={cn(
                      "sticky left-0 z-10 py-3 font-semibold tabular-nums",
                      student.acceleratorSelected ? "bg-[var(--color-curie-green-light)]" : "bg-white",
                    )}
                  >
                    {student.studentCode}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "sticky left-[140px] z-10 py-3 font-semibold",
                      student.acceleratorSelected ? "bg-[var(--color-curie-green-light)]" : "bg-white",
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span>{student.name}</span>
                      {student.acceleratorSelected && <SelectedTag />}
                    </div>
                  </TableCell>
                  {showCollege && (
                    <TableCell className="py-3 font-medium text-[var(--color-navy)]">
                      {student.collegeName}
                    </TableCell>
                  )}
                  <TableCell className="py-3">{student.role}</TableCell>
                  <TableCell className="py-3 text-[var(--color-curie-muted)]">{student.email}</TableCell>
                  <TableCell className="py-3 text-right tabular-nums">
                    {formatPct(student.attendancePct)}
                  </TableCell>
                  <TableCell className="py-3 text-right tabular-nums">
                    {formatScore(student.quizScore)}
                  </TableCell>
                  <TableCell className="py-3 text-right tabular-nums">
                    {formatScore(student.assignmentScore)}
                  </TableCell>
                  <TableCell className="py-3 text-right font-semibold tabular-nums">
                    {formatScore(student.finalScore)}
                  </TableCell>
                  {ASSIGNMENT_COLUMNS.map((col) => {
                    const status = student.assignments[col.key];
                    return <AssignmentCell key={col.key} status={status} />;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {students.length > 0 && (
        <p className="text-[12px] text-[var(--color-curie-muted)]">
          Showing {rows.length} of {students.length} students
          {showCollege ? " across colleges — use the header funnels to filter" : ` at ${collegeName}`}. Assignment 1, 4, and 6
          must be accepted for Accelerator selection. Accelerator selected
          rows are highlighted in light green
          {selectedCount > 0 ? ` (${selectedCount})` : ""}. Assignment cells use the source-sheet
          colours. Tap a row for the Phase 2 record.
        </p>
      )}

      <StudentDetail student={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function AssignmentCell({ status }: { status: AssignmentStatus | null }) {
  const fill = status ? STATUS_FILL[status] : null;
  return (
    <TableCell
      className="whitespace-nowrap"
      style={fill ? { background: fill.bg, color: fill.fg } : undefined}
    >
      <StatusFillCell status={status} />
    </TableCell>
  );
}

function SelectedTag() {
  return (
    <span
      className="inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]"
      style={{
        background: "rgba(105, 171, 74, 0.18)",
        color: "#3d6b28",
      }}
    >
      Accelerator selected
    </span>
  );
}
