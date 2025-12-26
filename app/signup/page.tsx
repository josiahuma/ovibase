"use client";

import { useState } from "react";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      tenantName: String(form.get("tenantName") || ""),
      tenantSlug: String(form.get("tenantSlug") || "").toLowerCase(),
      fullName: String(form.get("fullName") || ""),
      email: String(form.get("email") || "").toLowerCase(),
      password: String(form.get("password") || ""),
    };

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErr(data?.error?.formErrors?.[0] || data?.error || "Signup failed");
      return;
    }

    const base =
      process.env.NEXT_PUBLIC_APP_BASE_DOMAIN || "ovibase.local:3000";
    const isLocal = base.includes("local") || base.includes("localhost");
    const protocol = isLocal ? "http" : "https";

    window.location.href = `${protocol}://${payload.tenantSlug}.${base}/app`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Create your workspace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            OviBase for churches, charities & organisations
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <Field
            label="Organisation name"
            name="tenantName"
            placeholder="e.g. Grace Church"
            required
          />

          <Field
            label="Workspace subdomain"
            name="tenantSlug"
            placeholder="e.g. gracechurch"
            hint="This becomes your login URL"
            required
          />

          <Field
            label="Your full name"
            name="fullName"
            placeholder="e.g. John Doe"
            required
          />

          <Field
            label="Email address"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />

          <Field
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />

          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          <button
            disabled={loading}
            className="mt-2 w-full inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Creating workspace…" : "Create Workspace"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Already have a workspace?{" "}
          <a
            href="/login"
            className="font-medium text-slate-900 hover:underline"
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- */
/* Reusable field component  */
/* ------------------------- */
function Field({
  label,
  name,
  type = "text",
  placeholder,
  hint,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-1 block">
      <div className="text-xs font-medium text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </div>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400"
      />
      {hint && <div className="text-xs text-slate-500">{hint}</div>}
    </label>
  );
}
