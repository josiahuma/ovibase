// app/api/auth/logout/route.ts
import { NextResponse, NextRequest } from "next/server";
import { clearSession } from "@/src/lib/auth";

/**
 * Logout must redirect using the PUBLIC origin (x-forwarded headers),
 * not internal localhost:3000.
 */
export async function POST(req: NextRequest) {
  await clearSession();

  // Redirect to /login on the SAME host (tenant or root),
  // based on the actual public request.
  const url = new URL("/login", req.nextUrl);
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(req: NextRequest) {
  await clearSession();
  const url = new URL("/login", req.nextUrl);
  return NextResponse.redirect(url, { status: 303 });
}
