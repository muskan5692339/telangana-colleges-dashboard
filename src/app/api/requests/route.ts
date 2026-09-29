import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";
import { jsonError } from "@/lib/session";
import { getCohortBySlug, isCohortSlug } from "@/lib/cohort-data";
import { readLiveStore, writeLiveStore } from "@/lib/live-store";
import { studentRequestName, type ChangeRequest, type ChangeRequestTarget, type ChangeRequestType } from "@/lib/types";

export const runtime = "nodejs";

function asType(value: string): ChangeRequestType | null {
  return value === "rename" || value === "add" || value === "delete" ? value : null;
}

function asTarget(value: string): ChangeRequestTarget | null {
  return value === "student" || value === "college" ? value : null;
}

export async function GET() {
  const jar = await cookies();
  if (jar.get(SESSION_COOKIE)?.value !== "1") {
    return jsonError("Sign in to review requests.", 401);
  }
  const store = await readLiveStore();
  return NextResponse.json({ requests: store.requests ?? [] });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const cohortSlug = String(body?.cohortSlug ?? "");
  const collegeSlug = String(body?.collegeSlug ?? "");
  const type = asType(String(body?.type ?? ""));
  const target = asTarget(String(body?.target ?? "student"));
  if (!isCohortSlug(cohortSlug) || !type || !target) {
    return jsonError("Choose a valid cohort, change type, and target.");
  }
  if (target !== "student") {
    return jsonError("Only student rename, add, and delete can be requested.");
  }
  const cohort = getCohortBySlug(cohortSlug);
  if (!cohort) return jsonError("Unknown cohort.");

  const proposedNameRaw = String(body?.proposedName ?? "").trim();
  const proposedName = target === "student" ? studentRequestName(proposedNameRaw) : proposedNameRaw;
  const subjectArea = String(body?.subjectArea ?? "").trim();
  const studentCode = String(body?.studentCode ?? "").trim();
  const collegeName = String(body?.collegeName ?? "").trim();
  const reason = String(body?.reason ?? "").trim();
  const requestedFrom = String(body?.requestedFrom ?? "dashboard").trim() || "dashboard";

  if (type === "add" && !proposedName) {
    return jsonError("Enter the student name to add.");
  }
  if (type === "add" && !subjectArea) {
    return jsonError("Enter the subject area.");
  }
  if (type === "rename" && (!studentCode || !proposedName)) {
    return jsonError("Enter the current student and the new name.");
  }
  if (type === "delete" && !studentCode) {
    return jsonError("Choose the student to remove.");
  }

  const store = await readLiveStore();
  const overlay = store.batches[cohort.id];
  const college =
    overlay?.colleges.find((item) => item.slug === collegeSlug) ??
    cohort.colleges.find((item) => item.slug === collegeSlug);
  const currentStudent = overlay?.students.find(
    (student) => student.collegeSlug === collegeSlug && student.studentCode === studentCode,
  );

  const change: ChangeRequest = {
    id: `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    cohortSlug: cohort.slug,
    batchId: cohort.id,
    collegeSlug: collegeSlug || "unassigned",
    collegeName: college?.name || collegeName || proposedName || "Unassigned college",
    target,
    type,
    status: "pending",
    payload: {
      studentCode: studentCode || undefined,
      currentName: currentStudent?.name,
      proposedName: proposedName || undefined,
      subjectArea: subjectArea || undefined,
      collegeName: collegeName || proposedName || undefined,
      reason: reason || undefined,
    },
    requestedAt: new Date().toISOString(),
    requestedFrom,
  };

  store.requests = [change, ...(store.requests ?? [])].slice(0, 500);
  store.updatedAt = change.requestedAt;
  await writeLiveStore(store);

  return NextResponse.json({ ok: true, id: change.id, status: "pending" });
}
