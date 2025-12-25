import { NextResponse } from "next/server";
import { clearSession } from "@/src/lib/auth";

export async function POST(req: Request) {
  // clear cookie/session
  await clearSession();

  // redirect back to login (or "/" if you prefer)
  const url = new URL("/login", req.url);

  // 303 ensures the browser follows with a GET
  return NextResponse.redirect(url, { status: 303 });
}

// Optional: allow GET /api/auth/logout too (handy for debugging)
export async function GET(req: Request) {
  await clearSession();
  const url = new URL("/login", req.url);
  return NextResponse.redirect(url, { status: 303 });
}
