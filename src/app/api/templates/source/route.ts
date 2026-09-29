import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";
import { jsonError } from "@/lib/session";
import { buildTemplateWorkbook } from "@/lib/parse-excel";

export const runtime = "nodejs";

export async function GET() {
  const jar = await cookies();
  if (jar.get(SESSION_COOKIE)?.value !== "1") {
    return jsonError("Sign in to download the template.", 401);
  }
  const body = buildTemplateWorkbook();
  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="telangana-colleges-source-template.xlsx"',
    },
  });
}
