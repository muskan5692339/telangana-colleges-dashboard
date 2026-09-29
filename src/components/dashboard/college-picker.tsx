"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { CohortKind, College } from "@/lib/types";
import { asHeadcount, formatSelectionPct, selectionPct, selectionTone } from "@/lib/selection";
import { cn } from "@/lib/utils";

export function CollegePicker({
  colleges,
  cohortSlug,
  initialCollege,
  selectedCount: selectedCountOverride,
  kind = "monitoring",
  hrefBase = "/cohorts",
}: {
  colleges: College[];
  cohortSlug: string;
  initialCollege?: string;
  selectedCount?: number;
  kind?: CohortKind;
  hrefBase?: "/cohorts" | "/r" | "/student-view";
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [collegeSlug, setCollegeSlug] = useState(initialCollege ?? "");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const enrollment = kind === "enrollment";
  const selected = colleges.find((college) => college.slug === collegeSlug) ?? null;
  const selectedCount =
    selectedCountOverride ??
    (selected ? asHeadcount(selected.acceleratorSelected, selected.enrolled) : 0);
  const pct = selected ? selectionPct(selectedCount, selected.enrolled) : null;
  const tone = selectionTone(pct);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return colleges;
    return colleges.filter((college) => college.name.toLowerCase().includes(q));
  }, [colleges, query]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function onSelect(slug: string) {
    setCollegeSlug(slug);
    setOpen(false);
    setQuery("");
    const href =
      hrefBase === "/cohorts"
        ? `/cohorts/${cohortSlug}/colleges/${slug}`
        : `${hrefBase}/${cohortSlug}/${slug}`;
    router.push(href);
  }

  return (
    <div className="space-y-4">
      <div
        className="rounded-[20px] bg-white p-4 md:p-6"
        style={{
          border: "1px solid var(--color-curie-border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <label
          id="college-label"
          className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-curie-muted)]"
        >
          Select College
        </label>
        <div ref={rootRef} className="relative mt-2 max-w-xl">
          <button
            type="button"
            aria-labelledby="college-label"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => {
              setOpen((value) => !value);
              setQuery("");
            }}
            className="flex h-12 w-full items-center justify-between gap-3 rounded-lg border border-[var(--color-curie-border)] bg-[var(--color-cream)] px-3 text-left text-base"
          >
            <span className={cn("truncate", selected ? "font-semibold text-[var(--color-navy)]" : "text-[var(--color-curie-muted)]")}>
              {selected ? selected.name : "Choose a college"}
            </span>
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-[var(--color-curie-muted)]", open && "rotate-180")} />
          </button>
          {open && (
            <div
              className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl bg-white"
              style={{
                border: "1px solid var(--color-curie-border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div className="relative border-b border-[var(--color-curie-border)] p-2">
                <Search className="pointer-events-none absolute top-5 left-5 h-4 w-4 text-[var(--color-curie-muted)]" />
                <Input
                  ref={searchRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search college name"
                  aria-label="Search college name"
                  autoComplete="off"
                  className="h-12 rounded-xl bg-[var(--color-cream)] pl-10 text-base"
                />
              </div>
              {colleges.length === 0 ? (
                <p className="px-4 py-3 text-sm text-[var(--color-curie-muted)]">
                  No colleges are listed for this cohort yet.
                </p>
              ) : matches.length === 0 ? (
                <p className="px-4 py-3 text-sm text-[var(--color-curie-muted)]">
                  No college matches “{query.trim()}”.
                </p>
              ) : (
                <ul
                  className="max-h-[min(46vh,22rem)] overflow-y-auto overscroll-contain"
                  role="listbox"
                  aria-label="Colleges"
                >
                  {matches.map((college) => {
                    const active = college.slug === collegeSlug;
                    return (
                      <li key={college.slug}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => onSelect(college.slug)}
                          className={cn(
                            "flex min-h-14 w-full items-center px-4 py-3 text-left text-base font-semibold text-[var(--color-navy)]",
                            active ? "bg-[var(--color-curie-green-light)]" : "bg-white hover:bg-[var(--color-cream)]",
                          )}
                        >
                          {college.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
        {colleges.length === 0 && (
          <p className="mt-3 text-sm text-[var(--color-curie-muted)]">
            No colleges are listed for this cohort yet.
          </p>
        )}
      </div>

      {selected && (
        <div
          className="curie-rise rounded-[20px] bg-white p-4 md:p-6"
          style={{
            border: "1px solid var(--color-curie-border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-curie-muted)]">
            Selected college
          </p>
          <p className="font-display mt-1 text-xl font-bold text-[var(--color-navy)] md:text-2xl">
            {selected.name}
          </p>
          <div className={`mt-4 grid gap-3 ${enrollment ? "grid-cols-1 md:max-w-xs" : "grid-cols-3"}`}>
            <div className="rounded-2xl bg-[var(--color-cream)] px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-curie-muted)]">
                Enrolled
              </p>
              <p className="font-display text-2xl font-bold tabular-nums">{selected.enrolled}</p>
            </div>
            {!enrollment && (
              <>
                <div className="rounded-2xl bg-[var(--color-cream)] px-3 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-curie-muted)]">
                    Accelerator selected
                  </p>
                  <p
                    className="font-display text-2xl font-bold tabular-nums"
                    style={{ color: selectedCount === 0 ? "#b91c1c" : "var(--color-navy)" }}
                  >
                    {selectedCount}
                  </p>
                </div>
                <div className="rounded-2xl px-3 py-3" style={{ background: tone.bg }}>
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.1em]"
                    style={{ color: tone.fg }}
                  >
                    Selection %
                  </p>
                  <p className="font-display text-2xl font-bold tabular-nums" style={{ color: tone.fg }}>
                    {formatSelectionPct(pct)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
