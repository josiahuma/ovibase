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

    // Redirect user to tenant domain
    const base = process.env.NEXT_PUBLIC_APP_BASE_DOMAIN || "ovibase.local:3000";

    const isLocal = base.endsWith(".local:3000") || base.includes("localhost");
    const protocol = isLocal ? "http" : "https";

    window.location.href = `${protocol}://${payload.tenantSlug}.${base}/app`;

  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold">Create your OviBase workspace</h1>
      <p className="text-sm text-gray-600 mt-1">Churches, charities & SMEs.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input className="w-full border p-2 rounded" name="tenantName" placeholder="Organisation name" required />
        <input className="w-full border p-2 rounded" name="tenantSlug" placeholder="Subdomain (e.g. gracechurch)" required />
        <input className="w-full border p-2 rounded" name="fullName" placeholder="Your full name" required />
        <input className="w-full border p-2 rounded" name="email" placeholder="Email" type="email" required />
        <input className="w-full border p-2 rounded" name="password" placeholder="Password" type="password" required />

        {err && <div className="text-red-600 text-sm">{err}</div>}

        <button disabled={loading} className="w-full bg-black text-white p-2 rounded">
          {loading ? "Creating..." : "Create Workspace"}
        </button>
      </form>
    </div>
  );
}
