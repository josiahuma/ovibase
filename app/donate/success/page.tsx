import { prisma } from "@/src/lib/prisma";
import { getTenantFromRequest } from "@/src/lib/tenant";

type SP = { donation?: string };

export default async function DonateSuccessPage(props: {
  searchParams?: Promise<SP> | SP;
}) {
  const tenant = await getTenantFromRequest();
  const searchParams = props.searchParams ? await props.searchParams : undefined;

  const donationId = searchParams?.donation;

  if (!tenant) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <h1 className="text-xl font-semibold">Donation</h1>
        <p className="mt-2 text-sm text-slate-600">Tenant not found.</p>
      </div>
    );
  }

  if (!donationId) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <h1 className="text-xl font-semibold">Donation</h1>
        <p className="mt-2 text-sm text-slate-600">Missing donation reference.</p>
      </div>
    );
  }

  const donation = await prisma.donation.findFirst({
    where: { id: donationId, tenantId: tenant.id },
    select: { status: true, amount: true, currency: true, paidAt: true },
  });

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Thank you!</h1>

        {!donation ? (
          <p className="mt-2 text-sm text-slate-600">
            We couldn’t find that donation.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-600">
              Your donation is currently:{" "}
              <span className="font-medium">{donation.status}</span>
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Amount: <span className="font-medium">{donation.currency.toUpperCase()} {String(donation.amount)}</span>
            </p>

            {donation.status !== "PAID" && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Your payment is still being confirmed. This page will update after Stripe confirms the payment (usually a few seconds).
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <a
                href="/donate"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                Make another donation
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
