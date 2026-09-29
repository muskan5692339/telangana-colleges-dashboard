"use client";

import { useMemo, useState } from "react";
import { Check, Funnel } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
  );
}

export function matchesHeaderFilter(value: string, selected: Set<string> | null) {
  if (!selected) return true;
  return selected.has(value);
}

export function HeaderFilter({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: Set<string> | null;
  onChange: (next: Set<string> | null) => void;
}) {
  const [query, setQuery] = useState("");
  const active = selected != null;
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.toLowerCase().includes(q));
  }, [options, query]);

  function toggle(option: string) {
    const current = selected ?? new Set(options);
    const next = new Set(current);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    if (next.size === 0) {
      onChange(new Set());
      return;
    }
    onChange(next.size === options.length ? null : next);
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) setQuery("");
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Filter ${label}`}
          className={cn(
            "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full",
            active
              ? "bg-[var(--color-curie-green-light)] text-[var(--color-navy)]"
              : "text-[var(--color-curie-muted)] hover:bg-white",
          )}
        >
          <Funnel className={cn("h-4 w-4", active && "fill-current")} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="!w-[280px] min-w-[280px] max-w-[calc(100vw-2rem)] p-2"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <p className="px-1.5 pb-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-curie-muted)]">
          Filter {label}
        </p>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${label.toLowerCase()}`}
          aria-label={`Search ${label} filter`}
          className="mb-2 h-11 text-base"
          onKeyDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        />
        <DropdownMenuItem
          className="min-h-11 cursor-pointer text-base"
          onSelect={(event) => {
            event.preventDefault();
            onChange(null);
          }}
        >
          Show all
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          {visible.length === 0 ? (
            <p className="px-2 py-3 text-sm text-[var(--color-curie-muted)]">No matches</p>
          ) : (
            visible.map((option) => {
              const checked = selected == null || selected.has(option);
              return (
                <DropdownMenuItem
                  key={option}
                  className="min-h-11 cursor-pointer justify-between gap-2 text-base"
                  onSelect={(event) => {
                    event.preventDefault();
                    toggle(option);
                  }}
                >
                  <span className="min-w-0 whitespace-normal break-words text-left">{option}</span>
                  {checked ? <Check className="h-4 w-4 shrink-0" /> : <span className="w-4 shrink-0" />}
                </DropdownMenuItem>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
