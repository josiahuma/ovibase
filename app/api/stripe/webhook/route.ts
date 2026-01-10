// ovibase/app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getTenantFromRequest } from "@/src/lib/tenant";
import { decryptSecret } from "@/src/lib/crypto";
import { getTenantStripe } from "@/src/lib/stripe";

import { sendEmail } from "@/src/lib/email/send";
import { DonationPaidEmail } from "@/src/lib/email/templates/DonationPaidEmail";
import { DonationFailedEmail } from "@/src/lib/email/templates/DonationFailedEmail";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const tenant = await getTenantFromRequest();
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 400 });

  const t = tenant;

  const stripeBundle = await getTenantStripe(tenant.id);
  if (
    !stripeBundle?.cfg?.webhookSecretEnc ||
    !stripeBundle.cfg.webhookSecretIv ||
    !stripeBundle.cfg.webhookSecretTag
  ) {
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

  async function safeSendEmail(args: Parameters<typeof sendEmail>[0]) {
    try {
      const res = await sendEmail(args);
      // Resend usually returns { id: "..." } or throws
      console.log("✅ Donation email sent:", res);
      return res;
    } catch (e: any) {
      console.error("❌ Donation email failed:", {
        message: e?.message,
        name: e?.name,
        cause: e?.cause,
        stack: e?.stack,
      });
      return null;
    }
  }

  async function markDonationPaid(args: {
    donationId: string;
    stripeSessionId?: string | null;
    stripePaymentIntentId?: string | null;
    stripeSubscriptionId?: string | null;
  }) {
    const donation = await prisma.donation.findFirst({
      where: { id: args.donationId, tenantId: t.id },
    });

    if (!donation) return;
    if (donation.status === "PAID") return;

    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        stripeSessionId: args.stripeSessionId ?? donation.stripeSessionId,
        stripePaymentIntentId: args.stripePaymentIntentId ?? donation.stripePaymentIntentId,
        stripeSubscriptionId: args.stripeSubscriptionId ?? donation.stripeSubscriptionId,
      },
    });

    // ✅ Create Finance record ONLY ONCE (unique donationId prevents duplicates)
    try {
      await prisma.finance.create({
        data: {
          tenantId: t.id,
          type: "income",
          amount: donation.amount,
          category: "Donations",
          description: donation.isRecurring ? "Recurring donation" : "One-off donation",
          date: new Date(),
          donationId: donation.id,
        } as any,
      });
    } catch (e: any) {
      const msg = String(e?.message || "").toLowerCase();
      if (!msg.includes("unique") || e?.code !== "P2002") {
        console.error("Finance create failed:", e);
      }
    }

    // ✅ Email donor receipt (only if we have donor email)
    if (!donation.donorEmail) {
      console.log("ℹ️ No donorEmail saved — skipping receipt email", {
        donationId: donation.id,
        donorName: donation.donorName,
      });
      return;
    }

    await safeSendEmail({
      to: donation.donorEmail,
      subject: `Thank you for your donation to ${t.name} 🎉`,
      react: DonationPaidEmail({
        tenantName: t.name,
        amount: String(donation.amount),
        currency: donation.currency,
        donorName: donation.donorName,
      }),
    });
  }

  async function markDonationFailed(args: {
    donationId: string;
    stripePaymentIntentId?: string | null;
    stripeSubscriptionId?: string | null;
  }) {
    const donation = await prisma.donation.findFirst({
      where: { id: args.donationId, tenantId: t.id },
    });

    if (!donation) return;

    // If it’s already PAID, do not downgrade
    if (donation.status === "PAID") return;

    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        status: "FAILED",
        stripePaymentIntentId: args.stripePaymentIntentId ?? donation.stripePaymentIntentId,
        stripeSubscriptionId: args.stripeSubscriptionId ?? donation.stripeSubscriptionId,
      },
    });

    if (!donation.donorEmail) return;

    await safeSendEmail({
      to: donation.donorEmail,
      subject: `Donation payment not completed`,
      react: DonationFailedEmail({
        tenantName: t.name,
        amount: String(donation.amount),
        currency: donation.currency,
      }),
    });
  }

  try {
    // ✅ 1) Primary success path
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const donationId = session.metadata?.donationId;
      if (donationId) {
        const paymentIntentId =
          typeof session.payment_intent === "string" ? session.payment_intent : null;

        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : null;

        await markDonationPaid({
          donationId,
          stripeSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
          stripeSubscriptionId: subscriptionId,
        });
      }
    }

    // ✅ 2) Backup success for one-off donations
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const donationId = pi.metadata?.donationId;

      if (donationId) {
        await markDonationPaid({
          donationId,
          stripePaymentIntentId: pi.id,
        });
      }
    }

    // ✅ 3) Backup success for recurring donations (each cycle)
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;

      const subId =
        typeof (invoice as any).subscription === "string"
          ? (invoice as any).subscription
          : typeof (invoice as any).subscription?.id === "string"
            ? (invoice as any).subscription.id
            : null;

      if (subId) {
        const sub = await stripeBundle.stripe.subscriptions.retrieve(String(subId));
        const donationId = sub.metadata?.donationId;

        if (donationId) {
          await markDonationPaid({
            donationId,
            stripeSubscriptionId: sub.id,
          });
        }
      }
    }

    // ✅ 4) Failure: Checkout session expired
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const donationId = session.metadata?.donationId;
      if (donationId) {
        await markDonationFailed({ donationId });
      }
    }

    // ✅ 5) Failure: One-off payment failed
    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const donationId = pi.metadata?.donationId;
      if (donationId) {
        await markDonationFailed({
          donationId,
          stripePaymentIntentId: pi.id,
        });
      }
    }

    // ✅ 6) Failure: Recurring donation invoice failed
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;

      const subId =
        typeof (invoice as any).subscription === "string"
          ? (invoice as any).subscription
          : typeof (invoice as any).subscription?.id === "string"
            ? (invoice as any).subscription.id
            : null;

      if (subId) {
        const sub = await stripeBundle.stripe.subscriptions.retrieve(String(subId));
        const donationId = sub.metadata?.donationId;

        if (donationId) {
          await markDonationFailed({
            donationId,
            stripeSubscriptionId: sub.id,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Tenant webhook handler failed:", err);
    return NextResponse.json({ error: err?.message || "Webhook handler failed" }, { status: 500 });
  }
}
