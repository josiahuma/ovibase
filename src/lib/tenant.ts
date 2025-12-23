import { headers } from "next/headers";
import { prisma } from "./prisma";

export async function getTenantFromRequest() {
  const h = await headers();

  // Set by middleware (recommended)
  const tenantSlug = h.get("x-tenant-slug");

  // Fallback: resolve from host
  const host = h.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const parts = host.split(".");
  const inferredSlug = parts.length >= 3 ? parts[0] : null;

  const slug = tenantSlug || inferredSlug;
  if (!slug) return null;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  });

  return tenant;
}
