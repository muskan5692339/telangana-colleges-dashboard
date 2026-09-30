import { AppShell } from "@/components/layout/app-shell";
import { CollegePicker } from "@/components/dashboard/college-picker";
import { AssignmentStatusButton } from "@/components/dashboard/assignment-status-button";
import { CollegeWiseButton } from "@/components/dashboard/college-wise-button";
import { EnrollmentTable } from "@/components/dashboard/enrollment-table";
import { StudentTable } from "@/components/dashboard/student-table";
import { Trail } from "@/components/dashboard/trail";
import {
  collegesForCohort,
  studentsForCollege,
  acceleratorSelectedCount,
  studentsTrackedByCollege,
} from "@/lib/cohort-data";
import type { Batch, College } from "@/lib/types";

export function CollegeSelectionView({
  cohort,
  selected,
}: {
  cohort: Batch;
  selected: College | null;
}) {
  const colleges = collegesForCohort(cohort);
  const students = selected ? studentsForCollege(cohort, selected.slug) : [];
  const selectedCount = selected ? acceleratorSelectedCount(selected, students) : undefined;
  const trackedBySlug = studentsTrackedByCollege(cohort);
  const enrollment = cohort.kind === "enrollment";

  return (
    <AppShell title={cohort.label} subtitle="Telangana Colleges Dashboard">
      <div className="mx-auto w-full max-w-[1600px] space-y-5 px-4 py-5 pb-24 md:px-8 md:py-8 md:pb-8">
        <Trail
          items={[
            { label: "Cohorts", href: "/cohorts" },
            { label: cohort.label, href: `/cohorts/${cohort.slug}` },
            ...(selected ? [{ label: selected.name }] : []),
          ]}
        />
        <div className="flex flex-row items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-[22px] font-semibold text-[var(--color-navy)] md:text-3xl">
              {cohort.label}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--color-curie-muted)] md:text-base">
              {enrollment
                ? "Student enrollment for the VigyanShaala tablet app. Select a college to see name, dummy email, and password. College-wise enrollment is an extra view in the top right."
                : "Colleges listed here belong only to this cohort. Select a college to see its student-wise sheet. College-wise nomination and selection is in the top right."}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row">
            {!enrollment && (
              <AssignmentStatusButton label={cohort.label} students={cohort.students} showSelection />
            )}
            <CollegeWiseButton
              cohortSlug={cohort.slug}
              label={cohort.label}
              colleges={colleges}
              trackedBySlug={trackedBySlug}
              kind={cohort.kind}
            />
          </div>
        </div>
        <CollegePicker
          key={selected?.slug ?? "none"}
          colleges={colleges}
          cohortSlug={cohort.slug}
          initialCollege={selected?.slug}
          selectedCount={selectedCount}
          kind={cohort.kind}
        />
        {selected &&
          (enrollment ? (
            <EnrollmentTable
              key={selected.slug}
              students={students}
              collegeName={selected.name}
              collegeSlug={selected.slug}
              cohortSlug={cohort.slug}
              requestedFrom="staff-dashboard"
            />
          ) : (
            <StudentTable
              key={selected.slug}
              students={students}
              collegeName={selected.name}
            />
          ))}
      </div>
    </AppShell>
  );
}
