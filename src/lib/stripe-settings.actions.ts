"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { requireTenant } from "@/src/lib/guards";
import { encryptSecret } from "@/src/lib/crypto";

function ensureAdminRole(role: string) {
  return role === "OWNER" || role === "ADMIN";
}

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

export async function saveStripeSettings(formData: FormData) {
  const { session, tenant } = await requireTenant();
  if (!ensureAdminRole(session.role)) redirect("/app");

  const secretKey = s(formData.get("secretKey"));
  const webhookSecret = s(formData.get("webhookSecret"));
  const publishableKey = s(formData.get("publishableKey")) || null;
  const currency = (s(formData.get("currency")) || "gbp").toLowerCase();

  if (!secretKey.startsWith("sk_")) redirect("/app/settings/stripe?error=invalid_secret_key");
  if (!webhookSecret.startsWith("whsec_")) redirect("/app/settings/stripe?error=invalid_webhook_secret");

  const sk = encryptSecret(secretKey);
  const wh = encryptSecret(webhookSecret);

  await prisma.stripeProviderSetting.upsert({
    where: { tenantId: tenant.id },
    create: {
      tenantId: tenant.id,
      currency,
      publishableKey,
      secretKeyEnc: sk.enc,
      secretKeyIv: sk.iv,
      secretKeyTag: sk.tag,
      webhookSecretEnc: wh.enc,
      webhookSecretIv: wh.iv,
      webhookSecretTag: wh.tag,
    },
    update: {
      currency,
      publishableKey,
      secretKeyEnc: sk.enc,
      secretKeyIv: sk.iv,
      secretKeyTag: sk.tag,
      webhookSecretEnc: wh.enc,
      webhookSecretIv: wh.iv,
      webhookSecretTag: wh.tag,
    },
  });

  revalidatePath("/app/settings/stripe");
  redirect("/app/settings/stripe?ok=saved");
}
