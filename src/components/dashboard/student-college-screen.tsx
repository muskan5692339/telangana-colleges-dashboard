import { EnrollmentTable } from "@/components/dashboard/enrollment-table";
import { StudentTable } from "@/components/dashboard/student-table";
import { StudentShell } from "@/components/dashboard/student-shell";
import { acceleratorSelectedCount, getCollege, studentsForCollege } from "@/lib/cohort-data";
import { formatSelectionPct, selectionPct, selectionTone } from "@/lib/selection";
import { MYTRIBE_APP_URL, type Batch } from "@/lib/types";
import { studentViewPath } from "@/lib/share";

export function StudentCollegeScreen({
  cohort,
  collegeSlug,
}: {
  cohort: Batch;
  collegeSlug: string;
}) {
  const college = getCollege(cohort, collegeSlug);
  if (!college) return null;

  const students = studentsForCollege(cohort, college.slug);
  const selectedCount = acceleratorSelectedCount(college, students);
  const pct = selectionPct(selectedCount, college.enrolled);
  const tone = selectionTone(pct);
  const enrollment = cohort.kind === "enrollment";

  return (
    <StudentShell
      title={college.name}
      subtitle={`${cohort.label} · ${enrollment ? "tablet enrollment" : "college view"} · no login`}
      backHref={studentViewPath(cohort.slug)}
      backLabel="Back to colleges"
    >
      {enrollment ? (
        <>
          <EnrollmentTable
            students={students}
            collegeName={college.name}
            collegeSlug={college.slug}
            cohortSlug={cohort.slug}
            requestedFrom="college-tablet"
          />
          <p className="pb-6 text-[12px] text-[var(--color-curie-muted)]">
            Sign in at {MYTRIBE_APP_URL}. Name change requests go to program-team admin. This page
            does not use the staff dashboard login.
          </p>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:max-w-2xl">
            <div
              className="rounded-[20px] bg-white px-4 py-3"
              style={{
                border: "1px solid var(--color-curie-border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-curie-muted)]">
                Enrolled
              </p>
              <p className="font-display text-2xl font-bold tabular-nums text-[var(--color-navy)]">
                {college.enrolled}
              </p>
            </div>
            <div
              className="rounded-[20px] bg-white px-4 py-3"
              style={{
                border: "1px solid var(--color-curie-border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
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
            <div
              className="rounded-[20px] px-4 py-3"
              style={{
                background: tone.bg,
                border: "1px solid var(--color-curie-border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: tone.fg }}>
                Selection %
              </p>
              <p className="font-display text-2xl font-bold tabular-nums" style={{ color: tone.fg }}>
                {formatSelectionPct(pct)}
              </p>
            </div>
          </div>
          <StudentTable students={students} collegeName={college.name} />
          <p className="pb-6 text-[12px] text-[var(--color-curie-muted)]">
            Read-only college view. This link shows {college.name} only. No staff login.
          </p>
        </>
      )}
    </StudentShell>
  );
}
