// ovibase/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { createSession, verifyPassword } from "@/src/lib/auth";
import { getTenantFromRequest } from "@/src/lib/tenant";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  redirectTo: z.string().optional(),
});

function isFormRequest(req: Request) {
  const ct = req.headers.get("content-type") || "";
  return (
    ct.includes("application/x-www-form-urlencoded") ||
    ct.includes("multipart/form-data")
  );
}

export async function POST(req: Request) {
  const formMode = isFormRequest(req);

  // 1) Parse incoming payload (supports both JSON + FormData)
  let data: { email?: string; password?: string; redirectTo?: string } = {};

  try {
    if (formMode) {
      const fd = await req.formData();
      data = {
        email: String(fd.get("email") ?? "").trim(),
        password: String(fd.get("password") ?? ""),
        redirectTo: String(fd.get("redirectTo") ?? "").trim() || undefined,
      };
    } else {
      const body = await req.json();
      data = {
        email: String(body?.email ?? "").trim(),
        password: String(body?.password ?? ""),
        redirectTo: typeof body?.redirectTo === "string" ? body.redirectTo : undefined,
      };
    }
  } catch {
    // bad body
    if (formMode) {
      const url = new URL("/login", req.url);
      url.searchParams.set("error", "Invalid request payload.");
      return NextResponse.redirect(url, { status: 303 });
    }
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const parsed = Schema.safeParse(data);
  if (!parsed.success) {
    if (formMode) {
      const url = new URL("/login", req.url);
      url.searchParams.set("error", "Please enter a valid email and password.");
      return NextResponse.redirect(url, { status: 303 });
    }
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, redirectTo } = parsed.data;

  // 2) Resolve tenant from subdomain
  const tenant = await getTenantFromRequest();
  if (!tenant) {
    if (formMode) {
      const url = new URL("/login", req.url);
      url.searchParams.set("error", "Tenant not resolved. Login via your workspace subdomain.");
      return NextResponse.redirect(url, { status: 303 });
    }
    return NextResponse.json(
      { error: "Tenant not resolved. Login via your tenant subdomain." },
      { status: 400 }
    );
  }

  // 3) Validate user credentials
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    if (formMode) {
      const url = new URL("/login", req.url);
      url.searchParams.set("error", "Invalid credentials.");
      return NextResponse.redirect(url, { status: 303 });
    }
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    if (formMode) {
      const url = new URL("/login", req.url);
      url.searchParams.set("error", "Invalid credentials.");
      return NextResponse.redirect(url, { status: 303 });
    }
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  // 4) Confirm membership in this tenant
  const membership = await prisma.userTenant.findUnique({
    where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
  });

  if (!membership) {
    if (formMode) {
      const url = new URL("/login", req.url);
      url.searchParams.set("error", "This account is not a member of this workspace.");
      return NextResponse.redirect(url, { status: 303 });
    }
    return NextResponse.json(
      { error: "This account is not a member of this tenant." },
      { status: 403 }
    );
  }

  // 5) Create session cookie
  await createSession({ userId: user.id, tenantId: tenant.id, role: membership.role });

  // 6) Respond based on request type
  if (formMode) {
    // safety: only allow internal redirects
    const target =
      redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
        ? redirectTo
        : "/app";

    return NextResponse.redirect(new URL(target, req.url), { status: 303 });
  }

  return NextResponse.json({ ok: true });
}
