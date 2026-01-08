import { prisma } from "@/src/lib/prisma";
import { requireTenant } from "@/src/lib/guards";
import { saveStripeSettings } from "@/src/lib/stripe-settings.actions";

function ensureAdminRole(role: string) {
  return role === "OWNER" || role === "ADMIN";
}

type SP = {
  ok?: string;
  error?: string;
};

export default async function StripeSettingsPage(props: {
  searchParams?: Promise<SP> | SP;
}) {
  const searchParams = props.searchParams
    ? await props.searchParams
    : undefined;

  const { session, tenant } = await requireTenant();
  if (!ensureAdminRole(session.role)) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Stripe</h1>
        <p className="mt-2 text-sm text-gray-600">You do not have access to this page.</p>
      </div>
    );
  }

  const cfg = await prisma.stripeProviderSetting.findUnique({
    where: { tenantId: tenant.id },
    select: { currency: true, publishableKey: true },
  });

  const base = process.env.APP_BASE_DOMAIN ?? "ovibase.com";

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Stripe Settings</h1>

      {searchParams?.ok && (
        <div className="mt-4 rounded bg-green-50 p-3 text-sm text-green-700">
          Saved successfully.
        </div>
      )}
      {searchParams?.error && (
        <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">
          Error: {searchParams.error}
        </div>
      )}

      <form action={saveStripeSettings} className="space-y-4 mt-6">
        <div className="grid gap-4">
          <label className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Currency</div>
            <input
              name="currency"
              defaultValue={cfg?.currency ?? "gbp"}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Publishable Key (optional)</div>
            <input
              name="publishableKey"
              defaultValue={cfg?.publishableKey ?? ""}
              placeholder="pk_test_..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Secret Key</div>
            <input
              name="secretKey"
              type="password"
              placeholder="sk_test_... or sk_live_..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
              required
            />
            <div className="text-xs text-slate-500">Stored encrypted and never shown again.</div>
          </label>

          <label className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Webhook Secret</div>
            <input
              name="webhookSecret"
              type="password"
              placeholder="whsec_..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
              required
            />
            <div className="text-xs text-slate-500">Stored encrypted and never shown again.</div>
          </label>
        </div>

        <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
          Save Stripe Settings
        </button>
      </form>


      <div className="mt-8 rounded border p-4">
        <h2 className="font-semibold">Webhook URL</h2>
        <pre className="mt-2 rounded bg-gray-50 p-3 text-sm overflow-auto">
{`https://${tenant.slug}.${base}/api/stripe/webhook`}
        </pre>
        <p className="mt-2 text-sm text-gray-700">
          Enable event: <code>checkout.session.completed</code>
        </p>
      </div>
    </div>
  );
}
