import { NextResponse } from "next/server";
import { credentialsMatch } from "@/lib/auth";
import { jsonError, sessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";

  if (!email || !password) {
    return jsonError("Enter email and password.");
  }

  if (!credentialsMatch(email, password)) {
    return jsonError("Those credentials do not match a program-team account.", 401);
  }

  const response = NextResponse.json({ ok: true });
  const cookie = sessionCookie("1");
  response.cookies.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    sameSite: cookie.sameSite,
    secure: cookie.secure,
    path: cookie.path,
    maxAge: cookie.maxAge,
  });
  return response;
}
