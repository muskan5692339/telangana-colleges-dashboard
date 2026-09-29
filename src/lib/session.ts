import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export async function hasSession() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value === "1";
}

export function sessionCookie(value: string, maxAge = 60 * 60 * 24 * 14) {
  return {
    name: SESSION_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.VERCEL === "1" || process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
