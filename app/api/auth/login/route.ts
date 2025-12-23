import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { createSession, verifyPassword } from "@/src/lib/auth";
import { getTenantFromRequest } from "@/src/lib/tenant";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const tenant = await getTenantFromRequest();
  if (!tenant) {
    return NextResponse.json(
      { error: "Tenant not resolved. Login via your tenant subdomain." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });

  const membership = await prisma.userTenant.findUnique({
    where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
  });

  if (!membership) {
    return NextResponse.json(
      { error: "This account is not a member of this tenant." },
      { status: 403 }
    );
  }

  await createSession({ userId: user.id, tenantId: tenant.id, role: membership.role });

  return NextResponse.json({ ok: true });
}
