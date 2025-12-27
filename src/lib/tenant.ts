// src/lib/tenant.ts
import { headers } from "next/headers";
import { prisma } from "@/src/lib/prisma";

export type TenantInfo = {
  id: string;
  slug: string;
  name: string;
};

function cleanSlug(input: string) {
  return input.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
}

function isDevHost(host: string) {
  const h = host.toLowerCase();
  return (
    h.includes("localhost") ||
    h.includes("127.0.0.1") ||
    h.endsWith(".local") ||
    h.includes(".local:")
  );
}

/**
 * Returns the public host from proxy headers, safe for production.
 * - In prod: strips :port
 * - In dev: keeps :port
 */
async function getPublicHost(): Promise<string> {
  const h = await headers();

  const forwardedHost = (h.get("x-forwarded-host") || "").split(",")[0].trim();
  const host = (forwardedHost || h.get("host") || "localhost:3000")
    .split(",")[0]
    .trim();

  if (isDevHost(host)) return host; // keep dev port

  // prod: strip any port
  return host.replace(/:\d+$/, "");
}

/**
 * Returns protocol based on proxy headers
 */
async function getPublicProto(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-proto") || "http").split(",")[0].trim();
}

/**
 * Returns base domain:
 * - Prefer APP_BASE_DOMAIN (best for SaaS)
 * - fallback: derive from current host (last 2 labels)
 */
async function getBaseDomain(): Promise<string> {
  const envBase = (process.env.APP_BASE_DOMAIN || "").trim().toLowerCase();
  if (envBase) return envBase;

  const host = await getPublicHost();
  const hostNoPort = host.replace(/:\d+$/, "");

  const parts = hostNoPort.split(".");
  if (parts.length <= 2) return hostNoPort;

  // naive: last 2 labels (works for ovibase.com)
  return parts.slice(-2).join(".");
}

/**
 * Build a tenant URL always correct in production (no :3000)
 */
export async function buildTenantUrl(tenantSlug: string, path: string) {
  const slug = cleanSlug(tenantSlug);
  const p = path.startsWith("/") ? path : `/${path}`;

  const proto = await getPublicProto();
  const base = await getBaseDomain();

  return `${proto}://${slug}.${base}${p}`;
}

/**
 * Tenant resolver:
 * - If request host is tenant subdomain, fetch tenant by slug
 * - otherwise return null
 */
export async function getTenantFromRequest(): Promise<TenantInfo | null> {
  const host = await getPublicHost();
  const hostNoPort = host.replace(/:\d+$/, "");
  const base = await getBaseDomain();

  // If host is exactly base domain, it's root mode
  if (hostNoPort === base) return null;

  // If host ends with base domain, treat first label as tenant slug
  if (!hostNoPort.endsWith(`.${base}`)) return null;

  const slug = hostNoPort.replace(`.${base}`, "").split(".")[0];
  if (!slug) return null;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true },
  });

  return tenant ? { id: tenant.id, slug: tenant.slug, name: tenant.name } : null;
}
