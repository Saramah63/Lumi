import { NextRequest, NextResponse } from "next/server";
import {
  createLumiSessionToken,
  isLumiAuthConfigured,
  LUMI_SESSION_COOKIE,
  lumiSessionMaxAgeSeconds,
  validateLumiCredentials,
} from "../../../../lib/lumi/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";

  if (!isLumiAuthConfigured()) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  if (!validateLumiCredentials(email, password)) {
    return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
  }

  const token = await createLumiSessionToken(email);
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: LUMI_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: lumiSessionMaxAgeSeconds(),
  });
  return response;
}
