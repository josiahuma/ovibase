import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getTenantFromRequest, buildTenantUrl } from "@/src/lib/tenant";
import { getTenantStripe } from "@/src/lib/stripe";

function toAmount(raw: any): number | null {
  const n = Number(String(raw ?? "").trim());
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

export async function POST(req: Request) {
  const tenant = await getTenantFromRequest();
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 400 });

  const body = await req.json();

  const amount = toAmount(body.amount);
  const recurring = !!body.recurring;
  const interval = body.interval === "year" ? "year" : "month";
  const giftAid = !!body.giftAid;

  const donorName = String(body.donorName ?? "").trim();
  const donorEmail = String(body.donorEmail ?? "").trim() || null;

  const address1 = String(body.address1 ?? "").trim();
  const city = String(body.city ?? "").trim();
  const postcode = String(body.postcode ?? "").trim();

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
  }

  if (giftAid) {
    if (!donorName || !address1 || !city || !postcode) {
      return NextResponse.json({ error: "Gift Aid requires full name and full address" }, { status: 400 });
    }
  }

  const stripeBundle = await getTenantStripe(tenant.id);
  if (!stripeBundle) {
    return NextResponse.json({ error: "Stripe not configured for this tenant" }, { status: 400 });
  }

  const { stripe, cfg } = stripeBundle;

  const currency = (cfg.currency || "gbp").toLowerCase();
  const amountMinor = Math.round(amount * 100);

  const donation = await prisma.donation.create({
    data: {
      tenantId: tenant.id,
      amount,
      currency,
      isRecurring: recurring,
      interval: recurring ? interval : null,
      giftAid,
      donorName: donorName || null,
      donorEmail,
      address1: giftAid ? address1 || null : null,
      address2: giftAid ? String(body.address2 ?? "").trim() || null : null,
      city: giftAid ? city || null : null,
      county: giftAid ? String(body.county ?? "").trim() || null : null,
      postcode: giftAid ? postcode || null : null,
      country: giftAid ? String(body.country ?? "GB").trim().toUpperCase() || "GB" : null,
      status: "PENDING",
    },
  });

  const successUrl = await buildTenantUrl(tenant.slug, `/donate/success?donation=${donation.id}`);
  const cancelUrl = await buildTenantUrl(tenant.slug, `/donate?canceled=1`);

  const session = await stripe.checkout.sessions.create({
    mode: recurring ? "subscription" : "payment",
    customer_email: donorEmail ?? undefined,
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [
      recurring
        ? {
            price_data: {
              currency,
              unit_amount: amountMinor,
              product_data: { name: "Donation" },
              recurring: { interval },
            },
            quantity: 1,
          }
        : {
            price_data: {
              currency,
              unit_amount: amountMinor,
              product_data: { name: "Donation" },
            },
            quantity: 1,
          },
    ],

    metadata: {
      tenantId: tenant.id,
      donationId: donation.id,
      giftAid: giftAid ? "1" : "0",
      recurring: recurring ? "1" : "0",
    },

    // ✅ ADDITION #1: for one-off donation backups (payment_intent.succeeded)
    ...(recurring
      ? {}
      : {
          payment_intent_data: {
            metadata: {
              donationId: donation.id,
              tenantId: tenant.id,
            },
          },
        }),

    // ✅ ADDITION #2: for recurring donation backups (invoice.payment_succeeded)
    ...(recurring
      ? {
          subscription_data: {
            metadata: {
              donationId: donation.id,
              tenantId: tenant.id,
            },
          },
        }
      : {}),
  });

  await prisma.donation.update({
    where: { id: donation.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ url: session.url });
}
