"use client";

import { Funnel } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StudentTable } from "@/components/dashboard/student-table";
import type { Student } from "@/lib/types";

export function AssignmentStatusButton({
  label,
  students,
  showSelection = false,
}: {
  label: string;
  students: Student[];
  showSelection?: boolean;
}) {
  const rows = showSelection
    ? students
    : students.map((student) => ({ ...student, acceleratorSelected: false }));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" className="h-12 shrink-0 gap-2 rounded-full px-4 text-sm font-semibold md:px-5">
          <Funnel className="h-4 w-4" />
          Assignment status
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(92dvh,960px)] w-[min(1200px,calc(100%-1.25rem))] max-w-none flex-col gap-4 overflow-hidden p-4 sm:max-w-none md:p-6">
        <DialogHeader className="pr-12">
          <DialogTitle className="font-display text-xl text-[var(--color-navy)] md:text-2xl">
            Assignment status · all colleges
          </DialogTitle>
          <DialogDescription>
            All {students.length} students in {label}. Use the funnel on each assignment column to filter by
            status, and the college funnel to narrow to one college.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
          <StudentTable students={rows} collegeName={label} showCollege showSelection={showSelection} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
