// app/login/go/route.ts
import { NextResponse, NextRequest } from "next/server";
import { buildTenantUrlFromRequest } from "@/src/lib/public-origin";

export async function POST(req: NextRequest) {
  const form = await req.formData();

  const workspaceRaw = String(form.get("workspace") ?? "").trim().toLowerCase();

  if (!workspaceRaw) {
    // IMPORTANT: use request-derived public origin, not req.url
    const target = new URL("/login", req.nextUrl);
    return NextResponse.redirect(target, { status: 303 });
  }

  // basic slug cleanup
  const workspace = workspaceRaw.replace(/[^a-z0-9-]/g, "");

  // Build tenant url using headers/env (NEVER trust form baseHost in production)
  const target = buildTenantUrlFromRequest(req, workspace, "/login");

  return NextResponse.redirect(target, { status: 303 });
}
