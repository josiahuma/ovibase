//app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { createSession, hashPassword } from "@/src/lib/auth";

const Schema = z.object({
  tenantName: z.string().min(2),
  tenantSlug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { tenantName, tenantSlug, fullName, email, password } = parsed.data;

  const existingTenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (existingTenant) {
    return NextResponse.json({ error: "Tenant slug already taken." }, { status: 409 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const tenant = await prisma.tenant.create({
    data: {
      name: tenantName,
      slug: tenantSlug,
      domains: {
        create: [
          {
            hostname: `${tenantSlug}.${process.env.APP_BASE_DOMAIN || "ovibase.com"}`,
            isPrimary: true,
          },
        ],
      },
    },
  });

  const user = await prisma.user.create({
    data: {
      name: fullName,
      email,
      passwordHash,
      tenants: {
        create: {
          tenantId: tenant.id,
          role: "OWNER",
        },
      },
    },
  });

  // create session for this tenant
  await createSession({ userId: user.id, tenantId: tenant.id, role: "OWNER" });

  return NextResponse.json({
    ok: true,
    tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name },
    user: { id: user.id, email: user.email, name: user.name },
  });
}
