// src/components/DashboardCelebrations.tsx
"use client";

import { useMemo, useState } from "react";
import { sendBulkSmsFromDashboard } from "@/src/lib/sms.actions";

type SmsTemplate = {
  id: string;
  name: string;
  message: string;
};

type Celebrant = {
  id: string;
  firstName: string;
  lastName: string | null;
  mobileNumber: string | null;
  dateLabel: string; // e.g. "Jan 12"
  daysAway: number;  // 0..30
};

export default function DashboardCelebrations({
  birthdayMembers,
  anniversaryMembers,
  smsTemplates,
}: {
  birthdayMembers: Celebrant[];
  anniversaryMembers: Celebrant[];
  smsTemplates: SmsTemplate[];
}) {
  const [tab, setTab] = useState<"birthdays" | "anniversaries">("birthdays");
  const [templateId, setTemplateId] = useState<string>(smsTemplates[0]?.id ?? "");

  const list = tab === "birthdays" ? birthdayMembers : anniversaryMembers;

  const initialSelected = useMemo(() => new Set(list.map((m) => m.id)), [list]);
  const [selected, setSelected] = useState<Set<string>>(initialSelected);

  // When tab changes, reset selected to all in view
  function switchTab(next: "birthdays" | "anniversaries") {
    setTab(next);
    const nextList = next === "birthdays" ? birthdayMembers : anniversaryMembers;
    setSelected(new Set(nextList.map((m) => m.id)));
  }

  const selectedCount = selected.size;

  const disabledReason =
    smsTemplates.length === 0
      ? "Create an SMS template in Admin Settings first."
      : selectedCount === 0
        ? "Select at least one member."
        : "";

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-base font-semibold text-slate-900">Celebrations</div>
          <div className="text-sm text-slate-500">
            Upcoming birthdays and anniversaries (next 30 days).
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => switchTab("birthdays")}
              className={
                "px-3 py-1.5 text-sm rounded-md " +
                (tab === "birthdays"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-50")
              }
            >
              Birthdays
            </button>
            <button
              type="button"
              onClick={() => switchTab("anniversaries")}
              className={
                "px-3 py-1.5 text-sm rounded-md " +
                (tab === "anniversaries"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-50")
              }
            >
              Anniversaries
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
            <div className="text-sm font-medium text-slate-800">
              {tab === "birthdays" ? "Upcoming Birthdays" : "Upcoming Anniversaries"}
            </div>
            <button
              type="button"
              className="text-sm text-slate-600 hover:text-slate-900"
              onClick={() => {
                const ids = list.map((m) => m.id);
                setSelected(new Set(ids));
              }}
            >
              Select all
            </button>
          </div>

          {list.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">
              No upcoming {tab === "birthdays" ? "birthdays" : "anniversaries"} in the next 30 days.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {list.map((m) => {
                const checked = selected.has(m.id);
                const hasMobile = (m.mobileNumber ?? "").trim().length > 0;

                return (
                  <label
                    key={m.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = new Set(selected);
                        if (e.target.checked) next.add(m.id);
                        else next.delete(m.id);
                        setSelected(next);
                      }}
                      className="h-4 w-4"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {m.firstName} {m.lastName ?? ""}
                      </div>
                      <div className="text-xs text-slate-500">
                        {hasMobile ? m.mobileNumber : "No mobile number"} • {m.dateLabel} •{" "}
                        {m.daysAway === 0 ? "Today" : `${m.daysAway} day(s)`}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500">
                      {hasMobile ? "" : "⚠️"}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 p-4 space-y-3">
          <div className="text-sm font-medium text-slate-800">Bulk SMS</div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-600">Template</div>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
              disabled={smsTemplates.length === 0}
            >
              {smsTemplates.length === 0 ? (
                <option value="">No templates yet</option>
              ) : (
                smsTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))
              )}
            </select>
            <div className="text-xs text-slate-500">
              Supports: <span className="font-mono">{`{first_name}`}</span>,{" "}
              <span className="font-mono">{`{last_name}`}</span>,{" "}
              <span className="font-mono">{`{name}`}</span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-medium text-slate-600">Selected</div>
            <div className="text-2xl font-semibold text-slate-900 mt-1">
              {selectedCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Only members with a mobile number will be sent.
            </div>
          </div>

          <form
            action={sendBulkSmsFromDashboard}
            onSubmit={(e) => {
              if (smsTemplates.length === 0 || selectedCount === 0) {
                e.preventDefault();
                return;
              }
            }}
            className="space-y-2"
          >
            <input type="hidden" name="templateId" value={templateId} />
            {Array.from(selected).map((id) => (
              <input key={id} type="hidden" name="memberIds" value={id} />
            ))}

            <button
              type="submit"
              disabled={smsTemplates.length === 0 || selectedCount === 0}
              className="w-full inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500"
              title={disabledReason}
            >
              Send SMS
            </button>

            {disabledReason ? (
              <div className="text-xs text-slate-500">{disabledReason}</div>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
