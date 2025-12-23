import { requireAdmin } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";
import SmsTemplateForm from "./SmsTemplateForm";
import SmsTemplatesTable from "./SmsTemplateTable";

export default async function SmsTemplatesPage() {
  const { tenant } = await requireAdmin();

  const templates = await prisma.smsTemplate.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">SMS Templates</h1>
        <p className="text-sm text-slate-500 mt-1">
          Create reusable SMS messages for reminders, birthdays and bulk messaging.
        </p>
      </div>

      <SmsTemplateForm />

      <SmsTemplatesTable templates={templates} />
    </div>
  );
}
