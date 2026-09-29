import { Building2, GraduationCap, Sparkles, Target } from "lucide-react";
import type { Batch } from "@/lib/types";
import { batchStats, formatPct } from "@/lib/cohort-data";

export function KpiGrid({ batch }: { batch: Batch }) {
  const stats = batchStats(batch);
  const items = [
    {
      label: "Colleges",
      value: String(stats.collegeCount),
      hint: `${stats.collegesWithZeroSelection} with 0 accelerator selected`,
      icon: Building2,
      bg: "#E6F1FB",
      fg: "#185FA5",
    },
    {
      label: "Enrolled students",
      value: String(stats.enrolled),
      hint: `${stats.tracked} in the Phase 2 / enrollment tracker`,
      icon: GraduationCap,
      bg: "#EAF3DE",
      fg: "#3B6D11",
    },
    {
      label: "Accelerator selected",
      value: String(stats.acceleratorSelected),
      hint: `${formatPct(stats.selectionRate)} of enrolled`,
      icon: Sparkles,
      bg: "#FAEEDA",
      fg: "#854F0B",
    },
    {
      label: "Avg attendance",
      value: formatPct(stats.avgAttendance),
      hint:
        stats.avgFinal == null
          ? "Scores not yet in this batch"
          : `Avg final score ${Math.round(stats.avgFinal)}`,
      icon: Target,
      bg: "#EEEDFE",
      fg: "#534AB7",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="curie-rise relative overflow-hidden rounded-[20px] bg-white p-4 md:min-h-[132px] md:p-5"
            style={{
              border: "1px solid var(--color-curie-border)",
              boxShadow: "var(--shadow-card)",
              animationDelay: `${index * 40}ms`,
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-80 blur-2xl"
              style={{ background: item.bg }}
            />
            <div
              className="relative flex h-10 w-10 items-center justify-center rounded-[14px]"
              style={{
                background: `linear-gradient(135deg, ${item.bg} 0%, color-mix(in oklab, ${item.bg} 70%, white) 100%)`,
                color: item.fg,
              }}
            >
              <Icon className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <p className="relative mt-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-curie-muted)]">
              {item.label}
            </p>
            <p className="relative mt-0.5 font-display text-2xl font-bold text-[var(--color-navy)] md:text-3xl">
              {item.value}
            </p>
            <p className="relative mt-1 text-[11px] leading-snug text-[var(--color-curie-muted)]">
              {item.hint}
            </p>
          </div>
        );
      })}
    </div>
  );
}
