// app/login/redirect/route.ts
import { NextResponse, NextRequest } from "next/server";
import { buildTenantUrlFromRequest } from "@/src/lib/public-origin";

function cleanSlug(input: string) {
  return input.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const raw = String(formData.get("slug") ?? "");
  const slug = cleanSlug(raw);

  if (!slug) {
    const target = new URL("/login?error=missing", req.nextUrl);
    return NextResponse.redirect(target, { status: 303 });
  }

  const target = buildTenantUrlFromRequest(req, slug, "/login");
  return NextResponse.redirect(target, { status: 303 });
}
