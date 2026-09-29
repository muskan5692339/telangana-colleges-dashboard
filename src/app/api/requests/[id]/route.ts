import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";
import { jsonError } from "@/lib/session";
import { applyChangeRequest } from "@/lib/apply-request";
import { readLiveStore, writeLiveStore } from "@/lib/live-store";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const jar = await cookies();
  if (jar.get(SESSION_COOKIE)?.value !== "1") {
    return jsonError("Sign in to approve or reject requests.", 401);
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    action?: string;
    note?: string;
    loginId?: string;
    password?: string;
  } | null;
  const action = body?.action;
  if (action !== "approve" && action !== "reject") {
    return jsonError("Choose approve or reject.");
  }

  const store = await readLiveStore();
  const current = (store.requests ?? []).find((item) => item.id === id);
  if (!current) return jsonError("That request was not found.", 404);
  if (current.status !== "pending") {
    return jsonError("This request has already been reviewed.");
  }

  if (action === "reject") {
    store.requests = store.requests.map((item) =>
      item.id === id
        ? {
            ...item,
            status: "rejected",
            reviewedAt: new Date().toISOString(),
            reviewNote: body?.note?.trim() || undefined,
          }
        : item,
    );
    store.updatedAt = new Date().toISOString();
    await writeLiveStore(store);
    return NextResponse.json({ ok: true, status: "rejected" });
  }

  const loginId = body?.loginId?.trim() ?? "";
  const password = body?.password?.trim() ?? "";
  if (current.type === "add" && current.target === "student" && (!loginId || !password)) {
    return jsonError("Enter dummy email and password to enroll this student.");
  }

  const toApply =
    current.type === "add" && current.target === "student"
      ? {
          ...current,
          payload: {
            ...current.payload,
            loginId,
            password,
          },
        }
      : current;

  const next = applyChangeRequest(store, toApply);
  next.requests = next.requests.map((item) =>
    item.id === id ? { ...item, reviewNote: body?.note?.trim() || item.reviewNote } : item,
  );
  await writeLiveStore(next);
  return NextResponse.json({ ok: true, status: "approved" });
}
