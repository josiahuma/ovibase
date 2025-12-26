// src/lib/sms-provider.actions.ts
"use server";

import { prisma } from "@/src/lib/prisma";
import { requireTenantWithUserTenant, isAdminRole } from "@/src/lib/guards";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { encryptSecret } from "@/src/lib/crypto"; // <- keep your existing encryptSecret export
import type { SmsProvider } from "@prisma/client";

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

function toBytesBase64OrBuffer(v: unknown): Buffer | null {
  if (!v) return null;

  // already bytes
  if (Buffer.isBuffer(v)) return v;

  // base64 string -> bytes
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (!trimmed) return null;
    return Buffer.from(trimmed, "base64");
  }

  // fallback (should not happen, but keeps TS happy)
  try {
    // @ts-ignore
    return Buffer.from(v);
  } catch {
    return null;
  }
}

/**
 * ADMIN: Save SMS Provider settings for this tenant.
 * Table: SmsProviderSetting (1 row per tenantId)
 */
export async function saveSmsProviderSettings(formData: FormData) {
  const { tenant, ut } = await requireTenantWithUserTenant();

  const isAdmin = isAdminRole(ut.role);
  if (!isAdmin) redirect("/app");

  const providerRaw = s(formData.get("provider")).toUpperCase();
  const provider = (providerRaw || "TEXTLOCAL") as SmsProvider;

  const senderId = s(formData.get("senderId")) || null;
  const from = s(formData.get("from")) || null;
  const baseUrl = s(formData.get("baseUrl")) || null;

  // apiKey is optional in UI because you might not want to replace it every time
  const apiKeyPlain = s(formData.get("apiKey")) || null;

  // Fetch existing (so we can keep current encrypted key if apiKey not provided)
  const existing = await prisma.smsProviderSetting.findUnique({
    where: { tenantId: tenant.id },
    select: {
      apiKeyEnc: true,
      apiKeyIv: true,
      apiKeyTag: true,
    },
  });

  let apiKeyEnc = existing?.apiKeyEnc ?? null;
  let apiKeyIv = existing?.apiKeyIv ?? null;
  let apiKeyTag = existing?.apiKeyTag ?? null;

  if (apiKeyPlain) {
    const secret = encryptSecret(apiKeyPlain);

    // IMPORTANT:
    // secret.enc/iv/tag might be string (base64) OR Buffer depending on your crypto implementation
    apiKeyEnc = toBytesBase64OrBuffer(secret.enc);
    apiKeyIv = toBytesBase64OrBuffer(secret.iv);
    apiKeyTag = toBytesBase64OrBuffer(secret.tag);
  }

  await prisma.smsProviderSetting.upsert({
    where: { tenantId: tenant.id },
    update: {
      provider,
      senderId,
      from,
      baseUrl,
      apiKeyEnc,
      apiKeyIv,
      apiKeyTag,
    },
    create: {
      tenantId: tenant.id,
      provider,
      senderId,
      from,
      baseUrl,
      apiKeyEnc,
      apiKeyIv,
      apiKeyTag,
    },
  });

  revalidatePath("/app/settings/sms-provider");
  redirect("/app/settings/sms-provider?ok=1");
}
