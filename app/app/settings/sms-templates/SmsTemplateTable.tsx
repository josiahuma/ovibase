import { deleteSmsTemplate } from "@/src/lib/sms-templates.actions";

export default function SmsTemplatesTable({
  templates,
}: {
  templates: {
    id: string;
    name: string;
    message: string;
  }[];
}) {
  if (templates.length === 0) {
    return (
      <div className="text-sm text-slate-500">
        No SMS templates yet. Add one above.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="text-left px-4 py-3">Name</th>
            <th className="text-left px-4 py-3">Message</th>
            <th className="text-right px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="px-4 py-3 font-medium">{t.name}</td>
              <td className="px-4 py-3 text-slate-600">
                {t.message}
              </td>
              <td className="px-4 py-3 text-right">
                <form action={deleteSmsTemplate.bind(null, t.id)}>
                  <button className="text-red-600 hover:underline text-xs">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
