// app/api/auth/logout/route.ts
import { NextResponse, NextRequest } from "next/server";
import { clearSession } from "@/src/lib/auth";

function getProto(req: NextRequest) {
  // Cloudflare/Nginx set this
  const xf = req.headers.get("x-forwarded-proto");
  if (xf) return xf.split(",")[0].trim();

  // fallback
  return "https";
}

function getRootLoginUrl(req: NextRequest) {
  const proto = getProto(req);

  // IMPORTANT: set this in your systemd env to "ovibase.com"
  const base = (process.env.APP_BASE_DOMAIN || "ovibase.com")
    .trim()
    .toLowerCase();

  return `${proto}://${base}/login`;
}

export async function POST(req: NextRequest) {
  await clearSession();
  return NextResponse.redirect(getRootLoginUrl(req), { status: 303 });
}

export async function GET(req: NextRequest) {
  await clearSession();
  return NextResponse.redirect(getRootLoginUrl(req), { status: 303 });
}
