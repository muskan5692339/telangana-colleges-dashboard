"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { credentialsMatch } from "@/lib/auth";
import { sessionCookie } from "@/lib/session";

export type LoginState = { error: string } | null;

function safeNextPath(value: unknown) {
  if (typeof value !== "string") return "/cohorts";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/login")) {
    return "/cohorts";
  }
  return value;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!email || !password) {
    return { error: "Enter email and password." };
  }

  if (!credentialsMatch(email, password)) {
    return { error: "Those credentials do not match a program-team account." };
  }

  const store = await cookies();
  const cookie = sessionCookie("1");
  store.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    sameSite: cookie.sameSite,
    secure: cookie.secure,
    path: cookie.path,
    maxAge: cookie.maxAge,
  });

  redirect(next);
}
