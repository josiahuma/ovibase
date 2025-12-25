"use client";

import { useState } from "react";
import { saveSmsProvider } from "@/src/lib/sms-provider.actions";

type Existing = {
  provider: string;
  senderId: string | null;
  from: string | null;
  baseUrl: string | null;
} | null;

export default function SmsProviderForm({ existing }: { existing: Existing }) {
  const [provider, setProvider] = useState(existing?.provider ?? "TEXTLOCAL");

  return (
    <form action={saveSmsProvider} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <div className="text-xs font-medium text-slate-600">Provider</div>
          <select
            name="provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="TEXTLOCAL">TextLocal</option>
            <option value="TWILIO">Twilio</option>
            <option value="INFOBIP">Infobip</option>
            <option value="VONAGE">Vonage</option>
            <option value="OTHER">Other</option>
          </select>
        </label>

        <label className="space-y-1">
          <div className="text-xs font-medium text-slate-600">Sender ID</div>
          <input
            name="senderId"
            defaultValue={existing?.senderId ?? ""}
            placeholder="e.g. FreshFtn"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs font-medium text-slate-600">From (number)</div>
          <input
            name="from"
            defaultValue={existing?.from ?? ""}
            placeholder="Twilio From number (optional)"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </label>

        <label className="space-y-1">
          <div className="text-xs font-medium text-slate-600">Base URL</div>
          <input
            name="baseUrl"
            defaultValue={existing?.baseUrl ?? ""}
            placeholder="Provider API base url (optional)"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </label>
      </div>

      <label className="space-y-1 block">
        <div className="text-xs font-medium text-slate-600">API Key / Token</div>
        <input
          name="apiKey"
          type="password"
          placeholder={existing ? "•••••••• (enter new key to replace)" : "Enter API key"}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
      </label>

      <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
        Save Provider Settings
      </button>
    </form>
  );
}
