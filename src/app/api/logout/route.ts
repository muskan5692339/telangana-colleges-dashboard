import { NextResponse } from "next/server";
import { sessionCookie } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const cookie = sessionCookie("", 0);
  response.cookies.set(cookie);
  return response;
}
