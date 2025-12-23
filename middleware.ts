import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").split(":")[0].toLowerCase();
  const pathname = req.nextUrl.pathname;

  // Resolve tenant slug from subdomain
  const parts = host.split(".");
  const tenantSlug = parts.length >= 3 ? parts[0] : null;

  const res = NextResponse.next();
  if (tenantSlug) res.headers.set("x-tenant-slug", tenantSlug);

  // Protect app area (dashboard)
  if (pathname.startsWith("/app")) {
    const token = req.cookies.get("ovibase_session")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
