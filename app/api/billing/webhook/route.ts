// ovibase/app/api/billing/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/src/lib/prisma";

export const runtime = "nodejs";

// ✅ Env sanity checks (prevents silent failures)
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY!;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

if (!STRIPE_KEY) throw new Error("Missing STRIPE_SECRET_KEY in .env");
if (!WEBHOOK_SECRET) throw new Error("Missing STRIPE_WEBHOOK_SECRET in .env");

const stripe = new Stripe(STRIPE_KEY, {
  // ✅ do NOT set apiVersion to avoid TS mismatch issues
});

function toDateFromUnixSeconds(v: unknown): Date | null {
  if (typeof v !== "number") return null;
  if (!Number.isFinite(v)) return null;
  return new Date(v * 1000);
}

async function upsertFromSubscription(sub: Stripe.Subscription, tenantId: string) {
  const status = sub.status; // active, trialing, canceled, unpaid, etc.
  const currentPeriodEnd = toDateFromUnixSeconds((sub as any).current_period_end);
  const cancelAtPeriodEnd = Boolean((sub as any).cancel_at_period_end);

  const firstItem = sub.items?.data?.[0];
  const stripePriceId = firstItem?.price?.id ?? null;

  await prisma.tenantSubscription.upsert({
    where: { tenantId },
    create: {
      tenantId,
      stripeCustomerId: String(sub.customer),
      stripeSubscriptionId: sub.id,
      stripePriceId,
      status,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    },
    update: {
      stripeCustomerId: String(sub.customer),
      stripeSubscriptionId: sub.id,
      stripePriceId,
      status,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    },
  });
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err?.message || "Unknown error"}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      /**
       * ✅ BACKUP PATH:
       * checkout.session.completed contains:
       * - session.metadata.tenantId (you already set this)
       * - session.subscription (subscription id)
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const tenantId = session.metadata?.tenantId;
        const subscriptionId = session.subscription;

        if (!tenantId || !subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(String(subscriptionId));
        await upsertFromSubscription(sub, tenantId);
        break;
      }

      /**
       * ✅ PRIMARY PATH:
       * This will work once you add subscription_data.metadata.tenantId in checkout
       */
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        // ✅ after checkout fix, this will be present
        const tenantId = sub.metadata?.tenantId;

        // If tenantId missing, we can't map it — safely ignore
        if (!tenantId) break;

        await upsertFromSubscription(sub, tenantId);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Webhook handler failed" },
      { status: 500 }
    );
  }
}
