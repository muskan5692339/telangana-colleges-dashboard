"use client";

import { useMemo, useRef, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { EmptyState } from "@/components/feedback/feedback";
import { CaptureButton } from "@/components/dashboard/capture-button";
import { ChangeRequestDialog } from "@/components/dashboard/change-request-dialog";
import {
  HeaderFilter,
  matchesHeaderFilter,
  uniqueSorted,
} from "@/components/dashboard/header-filter";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MYTRIBE_APP_URL, enrollmentRosterName, type Student } from "@/lib/types";

export function EnrollmentTable({
  students = [],
  collegeName,
  collegeSlug,
  cohortSlug,
  requestedFrom,
}: {
  students?: Student[];
  collegeName: string;
  collegeSlug: string;
  cohortSlug: string;
  requestedFrom: string;
}) {
  const [query, setQuery] = useState("");
  const [nameFilter, setNameFilter] = useState<Set<string> | null>(null);
  const [emailFilter, setEmailFilter] = useState<Set<string> | null>(null);
  const [passwordFilter, setPasswordFilter] = useState<Set<string> | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  const catalog = useMemo(
    () =>
      students.map((student) => ({
        student,
        name: enrollmentRosterName(student.name),
        dummyEmail: student.loginId || student.email,
        password: student.password || "—",
      })),
    [students],
  );

  const nameOptions = useMemo(() => uniqueSorted(catalog.map((row) => row.name)), [catalog]);
  const emailOptions = useMemo(() => uniqueSorted(catalog.map((row) => row.dummyEmail)), [catalog]);
  const passwordOptions = useMemo(() => uniqueSorted(catalog.map((row) => row.password)), [catalog]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((row) => {
      if (!matchesHeaderFilter(row.name, nameFilter)) return false;
      if (!matchesHeaderFilter(row.dummyEmail, emailFilter)) return false;
      if (!matchesHeaderFilter(row.password, passwordFilter)) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.dummyEmail.toLowerCase().includes(q) ||
        row.password.toLowerCase().includes(q) ||
        row.student.studentCode.toLowerCase().includes(q)
      );
    });
  }, [catalog, emailFilter, nameFilter, passwordFilter, query]);

  return (
    <div className="space-y-4">
      <div
        className="rounded-[20px] bg-white p-4 md:p-5"
        style={{ border: "1px solid var(--color-curie-border)", boxShadow: "var(--shadow-card)" }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-curie-muted)]">
          VigyanShaala tablet app
        </p>
        <p className="mt-1 text-sm text-[var(--color-navy)] md:text-base">
          Use the allotted dummy email and password on{" "}
          <a
            href={MYTRIBE_APP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold underline"
          >
            mytribe.vigyanshaala.com
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          . Do not type a personal Gmail.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-[var(--color-curie-muted)] md:text-base">
          {collegeName} · {students.length} enrolled
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
            <Search className="pointer-events-none absolute top-3.5 left-3 h-5 w-5 text-[var(--color-curie-muted)]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name or dummy email"
              aria-label="Search name or dummy email"
              className="h-12 rounded-2xl bg-white pl-11 text-base"
            />
          </div>
          <ChangeRequestDialog
            cohortSlug={cohortSlug}
            collegeSlug={collegeSlug}
            collegeName={collegeName}
            target="student"
            type="add"
            requestedFrom={requestedFrom}
            triggerLabel="Request add"
          />
          <CaptureButton
            targetRef={captureRef}
            filename={`${collegeName}-enrollment`}
            label="Screenshot table"
          />
        </div>
      </div>

      {students.length === 0 ? (
        <EmptyState
          message={`No enrollment rows for ${collegeName} yet`}
          hint="Upload the Student Enrollment source sheet, or request to add a student."
        />
      ) : rows.length === 0 ? (
        <EmptyState message="No students match this filter" hint="Clear a header filter or try another search." />
      ) : (
        <div
          ref={captureRef}
          className="overflow-x-auto rounded-[20px] bg-white"
          style={{ border: "1px solid var(--color-curie-border)", boxShadow: "var(--shadow-card)" }}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-[#fbf4ea] hover:bg-[#fbf4ea]">
                <TableHead className="h-16 w-12">Sno.</TableHead>
                <TableHead className="h-16 min-w-[220px]">
                  <div className="flex items-center gap-1">
                    <span>Name</span>
                    <HeaderFilter label="Name" options={nameOptions} selected={nameFilter} onChange={setNameFilter} />
                  </div>
                </TableHead>
                <TableHead className="h-16 min-w-[240px]">
                  <div className="flex items-center gap-1">
                    <span>Dummy email</span>
                    <HeaderFilter
                      label="Dummy email"
                      options={emailOptions}
                      selected={emailFilter}
                      onChange={setEmailFilter}
                    />
                  </div>
                </TableHead>
                <TableHead className="h-16 min-w-[140px]">
                  <div className="flex items-center gap-1">
                    <span>Password</span>
                    <HeaderFilter
                      label="Password"
                      options={passwordOptions}
                      selected={passwordFilter}
                      onChange={setPasswordFilter}
                    />
                  </div>
                </TableHead>
                <TableHead className="h-16 min-w-[220px]">Request a change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={`${row.student.studentCode}-${row.dummyEmail}`}>
                  <TableCell className="py-3 text-[var(--color-curie-muted)]">{index + 1}</TableCell>
                  <TableCell className="py-3 font-semibold text-[var(--color-navy)]">{row.name}</TableCell>
                  <TableCell className="py-3 font-mono text-sm">{row.dummyEmail}</TableCell>
                  <TableCell className="py-3 font-mono text-sm">{row.password}</TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <ChangeRequestDialog
                        cohortSlug={cohortSlug}
                        collegeSlug={collegeSlug}
                        collegeName={collegeName}
                        target="student"
                        type="rename"
                        studentCode={row.student.studentCode}
                        currentName={row.name}
                        requestedFrom={requestedFrom}
                        triggerLabel="Rename"
                        triggerClassName="h-11 rounded-full px-3"
                      />
                      <ChangeRequestDialog
                        cohortSlug={cohortSlug}
                        collegeSlug={collegeSlug}
                        collegeName={collegeName}
                        target="student"
                        type="delete"
                        studentCode={row.student.studentCode}
                        currentName={row.name}
                        requestedFrom={requestedFrom}
                        triggerLabel="Delete"
                        triggerClassName="h-11 rounded-full px-3"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="text-[12px] text-[var(--color-curie-muted)]">
        Showing {rows.length} of {students.length} students at {collegeName}. Header filters stay
        inside this college. Student rename, add, and delete stay pending until admin approves them.
      </p>
    </div>
  );
}
