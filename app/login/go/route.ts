// app/login/go/route.ts
import { NextResponse } from "next/server";
import { stripPort } from "@/src/lib/host";

export async function POST(req: Request) {
  const form = await req.formData();

  const workspaceRaw = String(form.get("workspace") ?? "").trim().toLowerCase();
  const baseHostRaw = String(form.get("baseHost") ?? "").trim().toLowerCase();

  if (!workspaceRaw) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // basic slug cleanup
  const workspace = workspaceRaw.replace(/[^a-z0-9-]/g, "");

  // baseHost is something like "ovibase.local" or "localhost"
  const baseHost = stripPort(baseHostRaw || "ovibase.local");

  // ✅ Prevent “freshfountain.freshfountain...”
  // If somehow baseHost already starts with workspace, don’t append again.
  const baseParts = baseHost.split(".");
  const isAlreadyTenant =
    baseParts.length >= 3 && baseParts[0] === workspace;

  const targetHost = isAlreadyTenant ? baseHost : `${workspace}.${baseHost}`;

  // preserve protocol + port from current request
  const url = new URL(req.url);
  const proto = url.protocol; // http:
  const port = url.port ? `:${url.port}` : "";

  const target = `${proto}//${targetHost}${port}/login`;

  return NextResponse.redirect(target, { status: 302 });
}
