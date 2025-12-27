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

function firstHeaderValue(v: string | null) {
  if (!v) return "";
  return v.split(",")[0].trim();
}

function stripPort(host: string) {
  return host.replace(/:\d+$/, "");
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

async function getPublicHost(): Promise<string> {
  const h = await headers();

  const xfHost = firstHeaderValue(h.get("x-forwarded-host"));
  const host = firstHeaderValue(h.get("host"));

  const raw = xfHost || host || "";

  if (!raw) return "ovibase.com"; // safe fallback

  // keep port only for local dev; strip in prod
  if (isDevHost(raw)) return raw;

  return stripPort(raw);
}

async function getPublicProto(): Promise<string> {
  const h = await headers();
  const xfProto = firstHeaderValue(h.get("x-forwarded-proto"));
  return xfProto || "https";
}

async function getBaseDomain(): Promise<string> {
  const envBase = (process.env.APP_BASE_DOMAIN || "").trim().toLowerCase();
  if (envBase) return envBase;

  // fallback: derive from current host
  const host = stripPort(await getPublicHost());
  const parts = host.split(".");
  if (parts.length <= 2) return host;
  return parts.slice(-2).join(".");
}

export async function buildTenantUrl(tenantSlug: string, path: string) {
  const slug = cleanSlug(tenantSlug);
  const p = path.startsWith("/") ? path : `/${path}`;

  const proto = await getPublicProto();
  const base = await getBaseDomain();

  return `${proto}://${slug}.${base}${p}`;
}

/**
 * Never throw. If anything is odd (headers, db), return null.
 */
export async function getTenantFromRequest(): Promise<TenantInfo | null> {
  try {
    const host = stripPort(await getPublicHost());
    const base = await getBaseDomain();

    // root mode
    if (!host || host === base) return null;

    // must be a subdomain of base
    if (!host.endsWith(`.${base}`)) return null;

    const sub = host.slice(0, -(base.length + 1)); // remove ".base"
    const slug = sub.split(".")[0]; // first label only

    if (!slug) return null;

    const cleaned = cleanSlug(slug);
    if (!cleaned) return null;

    const tenant = await prisma.tenant.findUnique({
      where: { slug: cleaned },
      select: { id: true, slug: true, name: true },
    });

    if (!tenant) return null;

    return { id: tenant.id, slug: tenant.slug, name: tenant.name };
  } catch (err) {
    // IMPORTANT: don't crash the page on transient errors
    console.error("getTenantFromRequest error:", err);
    return null;
  }
}
