// ovibase/src/lib/tenant.ts
import { headers } from "next/headers";
import { prisma } from "@/src/lib/prisma";

async function getHostFromHeaders(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-host") || h.get("host") || "").toLowerCase();
}

function stripPort(host: string) {
  return host.replace(/:\d+$/, "");
}

export function getBaseDomain() {
  return (process.env.APP_BASE_DOMAIN || "").trim().toLowerCase();
}

export function getAppPort() {
  return (process.env.APP_PORT || "3000").trim();
}

export function getSubdomainFromHost(hostWithPort: string): string | null {
  const baseDomain = getBaseDomain();
  if (!baseDomain) return null;

  const host = stripPort(hostWithPort);

  // Root host: ovibase.local
  if (host === baseDomain) return null;

  // Must end with ".ovibase.local"
  if (!host.endsWith("." + baseDomain)) return null;

  // subdomain = whatever is before ".ovibase.local"
  const sub = host.slice(0, host.length - (baseDomain.length + 1)); // remove ".baseDomain"
  if (!sub) return null;

  // prevent multi-level accidental subdomain like a.b.ovibase.local (optional)
  // If you want to allow nested subdomains, remove this.
  if (sub.includes(".")) return sub.split(".")[0];

  return sub;
}

export async function getTenantFromRequest() {
  const host = await getHostFromHeaders();
  if (!host) return null;

  const sub = getSubdomainFromHost(host);
  if (!sub) return null;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: sub },
    select: { id: true, name: true, slug: true },
  });

  return tenant;
}

export function buildTenantUrl(workspaceSlug: string, path: string = "/login") {
  const baseDomain = getBaseDomain();
  const port = getAppPort();
  const ws = workspaceSlug.trim().toLowerCase();

  // http://freshfountain.ovibase.local:3000/login
  return `http://${ws}.${baseDomain}:${port}${path}`;
}
