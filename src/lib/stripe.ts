import Stripe from "stripe";
import { prisma } from "@/src/lib/prisma";
import { decryptSecret } from "@/src/lib/crypto";

export async function getTenantStripe(tenantId: string) {
  const cfg = await prisma.stripeProviderSetting.findUnique({
    where: { tenantId },
  });

  if (!cfg?.secretKeyEnc || !cfg.secretKeyIv || !cfg.secretKeyTag) return null;

  const secretKey = decryptSecret({
    enc: cfg.secretKeyEnc,
    iv: cfg.secretKeyIv,
    tag: cfg.secretKeyTag,
  });

  const stripe = new Stripe(secretKey, {
    apiVersion: "2025-12-15.clover",
  });

  return { stripe, cfg };
}
