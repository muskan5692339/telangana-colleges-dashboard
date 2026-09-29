"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Batch } from "@/lib/types";

export function SourceUploadForm({
  batch,
  lastFile,
}: {
  batch: Batch;
  lastFile?: string | null;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      toast.error("Choose an Excel file first.");
      return;
    }
    setPending(true);
    const data = new FormData();
    data.set("batch", batch.id);
    data.set("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: data });
    const payload = (await response.json().catch(() => null)) as
      | {
          error?: string;
          colleges?: number;
          students?: number;
          fileName?: string;
          skippedSheets?: string[];
        }
      | null;
    setPending(false);
    if (!response.ok) {
      toast.error(payload?.error ?? "Upload failed.");
      return;
    }
    const skipped =
      payload?.skippedSheets && payload.skippedSheets.length
        ? ` · skipped uncolored: ${payload.skippedSheets.join(", ")}`
        : "";
    toast.success(
      `${payload?.fileName ?? file.name} loaded · ${payload?.colleges ?? 0} colleges, ${payload?.students ?? 0} students${skipped}`,
    );
    setFile(null);
    window.location.reload();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[20px] bg-white p-4 md:p-6"
      style={{ border: "1px solid var(--color-curie-border)", boxShadow: "var(--shadow-card)" }}
    >
      <p className="font-display text-lg font-bold text-[var(--color-navy)]">{batch.label}</p>
      <p className="mt-1 text-sm text-[var(--color-curie-muted)]">
        Current source: {lastFile || batch.sourceSheet}
      </p>
      {batch.id === "inc10" ? (
        <p className="mt-1 text-[12px] text-[var(--color-curie-muted)]">
          3rd Year : Old Batch uses <span className="font-semibold">Inc10.0_Student_Facing_Monitoring.xlsx</span>{" "}
          (53 colleges). That is not the overall mastersheet filename.
        </p>
      ) : null}
      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-curie-border)] bg-[var(--color-cream)] px-4 py-6 text-center">
        <Upload className="h-5 w-5 text-[var(--color-navy)]" />
        <span className="mt-2 text-sm font-semibold text-[var(--color-navy)]">
          {file ? file.name : "Drop or choose .xlsx"}
        </span>
        <span className="mt-1 text-[12px] text-[var(--color-curie-muted)]">
          {batch.kind === "enrollment"
            ? "Student Enrollment: Dummy email, Password, Name, College. Color the source tab."
            : "Inc10.0_Student_Facing_Monitoring: College-wise selection and Student Wise - Phase 2. Color those tabs. This is not the Overall Monitoring Mastersheet."}
        </span>
        <input
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="sr-only"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>
      <Button type="submit" disabled={pending} className="mt-4 h-11 w-full rounded-full">
        {pending ? "Uploading…" : "Upload and replace this cohort"}
      </Button>
    </form>
  );
}
