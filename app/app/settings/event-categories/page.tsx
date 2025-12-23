import type { EventCategory } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { requireTenant } from "@/src/lib/guards";
import { createEventCategory, deleteEventCategory } from "@/src/lib/settings.actions";

export default async function EventCategoriesPage() {
  const { session, tenant } = await requireTenant();
  if (!(session.role === "OWNER" || session.role === "ADMIN")) redirect("/app");

  const categories: EventCategory[] = await prisma.eventCategory.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  async function onDelete(id: string) {
    "use server";
    await deleteEventCategory(id);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Event Categories
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Add categories you’ll use when recording attendance.
        </p>
      </div>

      <form
        action={createEventCategory}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Category name</div>
            <input
              name="name"
              placeholder="e.g. Sunday Service"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400"
              required
            />
          </label>

          <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Add Category
          </button>
        </div>

        <div className="text-xs text-slate-500 mt-3">
          These categories appear in the attendance “Event category” dropdown.
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="text-sm font-medium text-slate-900">Saved categories</div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-5 py-3">Name</th>
              <th className="text-left px-5 py-3 hidden sm:table-cell">Created</th>
              <th className="text-right px-5 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-slate-500" colSpan={3}>
                  No categories yet. Add one above to begin.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="border-t border-slate-200 hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-medium text-slate-900">{c.name}</td>
                  <td className="px-5 py-3 text-slate-600 hidden sm:table-cell">
                    {new Date(c.createdAt).toISOString().slice(0, 10)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={onDelete.bind(null, c.id)}>
                      <button className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
