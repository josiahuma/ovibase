// src/lib/public-origin.ts
import type { NextRequest } from "next/server";

/**
 * Returns the public-facing origin (scheme + host) using proxy headers.
 * This prevents redirects accidentally using internal localhost:3000.
 *
 * Examples:
 *  - https://freshfountain.ovibase.com
 *  - http://ovibase.local:3000 (dev)
 */
export function getPublicOrigin(req: NextRequest): string {
  const h = req.headers;

  // Prefer forwarded headers from Nginx
  const forwardedProtoRaw = h.get("x-forwarded-proto") || "";
  const forwardedHostRaw = h.get("x-forwarded-host") || "";

  // Fallback
  const hostRaw = forwardedHostRaw || h.get("host") || "localhost:3000";
  const protoRaw = forwardedProtoRaw || "http";

  // Sometimes these can be comma-separated (rare, but happens behind multiple proxies)
  const host = hostRaw.split(",")[0].trim();
  const proto = protoRaw.split(",")[0].trim();

  // In production, never keep :3000 (or any port) in host unless you explicitly want it.
  // But in dev/local, keep it.
  const isDevHost =
    host.includes("localhost") ||
    host.endsWith(".local") ||
    host.includes("127.0.0.1");

  const cleanHost = !isDevHost ? host.replace(/:\d+$/, "") : host;

  return `${proto}://${cleanHost}`;
}

/**
 * Returns the base domain used for tenants.
 * Prefer env in production so you never derive the wrong base.
 *
 * Example:
 *  APP_BASE_DOMAIN=ovibase.com
 */
export function getBaseDomain(req: NextRequest): string {
  const envBase = (process.env.APP_BASE_DOMAIN || "").trim().toLowerCase();
  if (envBase) return envBase;

  // Fallback: derive from current host
  // NOTE: simplistic (works for ovibase.com). If you ever use co.uk, use a PSL approach.
  const origin = getPublicOrigin(req);
  const host = new URL(origin).host.replace(/:\d+$/, "");
  const parts = host.split(".");
  if (parts.length <= 2) return host;

  // If we are already on tenant subdomain, take the last 2 labels
  return parts.slice(-2).join(".");
}

/**
 * Build a tenant URL using base domain (from env or request).
 */
export function buildTenantUrlFromRequest(
  req: NextRequest,
  tenantSlug: string,
  path: string
): string {
  const slug = tenantSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  const p = path.startsWith("/") ? path : `/${path}`;

  const origin = getPublicOrigin(req);
  const proto = new URL(origin).protocol;
  const baseDomain = getBaseDomain(req);

  // In dev, base domain might be ovibase.local:3000 - keep it if env not set
  // But if baseDomain is env value (ovibase.com), it won't have a port.
  const targetHost = `${slug}.${baseDomain}`;

  return `${proto}//${targetHost}${p}`;
}

/**
 * Build the root (workspace chooser) URL.
 */
export function buildRootUrlFromRequest(req: NextRequest, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const origin = getPublicOrigin(req);

  const proto = new URL(origin).protocol;
  const baseDomain = getBaseDomain(req);

  return `${proto}//${baseDomain}${p}`;
}
