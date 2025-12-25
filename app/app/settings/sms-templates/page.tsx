// app/app/settings/sms-templates/page.tsx
import { redirect } from "next/navigation";
import { requireTenant } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";
import { createSmsTemplate, deleteSmsTemplate } from "@/src/lib/sms.actions";

export default async function SmsTemplatesAdminPage() {
  const { tenant, session } = await requireTenant();

  // Only OWNER/ADMIN can manage templates
  const membership = await prisma.userTenant.findUnique({
    where: { userId_tenantId: { userId: session.userId, tenantId: tenant.id } },
    select: { role: true },
  });

  const role = membership?.role ?? "STAFF";
  const isAdmin = role === "OWNER" || role === "ADMIN";
  if (!isAdmin) redirect("/app");

  const templates = await prisma.smsTemplate.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, message: true, createdAt: true },
    take: 500,
  });

  async function onDelete(id: string) {
    "use server";
    await deleteSmsTemplate(id);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          SMS Templates
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Create reusable messages for birthdays, anniversaries, reminders, and bulk texting.
        </p>
      </div>

      <form
        action={createSmsTemplate}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Template name</div>
            <input
              name="name"
              required
              placeholder="e.g. Birthday Message"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400"
            />
          </label>

          <div className="text-xs text-slate-500 sm:pt-6">
            Variables supported:{" "}
            <span className="font-mono">{`{first_name}`}</span>,{" "}
            <span className="font-mono">{`{last_name}`}</span>,{" "}
            <span className="font-mono">{`{name}`}</span>
          </div>
        </div>

        <label className="space-y-1 block">
          <div className="text-xs font-medium text-slate-600">Message</div>
          <textarea
            name="message"
            required
            rows={4}
            placeholder="Hi {first_name}, happy birthday! 🎉 ..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400"
          />
        </label>

        <div className="flex items-center justify-end">
          <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
            Add Template
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 text-sm font-medium text-slate-800">
          Templates
        </div>

        {templates.length === 0 ? (
          <div className="px-5 py-6 text-sm text-slate-500">
            No templates yet. Add one above to begin.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {templates.map((t) => (
              <div key={t.id} className="p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">
                      {t.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Created: {new Date(t.createdAt).toISOString().slice(0, 10)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <form action={onDelete.bind(null, t.id)}>
                      <button className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-wrap">
                  {t.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
