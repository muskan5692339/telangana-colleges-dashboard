"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, GraduationCap, Plus, Sparkles, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STUDENT_VIEW_BASE } from "@/lib/public-path";
import type { CohortKind, CohortSlug } from "@/lib/types";

const STORAGE_KEY = "telangana-student-view-hidden";

export type StudentViewCard = {
  slug: CohortSlug;
  label: string;
  kind: CohortKind;
  collegeCount: number;
};

const CARD = {
  "3rd-year-old-batch": { bg: "#E6F1FB", fg: "#185FA5", icon: GraduationCap },
  "2nd-year-new-batch": { bg: "#EAF3DE", fg: "#3B6D11", icon: Sparkles },
} as const;

export function StudentViewPicker({ cards }: { cards: StudentViewCard[] }) {
  const [hidden, setHidden] = useState<string[] | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      setHidden(Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : []);
    } catch {
      setHidden([]);
    }
  }, []);

  const hiddenSet = new Set(hidden ?? []);
  const closed = cards.filter((card) => hiddenSet.has(card.slug));

  function save(next: string[]) {
    setHidden(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function closeCard(slug: string) {
    save([...hiddenSet, slug]);
  }

  function addCard(slug: string) {
    save([...hiddenSet].filter((item) => item !== slug));
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 md:gap-5">
        {cards.map((card) =>
          hiddenSet.has(card.slug) ? (
            <div key={card.slug} className="hidden md:block" />
          ) : (
            <CohortCard key={card.slug} card={card} onClose={() => closeCard(card.slug)} />
          ),
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Add a view"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--color-navy)] px-4 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Add view
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[280px] p-2">
          <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-curie-muted)]">
            Existing views
          </p>
          {closed.length === 0 ? (
            <DropdownMenuItem disabled className="min-h-11 text-sm">
              All views are already shown
            </DropdownMenuItem>
          ) : (
            closed.map((card) => (
              <DropdownMenuItem
                key={card.slug}
                className="min-h-11 cursor-pointer whitespace-normal text-sm"
                onSelect={() => addCard(card.slug)}
              >
                {card.label}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function CohortCard({ card, onClose }: { card: StudentViewCard; onClose: () => void }) {
  const style = CARD[card.slug];
  const Icon = style.icon;
  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Close ${card.label}`}
        onClick={onClose}
        className="absolute top-3 right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--color-navy)]"
        style={{ border: "1px solid var(--color-curie-border)", boxShadow: "var(--shadow-card)" }}
      >
        <X className="h-4 w-4" />
      </button>
      <Link
        href={`${STUDENT_VIEW_BASE}/${card.slug}`}
        className="curie-rise group relative flex min-h-[160px] flex-col gap-3 overflow-hidden rounded-[20px] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] md:min-h-[200px] md:p-6"
        style={{
          border: "1px solid var(--color-curie-border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-80 blur-2xl"
          style={{ background: style.bg }}
        />
        <div className="relative flex items-start justify-between pr-12">
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
            {card.label}
          </p>
          <p className="mt-1 text-[12px] leading-snug text-[var(--color-curie-muted)] md:text-sm">
            {card.collegeCount} colleges
            {card.kind === "enrollment" ? " · tablet enrollment" : " in this cohort"}
          </p>
        </div>
      </Link>
    </div>
  );
}
