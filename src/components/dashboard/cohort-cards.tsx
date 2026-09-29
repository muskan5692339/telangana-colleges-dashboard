import Link from "next/link";
import { ChevronRight, GraduationCap, Sparkles } from "lucide-react";
import type { Batch } from "@/lib/types";
import { collegesForCohort } from "@/lib/cohort-data";

const CARD = {
  "3rd-year-old-batch": { bg: "#E6F1FB", fg: "#185FA5", icon: GraduationCap },
  "2nd-year-new-batch": { bg: "#EAF3DE", fg: "#3B6D11", icon: Sparkles },
} as const;

export function CohortCards({
  cohorts,
  hrefBase = "/cohorts",
}: {
  cohorts: Batch[];
  hrefBase?: "/cohorts" | "/r" | "/student-view";
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 md:gap-5">
      {cohorts.map((cohort, index) => {
        const style = CARD[cohort.slug];
        const Icon = style.icon;
        const collegeCount = collegesForCohort(cohort).length;
        return (
          <Link
            key={cohort.slug}
            href={`${hrefBase}/${cohort.slug}`}
            className="curie-rise group relative flex min-h-[160px] flex-col gap-3 overflow-hidden rounded-[20px] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] md:min-h-[200px] md:p-6"
            style={{
              border: "1px solid var(--color-curie-border)",
              boxShadow: "var(--shadow-card)",
              animationDelay: `${index * 40}ms`,
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-80 blur-2xl"
              style={{ background: style.bg }}
            />
            <div className="relative flex items-start justify-between">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-[16px]"
                style={{
                  background: `linear-gradient(135deg, ${style.bg} 0%, color-mix(in oklab, ${style.bg} 70%, white) 100%)`,
                  color: style.fg,
                }}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={2.2} />
              </div>
              <ChevronRight className="h-5 w-5 text-[var(--color-navy)] transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="relative">
              <p className="font-display text-[17px] font-bold leading-tight text-[var(--color-navy)] md:text-xl">
                {cohort.label}
              </p>
              <p className="mt-1 text-[12px] leading-snug text-[var(--color-curie-muted)] md:text-sm">
                {collegeCount} colleges
                {cohort.kind === "enrollment" ? " · tablet enrollment" : " in this cohort"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
