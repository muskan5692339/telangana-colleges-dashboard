"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SUBJECT_AREAS, studentRequestName, type ChangeRequestTarget, type ChangeRequestType } from "@/lib/types";

export function ChangeRequestDialog({
  cohortSlug,
  collegeSlug,
  collegeName,
  target,
  type,
  studentCode,
  currentName,
  requestedFrom,
  triggerLabel,
  triggerClassName,
}: {
  cohortSlug: string;
  collegeSlug: string;
  collegeName: string;
  target: ChangeRequestTarget;
  type: ChangeRequestType;
  studentCode?: string;
  currentName?: string;
  requestedFrom: string;
  triggerLabel: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [proposedName, setProposedName] = useState(type === "rename" ? currentName ?? "" : "");
  const [subjectArea, setSubjectArea] = useState("");
  const [reason, setReason] = useState("");

  const title =
    target === "college"
      ? type === "add"
        ? "Request a new college"
        : type === "delete"
          ? `Request deletion of ${collegeName}`
          : `Request a college rename`
      : type === "add"
        ? "Request a new student"
        : type === "delete"
          ? `Request deletion of ${currentName || studentCode}`
          : `Request a student rename`;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        cohortSlug,
        collegeSlug,
        collegeName,
        target,
        type,
        studentCode,
        proposedName,
        subjectArea,
        reason,
        requestedFrom,
      }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setPending(false);
    if (!response.ok) {
      toast.error(payload?.error ?? "Could not send this request.");
      return;
    }
    toast.success(
      type === "add"
        ? "Request sent. Admin will enroll this student from the backend and allot dummy email and password."
        : "Request sent. Admin will approve it from the backend.",
    );
    setOpen(false);
    setProposedName(type === "rename" ? currentName ?? "" : "");
    setSubjectArea("");
    setReason("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className={triggerClassName ?? "h-11 rounded-full px-4"}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-5 sm:max-w-md">
        <DialogHeader className="pr-10">
          <DialogTitle className="font-display text-xl text-[var(--color-navy)]">{title}</DialogTitle>
          <DialogDescription>
            {type === "add" && target === "student"
              ? "Enter the student name in capital letters and the subject area. Program team enrolls from the backend and allots dummy email and password."
              : "This does not change live data yet. Program team approves rename, add, and delete requests from Admin → Requests."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          {type !== "delete" && (
            <div className="space-y-1.5">
              <Label htmlFor={`name-${studentCode ?? collegeSlug}-${type}`}>
                {target === "college" ? "College name" : "Student name"}
              </Label>
              <Input
                id={`name-${studentCode ?? collegeSlug}-${type}`}
                value={proposedName}
                onChange={(event) =>
                  setProposedName(
                    target === "student" ? studentRequestName(event.target.value) : event.target.value,
                  )
                }
                placeholder={target === "student" && type === "add" ? "A SADHANA" : undefined}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                className={`h-12 text-base${target === "student" ? " uppercase" : ""}`}
                required
              />
            </div>
          )}
          {target === "student" && type === "add" && (
            <div className="space-y-1.5">
              <Label htmlFor={`subject-${collegeSlug}`}>Subject Area</Label>
              <Input
                id={`subject-${collegeSlug}`}
                list={`subject-areas-${collegeSlug}`}
                value={subjectArea}
                onChange={(event) => setSubjectArea(event.target.value)}
                placeholder="e.g. BZC, MSCs, MPCs"
                className="h-12 text-base"
                required
              />
              <datalist id={`subject-areas-${collegeSlug}`}>
                {SUBJECT_AREAS.map((area) => (
                  <option key={area} value={area} />
                ))}
              </datalist>
            </div>
          )}
          {type !== "add" && (
            <div className="space-y-1.5">
              <Label htmlFor={`reason-${studentCode ?? collegeSlug}-${type}`}>Reason</Label>
              <textarea
                id={`reason-${studentCode ?? collegeSlug}-${type}`}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[var(--color-curie-border)] bg-white px-3 py-2 text-base"
                placeholder="Why this change is needed"
              />
            </div>
          )}
          <Button type="submit" disabled={pending} className="h-12 w-full rounded-full">
            {pending ? "Sending…" : "Send to admin"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
