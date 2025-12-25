import { NextResponse } from "next/server";

function cleanSlug(input: string) {
  return input.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const raw = String(formData.get("slug") ?? "");
  const slug = cleanSlug(raw);

  if (!slug) {
    return NextResponse.redirect(new URL("/login?error=missing", req.url), 303);
  }

  // Determine base domain from the current host.
  // Example: ovibase.local:3000  -> base = ovibase.local:3000
  // In production: ovibase.com -> base = ovibase.com
  const host = req.headers.get("host") ?? "";
  const proto = req.headers.get("x-forwarded-proto") ?? "http";

  // If host already contains a subdomain, you can strip it, but on root it won't.
  // We'll treat current host as the base.
  const base = host;

  const target = `${proto}://${slug}.${base}/login`;

  return NextResponse.redirect(target, 303);
}
