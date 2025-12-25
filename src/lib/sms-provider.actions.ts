"use server";

import { prisma } from "@/src/lib/prisma";
import { requireAdmin } from "@/src/lib/permissions";
import { revalidatePath } from "next/cache";
import { encryptSecret } from "@/src/lib/crypto";
import type { SmsProvider } from "@prisma/client";

function s(v: FormDataEntryValue | null) {
  const out = String(v ?? "").trim();
  return out.length ? out : null;
}

export async function saveSmsProvider(formData: FormData) {
  const { tenant } = await requireAdmin();

  const provider = String(formData.get("provider") ?? "TEXTLOCAL") as SmsProvider;
  const senderId = s(formData.get("senderId"));
  const from = s(formData.get("from"));
  const baseUrl = s(formData.get("baseUrl"));

  const apiKeyPlain = s(formData.get("apiKey"));
  const secret = apiKeyPlain ? encryptSecret(apiKeyPlain) : null;

  const createData = {
    tenantId: tenant.id,
    provider,
    senderId,
    from,
    baseUrl,
    apiKeyEnc: secret?.enc ? Buffer.from(secret.enc, "base64") : null,
    apiKeyIv: secret?.iv ? Buffer.from(secret.iv, "base64") : null,
    apiKeyTag: secret?.tag ? Buffer.from(secret.tag, "base64") : null,
  };

  const updateData: Record<string, any> = {
    provider,
    senderId,
    from,
    baseUrl,
  };

  if (secret) {
    updateData.apiKeyEnc = Buffer.from(secret.enc, "base64");
    updateData.apiKeyIv = Buffer.from(secret.iv, "base64");
    updateData.apiKeyTag = Buffer.from(secret.tag, "base64");
  }

  await prisma.smsProviderSetting.upsert({
    where: { tenantId: tenant.id },
    create: createData,
    update: updateData,
  });

  revalidatePath("/app/settings/sms-provider");
}
