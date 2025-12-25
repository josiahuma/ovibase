// src/lib/host.ts
export function stripPort(host: string) {
  return host.split(":")[0].toLowerCase();
}

/**
 * For local dev:
 * - base: ovibase.local
 * - tenant: <slug>.ovibase.local
 *
 * For prod you might have:
 * - base: ovibase.com
 * - tenant: <slug>.ovibase.com
 */
export function getTenantSlugFromHost(hostHeader: string | null): string | null {
  if (!hostHeader) return null;

  const host = stripPort(hostHeader);

  // localhost (no subdomains)
  if (host === "localhost" || host.endsWith(".localhost")) return null;

  // handle ovibase.local
  // tenant example: freshfountain.ovibase.local  -> ["freshfountain","ovibase","local"]
  const parts = host.split(".");

  // Not enough parts to have a subdomain
  if (parts.length < 3) return null;

  // If your base local domain is ovibase.local, last 2 parts are ["ovibase","local"]
  const base2 = parts.slice(-2).join(".");
  if (base2 === "ovibase.local") {
    const sub = parts.slice(0, -2).join(".");
    if (!sub || sub === "www") return null;
    return sub;
  }

  // Generic fallback: treat first label as subdomain when there are 3+ parts
  // e.g. freshfountain.ovibase.com -> ["freshfountain","ovibase","com"]
  const subdomain = parts[0];
  if (!subdomain || subdomain === "www") return null;

  return subdomain;
}

export function getBaseHost(hostHeader: string | null): string {
  const host = stripPort(hostHeader ?? "ovibase.local");

  // localhost: keep as localhost
  if (host === "localhost" || host.endsWith(".localhost")) return "localhost";

  const parts = host.split(".");

  // if it's something like freshfountain.ovibase.local -> base is ovibase.local
  if (parts.length >= 3 && parts.slice(-2).join(".") === "ovibase.local") {
    return "ovibase.local";
  }

  // otherwise base is last 2 parts (ovibase.com)
  if (parts.length >= 2) return parts.slice(-2).join(".");

  return host;
}
