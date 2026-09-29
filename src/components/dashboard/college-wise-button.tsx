"use client";

import { Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CollegeTable } from "@/components/dashboard/college-table";
import type { CohortKind, College } from "@/lib/types";

export function CollegeWiseButton({
  cohortSlug,
  label,
  colleges,
  trackedBySlug,
  kind = "monitoring",
}: {
  cohortSlug: string;
  label: string;
  colleges: College[];
  trackedBySlug: Record<string, number>;
  kind?: CohortKind;
}) {
  const enrollment = kind === "enrollment";
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="h-12 shrink-0 gap-2 rounded-full px-4 text-sm font-semibold md:px-5"
        >
          <Table2 className="h-4 w-4" />
          {enrollment ? "College-wise enrollment" : "College-wise selection"}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(92dvh,960px)] w-[min(1100px,calc(100%-1.25rem))] max-w-none flex-col gap-4 overflow-hidden p-4 sm:max-w-none md:p-6">
        <DialogHeader className="pr-12">
          <DialogTitle className="font-display text-xl text-[var(--color-navy)] md:text-2xl">
            {enrollment ? "College-wise enrollment" : "College-wise selection"}
          </DialogTitle>
          <DialogDescription>
            All {colleges.length} colleges in {label}. Search by name or screenshot the table.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
          <CollegeTable
            cohortSlug={cohortSlug}
            label={label}
            colleges={colleges}
            trackedBySlug={trackedBySlug}
            kind={kind}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
