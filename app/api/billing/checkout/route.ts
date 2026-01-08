import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/src/lib/prisma";
import { requireTenantWithUserTenant, isAdminRole } from "@/src/lib/guards";

export const runtime = "nodejs";

// ✅ Use env names from your .env
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;

if (!STRIPE_KEY) throw new Error("Missing STRIPE_SECRET_KEY in .env");
if (!PRO_PRICE_ID) throw new Error("Missing STRIPE_PRO_PRICE_ID in .env");

const stripe = new Stripe(STRIPE_KEY, {
  // ✅ do NOT set apiVersion to avoid TS mismatch issues
});

function tenantBaseUrl(tenantSlug: string) {
  const domain =
    process.env.NEXT_PUBLIC_APP_BASE_DOMAIN ||
    process.env.APP_BASE_DOMAIN ||
    "localhost";

  const port = process.env.NEXT_PUBLIC_APP_PORT || process.env.APP_PORT || "";

  // Treat *.local / localhost as dev → http + include port
  const isDev =
    domain.includes(".local") || domain.includes("localhost") || port === "3000";

  const protocol = isDev ? "http" : "https";
  const portPart = isDev && port ? `:${port}` : "";

  return `${protocol}://${tenantSlug}.${domain}${portPart}`;
}

export async function POST() {
  const { tenant, ut } = await requireTenantWithUserTenant();

  if (!isAdminRole(ut.role)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  // ✅ read current subscription row (if any)
  const existing = await prisma.tenantSubscription.findUnique({
    where: { tenantId: tenant.id },
    select: {
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      status: true,
    },
  });

  // ✅ Ensure Stripe customer exists
  const customerId =
    existing?.stripeCustomerId ??
    (
      await stripe.customers.create({
        name: tenant.name,
        metadata: { tenantId: tenant.id, tenantSlug: tenant.slug },
      })
    ).id;

  // ✅ Ensure DB row exists
  await prisma.tenantSubscription.upsert({
    where: { tenantId: tenant.id },
    create: {
      tenantId: tenant.id,
      stripeCustomerId: customerId,
      status: "inactive",
    },
    update: {
      stripeCustomerId: customerId,
    },
  });

  const base = tenantBaseUrl(tenant.slug);

  // ✅ Trial only once:
  // If we already stored a stripeSubscriptionId before, do NOT give trial again.
  const trialAlreadyUsed = Boolean(existing?.stripeSubscriptionId);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
    success_url: `${base}/app/upgrade?ok=1`,
    cancel_url: `${base}/app/upgrade?canceled=1`,

    // ✅ checkout metadata (useful fallback)
    metadata: { tenantId: tenant.id },

    // ✅ subscription metadata (your webhook relies on this!)
    subscription_data: {
      metadata: { tenantId: tenant.id },

      // ✅ 30-day trial (only if not already used)
      ...(trialAlreadyUsed ? {} : { trial_period_days: 30 }),
    },
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
