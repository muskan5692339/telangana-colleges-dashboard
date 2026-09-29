import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { SESSION_COOKIE } from "@/lib/auth";
import { jsonError } from "@/lib/session";
import { isBatchId } from "@/lib/cohort-data";
import { BATCHES } from "@/lib/cohort-data";
import { parseWorkbook } from "@/lib/parse-excel";
import { readLiveStore, writeLiveStore } from "@/lib/live-store";
import { publishOverlay } from "@/lib/github-publish";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const jar = await cookies();
  if (jar.get(SESSION_COOKIE)?.value !== "1") {
    return jsonError("Sign in to upload source files.", 401);
  }

  const form = await request.formData();
  const batchId = String(form.get("batch") ?? "");
  const file = form.get("file");
  if (!isBatchId(batchId)) {
    return jsonError("Choose 3rd Year : Old Batch or 2nd Year : New Batch.");
  }
  if (!(file instanceof File) || file.size === 0) {
    return jsonError("Attach an .xlsx source file.");
  }
  if (file.size > 8 * 1024 * 1024) {
    return jsonError("File is larger than 8 MB.");
  }
  const name = file.name.toLowerCase();
  if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
    return jsonError("Upload an Excel workbook (.xlsx).");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = parseWorkbook(buffer);
  if (parsed.colleges.length === 0 && parsed.students.length === 0) {
    return jsonError(
      batchId === "inc13"
        ? "No enrollment rows were found. Use columns Dummy email, Password, Name, College (or Name of college, Name of the Student, Login ID, Password) and color the sheet tab."
        : "No college or student rows were found on color-coded sheets. Color the source tabs (Collegewise_Final Selection and Student Wise - Phase 2) and upload again.",
    );
  }

  const seed = BATCHES[batchId];
  const store = await readLiveStore();
  const record = {
    cohortSlug: seed.slug,
    batchId,
    fileName: file.name,
    sheets: parsed.usedSheets.length ? parsed.usedSheets : parsed.sheets,
    collegeCount: parsed.colleges.length,
    studentCount: parsed.students.length,
    uploadedAt: new Date().toISOString(),
  };
  const overlay = {
    colleges: parsed.colleges,
    students: parsed.students,
    sourceSheet: file.name,
    importedSheets: record.sheets,
  };
  store.batches[batchId] = overlay;
  store.uploads = [record, ...store.uploads.filter((item) => item.batchId !== batchId)].slice(0, 12);
  store.updatedAt = record.uploadedAt;
  await writeLiveStore(store);
  const uploadDir = process.env.VERCEL
    ? path.join("/tmp", "uploads")
    : path.join(process.cwd(), "data", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, `${batchId}.xlsx`), buffer);
  const publish = await publishOverlay(batchId, overlay, file.name);

  return NextResponse.json({
    ok: true,
    cohort: seed.label,
    fileName: file.name,
    colleges: parsed.colleges.length,
    students: parsed.students.length,
    acceleratorSelected: parsed.students.filter((student) => student.acceleratorSelected).length,
    sheets: record.sheets,
    skippedSheets: parsed.skippedSheets,
    publish,
  });
}
