import { createSmsTemplate } from "@/src/lib/sms-templates.actions";

export default function SmsTemplateForm() {
  return (
    <form
      action={createSmsTemplate}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
    >
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Template name
        </label>
        <input
          name="name"
          required
          placeholder="e.g. Sunday Service Reminder"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Message
        </label>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="Hi {first_name}, join us this Sunday..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="text-xs text-slate-500">
        Available placeholders:{" "}
        <code className="text-slate-700">
          {"{first_name} {last_name} {church_unit} {event}"}
        </code>
      </div>

      <div className="flex justify-end">
        <button className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
          Add Template
        </button>
      </div>
    </form>
  );
}
