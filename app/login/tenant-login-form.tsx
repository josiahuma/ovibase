// ovibase/app/login/tenant-login-form.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TenantLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error || "Login failed.");
        return;
      }

      // ✅ always stay on the tenant host
      router.replace("/app");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {err ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      <label className="space-y-1 block">
        <div className="text-xs font-medium text-slate-600">Email</div>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          placeholder="umajosiah@gmail.com"
        />
      </label>

      <label className="space-y-1 block">
        <div className="text-xs font-medium text-slate-600">Password</div>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          placeholder="••••••••"
        />
      </label>

      <button
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
