"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { CohortKind, College } from "@/lib/types";
import { EmptyState } from "@/components/feedback/feedback";
import { CaptureButton } from "@/components/dashboard/capture-button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { asHeadcount, formatSelectionPct, selectionPct, selectionTone } from "@/lib/selection";

export function CollegeTable({
  cohortSlug,
  label,
  colleges,
  trackedBySlug,
  kind = "monitoring",
}: {
  cohortSlug: string;
  label: string;
  colleges: College[];
  trackedBySlug: Record<string, number>;
  kind?: CohortKind;
}) {
  const [query, setQuery] = useState("");
  const captureRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return colleges;
    return colleges.filter((college) => college.name.toLowerCase().includes(q));
  }, [colleges, query]);

  if (colleges.length === 0) {
    return (
      <EmptyState
        message="No colleges in this batch yet"
        hint={
          kind === "enrollment"
            ? "Import the Student Enrollment sheet to populate this view."
            : "Import the college-wise selection sheet to populate this view."
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-3.5 left-3 h-5 w-5 text-[var(--color-curie-muted)]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search college name"
            aria-label="Search college name"
            className="h-12 rounded-2xl bg-white pl-11 text-base"
          />
        </div>
        <CaptureButton
          targetRef={captureRef}
          filename={`${label}-${kind === "enrollment" ? "college-wise-enrollment" : "college-wise-selection"}`}
          label="Screenshot table"
        />
      </div>
      <div
        ref={captureRef}
        className="overflow-x-auto rounded-[20px] bg-white"
        style={{ border: "1px solid var(--color-curie-border)", boxShadow: "var(--shadow-card)" }}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-[#fbf4ea] hover:bg-[#fbf4ea]">
              <TableHead className="h-12 w-12 text-[var(--color-navy)]">Sno.</TableHead>
              <TableHead className="h-12 text-[var(--color-navy)]">Name of college</TableHead>
              <TableHead className="h-12 text-right text-[var(--color-navy)]">No. of students</TableHead>
              {kind !== "enrollment" && (
                <>
                  <TableHead className="h-12 text-right text-[var(--color-navy)]">Accelerator selected</TableHead>
                  <TableHead className="h-12 text-[var(--color-navy)]">Selection %</TableHead>
                </>
              )}
              <TableHead className="h-12 text-right text-[var(--color-navy)]">In tracker</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={kind === "enrollment" ? 4 : 6} className="h-16 text-center text-[var(--color-curie-muted)]">
                  No college matches “{query.trim()}”.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((college) => (
                <CollegeRow
                  key={college.slug}
                  college={college}
                  index={colleges.findIndex((item) => item.slug === college.slug) + 1}
                  cohortSlug={cohortSlug}
                  tracked={trackedBySlug[college.slug] ?? 0}
                  enrollment={kind === "enrollment"}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-[12px] text-[var(--color-curie-muted)]">
        Showing {rows.length} of {colleges.length} colleges. Tap a name to open its student sheet.
      </p>
    </div>
  );
}

function CollegeRow({
  college,
  index,
  cohortSlug,
  tracked,
  enrollment,
}: {
  college: College;
  index: number;
  cohortSlug: string;
  tracked: number;
  enrollment: boolean;
}) {
  const selectedCount = asHeadcount(college.acceleratorSelected, college.enrolled);
  const pct = selectionPct(selectedCount, college.enrolled);
  const tone = selectionTone(pct);
  const zero = selectedCount === 0;

  return (
    <TableRow>
      <TableCell className="py-3 text-[var(--color-curie-muted)]">{index}</TableCell>
      <TableCell className="py-3">
        <Link
          href={`/cohorts/${cohortSlug}/colleges/${college.slug}`}
          className="inline-flex min-h-11 items-center font-semibold text-[var(--color-navy)]"
        >
          {college.name}
        </Link>
      </TableCell>
      <TableCell className="py-3 text-right text-base tabular-nums">{college.enrolled}</TableCell>
      {!enrollment && (
        <>
          <TableCell
            className="py-3 text-right text-base font-bold tabular-nums"
            style={{ color: zero ? "#b91c1c" : "var(--color-navy)" }}
          >
            {selectedCount}
          </TableCell>
          <TableCell className="py-3">
            <span
              className="inline-flex min-h-8 min-w-[3.5rem] items-center justify-center rounded-md px-2 py-1 text-sm font-bold tabular-nums"
              style={{ background: tone.bg, color: tone.fg }}
            >
              {formatSelectionPct(pct)}
            </span>
          </TableCell>
        </>
      )}
      <TableCell className="py-3 text-right tabular-nums text-[var(--color-curie-muted)]">
        {tracked}
      </TableCell>
    </TableRow>
  );
}
