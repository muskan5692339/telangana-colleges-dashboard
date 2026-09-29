"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Row = {
  collegeName: string;
  enrolled: number;
  url: string;
};

export function ShareLinkList({
  cohorts,
  hubUrl,
}: {
  cohorts: { label: string; rows: Row[] }[];
  hubUrl?: string;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const allText = [hubUrl, ...cohorts
    .map((cohort) => {
      const lines = cohort.rows.map((row) => `${row.collegeName}\n${row.url}`);
      return `${cohort.label}\n${lines.join("\n\n")}`;
    })].filter(Boolean).join("\n\n");

  async function copy(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast.success("Copied");
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Could not copy. Select the link and copy it.");
    }
  }

  return (
    <div className="space-y-6">
      <Button
        type="button"
        className="h-11 rounded-full"
        onClick={() => copy("all", allText)}
      >
        {copied === "all" ? "Copied full list" : "Copy full responder list"}
      </Button>

      {cohorts.map((cohort) => (
        <section
          key={cohort.label}
          className="overflow-hidden rounded-[20px] bg-white"
          style={{ border: "1px solid var(--color-curie-border)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between gap-3 bg-[#fbf4ea] px-4 py-3">
            <h3 className="font-display text-lg font-bold text-[var(--color-navy)]">{cohort.label}</h3>
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-full"
              onClick={() =>
                copy(
                  cohort.label,
                  `${cohort.label}\n${cohort.rows.map((row) => `${row.collegeName}\n${row.url}`).join("\n\n")}`,
                )
              }
            >
              Copy this cohort
            </Button>
          </div>
          <ul className="divide-y divide-[var(--color-curie-border)]">
            {cohort.rows.map((row) => (
              <li key={row.url} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--color-navy)]">{row.collegeName}</p>
                  <p className="text-[12px] text-[var(--color-curie-muted)]">{row.enrolled} enrolled</p>
                  <p className="mt-1 break-all text-[12px] text-[var(--color-navy)]">{row.url}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 shrink-0 rounded-full"
                  onClick={() => copy(row.url, row.url)}
                >
                  {copied === row.url ? "Copied" : "Copy link"}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export type { Row as ShareRow };
