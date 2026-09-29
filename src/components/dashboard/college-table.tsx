"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { CohortKind, College } from "@/lib/types";
import { EmptyState } from "@/components/feedback/feedback";
import { CaptureButton } from "@/components/dashboard/capture-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { asHeadcount, formatSelectionPct, selectionPct, selectionTone } from "@/lib/selection";

export function CollegeTable({
  cohortSlug,
  label,
  colleges,
  trackedBySlug,
  kind = "monitoring",
  hrefBase = "/cohorts",
  activeSlug,
}: {
  cohortSlug: string;
  label: string;
  colleges: College[];
  trackedBySlug: Record<string, number>;
  kind?: CohortKind;
  hrefBase?: "/cohorts" | "/student-view";
  activeSlug?: string;
}) {
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const captureRef = useRef<HTMLDivElement>(null);
  const enrollment = kind === "enrollment";

  const ranked = useMemo(() => {
    const withScore = colleges.map((college) => {
      const selected = asHeadcount(college.acceleratorSelected, college.enrolled);
      return {
        college,
        selected,
        pct: selectionPct(selected, college.enrolled) ?? -1,
      };
    });
    if (enrollment) {
      return withScore.map((row, index) => ({ ...row, rank: index + 1 }));
    }
    return withScore
      .sort(
        (a, b) =>
          b.pct - a.pct ||
          b.selected - a.selected ||
          a.college.name.localeCompare(b.college.name),
      )
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }, [colleges, enrollment]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ranked;
    return ranked.filter((row) => row.college.name.toLowerCase().includes(q));
  }, [ranked, query]);

  const totals = useMemo(() => {
    return rows.reduce(
      (sum, row) => {
        const nominated = trackedBySlug[row.college.slug] ?? 0;
        return {
          enrolled: sum.enrolled + row.college.enrolled,
          nominated: sum.nominated + nominated,
          selected: sum.selected + row.selected,
        };
      },
      { enrolled: 0, nominated: 0, selected: 0 },
    );
  }, [rows, trackedBySlug]);

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
      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(draft);
        }}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-3.5 left-3 h-5 w-5 text-[var(--color-curie-muted)]" />
            <Input
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setQuery(event.target.value);
              }}
              placeholder="Search college"
              aria-label="Search college"
              className="h-12 rounded-2xl bg-white pl-11 text-base"
            />
          </div>
          <Button type="submit" className="h-12 rounded-full px-5">
            Search college
          </Button>
        </div>
        <CaptureButton
          targetRef={captureRef}
          filename={`${label}-${enrollment ? "college-wise-enrollment" : "college-wise-nomination-selection"}`}
          label="Screenshot table"
        />
      </form>
      <div
        ref={captureRef}
        className="overflow-x-auto rounded-[20px] bg-white"
        style={{ border: "1px solid var(--color-curie-border)", boxShadow: "var(--shadow-card)" }}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-[#fbf4ea] hover:bg-[#fbf4ea]">
              <TableHead className="h-12 w-16 text-[var(--color-navy)]">
                {enrollment ? "Sno." : "Rank"}
              </TableHead>
              <TableHead className="h-12 text-[var(--color-navy)]">Name of college</TableHead>
              <TableHead className="h-12 text-right text-[var(--color-navy)]">No. of students</TableHead>
              {enrollment ? (
                <TableHead className="h-12 text-right text-[var(--color-navy)]">In tracker</TableHead>
              ) : (
                <>
                  <TableHead className="h-12 text-right text-[var(--color-navy)]">Nomination</TableHead>
                  <TableHead className="h-12 text-right text-[var(--color-navy)]">Accelerator selected</TableHead>
                  <TableHead className="h-12 text-[var(--color-navy)]">Selection %</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={enrollment ? 4 : 6} className="h-16 text-center text-[var(--color-curie-muted)]">
                  No college matches “{query.trim()}”.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <CollegeRow
                  key={row.college.slug}
                  college={row.college}
                  index={row.rank}
                  cohortSlug={cohortSlug}
                  tracked={trackedBySlug[row.college.slug] ?? 0}
                  enrollment={enrollment}
                  hrefBase={hrefBase}
                  active={row.college.slug === activeSlug}
                />
              ))
            )}
          </TableBody>
          {!enrollment && rows.length > 0 && (
            <TableFooter>
              <TableRow className="bg-[#fbf4ea] hover:bg-[#fbf4ea]">
                <TableCell className="py-3 font-bold text-[var(--color-navy)]" colSpan={2}>
                  All colleges
                </TableCell>
                <TableCell className="py-3 text-right font-bold tabular-nums text-[var(--color-navy)]">
                  {totals.enrolled}
                </TableCell>
                <TableCell className="py-3 text-right font-bold tabular-nums text-[var(--color-navy)]">
                  {totals.nominated}
                </TableCell>
                <TableCell className="py-3 text-right font-bold tabular-nums text-[var(--color-navy)]">
                  {totals.selected}
                </TableCell>
                <TableCell className="py-3">
                  <span className="inline-flex min-h-8 min-w-[3.5rem] items-center justify-center rounded-md bg-white px-2 py-1 text-sm font-bold tabular-nums text-[var(--color-navy)]">
                    {formatSelectionPct(selectionPct(totals.selected, totals.enrolled))}
                  </span>
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
      <p className="text-[12px] text-[var(--color-curie-muted)]">
        Showing {rows.length} of {colleges.length} colleges.
        {enrollment
          ? " Tap a name to open its student sheet."
          : " Ranked by selection % from high to low. Nomination is Phase 2 selected. Tap a name to open its student sheet."}
      </p>
    </div>
  );
}

function collegeHref(hrefBase: "/cohorts" | "/student-view", cohortSlug: string, slug: string) {
  if (hrefBase === "/student-view") return `/student-view/${cohortSlug}/${slug}`;
  return `/cohorts/${cohortSlug}/colleges/${slug}`;
}

function CollegeRow({
  college,
  index,
  cohortSlug,
  tracked,
  enrollment,
  hrefBase,
  active = false,
}: {
  college: College;
  index: number;
  cohortSlug: string;
  tracked: number;
  enrollment: boolean;
  hrefBase: "/cohorts" | "/student-view";
  active?: boolean;
}) {
  const selectedCount = asHeadcount(college.acceleratorSelected, college.enrolled);
  const pct = selectionPct(selectedCount, college.enrolled);
  const tone = selectionTone(pct);
  const zero = selectedCount === 0;

  return (
    <TableRow className={active ? "bg-[var(--color-curie-green-light)] hover:bg-[var(--color-curie-green-light)]" : undefined}>
      <TableCell className="py-3 text-[var(--color-curie-muted)]">{index}</TableCell>
      <TableCell className="py-3">
        <Link
          href={collegeHref(hrefBase, cohortSlug, college.slug)}
          className="inline-flex min-h-11 items-center font-semibold text-[var(--color-navy)]"
        >
          {college.name}
        </Link>
      </TableCell>
      <TableCell className="py-3 text-right text-base tabular-nums">{college.enrolled}</TableCell>
      {enrollment ? (
        <TableCell className="py-3 text-right tabular-nums text-[var(--color-curie-muted)]">
          {tracked}
        </TableCell>
      ) : (
        <>
          <TableCell className="py-3 text-right text-base tabular-nums">{tracked}</TableCell>
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
    </TableRow>
  );
}
