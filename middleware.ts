import { NextRequest, NextResponse } from "next/server";
import { LUMI_SESSION_COOKIE, verifyLumiSessionToken } from "./lib/lumi/auth";

const protectedPathPrefixes = ["/lumi", "/admin", "/api/lumi", "/api/tts", "/api/kid-chat", "/api/lumi-chat"];

function isProtectedPath(pathname: string): boolean {
  return protectedPathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!isProtectedPath(pathname)) return NextResponse.next();

  const session = await verifyLumiSessionToken(request.cookies.get(LUMI_SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/lumi/:path*", "/admin/:path*", "/api/lumi/:path*", "/api/tts/:path*", "/api/kid-chat", "/api/lumi-chat"],
};
