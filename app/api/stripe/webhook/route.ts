import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getTenantFromRequest } from "@/src/lib/tenant";
import { decryptSecret } from "@/src/lib/crypto";
import { getTenantStripe } from "@/src/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const tenant = await getTenantFromRequest();
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 400 });

  const stripeBundle = await getTenantStripe(tenant.id);
  if (!stripeBundle?.cfg?.webhookSecretEnc || !stripeBundle.cfg.webhookSecretIv || !stripeBundle.cfg.webhookSecretTag) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const webhookSecret = decryptSecret({
    enc: stripeBundle.cfg.webhookSecretEnc,
    iv: stripeBundle.cfg.webhookSecretIv,
    tag: stripeBundle.cfg.webhookSecretTag,
  });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripeBundle.stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature failed: ${err.message}` }, { status: 400 });
  }

  // We care about successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const donationId = session.metadata?.donationId;
    if (donationId) {
      // idempotent update: update only if not already PAID
      const donation = await prisma.donation.findFirst({
        where: { id: donationId, tenantId: tenant.id },
      });

      if (donation && donation.status !== "PAID") {
        // PaymentIntent ID exists for one-off payments
        const paymentIntentId =
          typeof session.payment_intent === "string" ? session.payment_intent : null;

        // Subscription ID exists for recurring
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : null;

        // Update donation to PAID
        await prisma.donation.update({
          where: { id: donation.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
            stripeSessionId: session.id,
            stripePaymentIntentId: paymentIntentId,
            stripeSubscriptionId: subscriptionId,
          },
        });

        // Create Finance record ONLY ONCE (unique donationId prevents duplicates)
        await prisma.finance.create({
          data: {
            tenantId: tenant.id,
            type: "income",
            amount: donation.amount,
            category: "Donations",
            description: donation.isRecurring ? "Recurring donation" : "One-off donation",
            date: new Date(),
            donationId: donation.id,
          } as any,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
