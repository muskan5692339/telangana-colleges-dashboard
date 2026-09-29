import { ASSIGNMENT_COLUMNS } from "@/lib/types";
import type { Student } from "@/lib/types";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatPct, formatScore } from "@/lib/cohort-data";

export function StudentDetail({
  student,
  onClose,
}: {
  student: Student | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={!!student} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        {student && (
          <>
            <SheetHeader>
              <SheetTitle className="font-display">{student.name}</SheetTitle>
              <SheetDescription>
                {student.studentCode} · {student.role} · {student.collegeName}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 px-4 pb-6">
              <p className="text-sm text-[var(--color-curie-muted)]">{student.email}</p>
              {student.acceleratorSelected && (
                <p
                  className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em]"
                  style={{
                    background: "var(--color-curie-green-light)",
                    color: "#3d6b28",
                  }}
                >
                  Accelerator selected
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <ScoreTile label="Attendance" value={formatPct(student.attendancePct)} />
                <ScoreTile label="Quiz" value={formatScore(student.quizScore)} />
                <ScoreTile label="Assignment" value={formatScore(student.assignmentScore)} />
                <ScoreTile label="Final score" value={formatScore(student.finalScore)} />
              </div>
              <div>
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-curie-muted)]">
                  Phase 2 assignments
                </h3>
                <ul className="space-y-2">
                  {ASSIGNMENT_COLUMNS.map((col) => (
                    <li
                      key={col.key}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-curie-border)] bg-[var(--color-cream)] px-3 py-2.5"
                    >
                      <span className="text-[12px] font-semibold text-[var(--color-navy)]">
                        {col.label}
                      </span>
                      <StatusBadge status={student.assignments[col.key]} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ScoreTile({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl bg-white p-3"
      style={{ border: "1px solid var(--color-curie-border)" }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-curie-muted)]">
        {label}
      </p>
      <p className="font-display mt-1 text-xl font-bold text-[var(--color-navy)]">{value}</p>
    </div>
  );
}
