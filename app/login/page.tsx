"use client";

import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      email: String(form.get("email") || "").toLowerCase(),
      password: String(form.get("password") || ""),
    };

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErr(data?.error || "Login failed");
      return;
    }

    window.location.href = "/app";
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold">Login</h1>
      <p className="text-sm text-gray-600 mt-1">Login to your workspace.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input className="w-full border p-2 rounded" name="email" placeholder="Email" type="email" required />
        <input className="w-full border p-2 rounded" name="password" placeholder="Password" type="password" required />

        {err && <div className="text-red-600 text-sm">{err}</div>}

        <button disabled={loading} className="w-full bg-black text-white p-2 rounded">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
