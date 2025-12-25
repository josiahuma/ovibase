// app/app/settings/sms-provider/page.tsx
import { requireAdmin } from "@/src/lib/permissions";
import { prisma } from "@/src/lib/prisma";
import SmsProviderForm from "./SmsProviderForm";

export default async function SmsProviderSettingsPage() {
  const { tenant } = await requireAdmin();

  const existing = await prisma.smsProviderSetting.findUnique({
    where: { tenantId: tenant.id },
    select: {
      provider: true,
      senderId: true,
      from: true,
      baseUrl: true,
      // do NOT read apiKeyEnc to UI
    },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          SMS Provider
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Add your SMS provider credentials for sending bulk SMS.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <SmsProviderForm existing={existing} />
      </div>

      <div className="text-xs text-slate-500">
        Tip: API keys are encrypted and never shown after saving.
      </div>
    </div>
  );
}
