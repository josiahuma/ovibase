// app/login/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getTenantFromRequest, buildTenantUrl } from "@/src/lib/tenant";
import TenantLoginForm from "./tenant-login-form";

async function continueToWorkspace(formData: FormData) {
  "use server";

  const workspace = String(formData.get("workspace") ?? "").trim().toLowerCase();
  if (!workspace) redirect("/login?error=Enter your workspace name.");

  redirect(buildTenantUrl(workspace, "/login"));
}

/**
 * Builds the root (workspace chooser) login URL.
 * - Uses APP_BASE_DOMAIN in production (recommended)
 * - Falls back to deriving base domain from current host
 * - Removes ports in production
 */
async function getRootLoginUrl(): Promise<string> {
  const h = await headers();

  const forwardedProto = (h.get("x-forwarded-proto") || "http")
    .split(",")[0]
    .trim();

  // ✅ Preferred: control this in production
  const envBase = (process.env.APP_BASE_DOMAIN || "").trim().toLowerCase();
  if (envBase) {
    return `${forwardedProto}://${envBase}/login`;
  }

  // Fallback: derive from host headers
  const hostRaw =
    (h.get("x-forwarded-host") || h.get("host") || "localhost:3000")
      .split(",")[0]
      .trim();

  // Remove port unless it's local dev
  const isDevHost =
    hostRaw.includes("localhost") ||
    hostRaw.includes("127.0.0.1") ||
    hostRaw.endsWith(".local") ||
    hostRaw.includes(".local:");

  const host = isDevHost ? hostRaw : hostRaw.replace(/:\d+$/, "");

  // If host already has tenant subdomain, reduce to base domain (simple last-2 labels)
  const cleanHost = host.replace(/:\d+$/, "");
  const parts = cleanHost.split(".");
  const base = parts.length <= 2 ? cleanHost : parts.slice(-2).join(".");

  // If dev host includes port, keep it
  const finalHost = isDevHost ? host : base;

  return `${forwardedProto}://${finalHost}/login`;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }> | { error?: string };
}) {
  const tenant = await getTenantFromRequest();

  // ✅ Next.js can treat searchParams as async (depending on version)
  const sp =
    searchParams && typeof (searchParams as any).then === "function"
      ? await (searchParams as Promise<{ error?: string }>)
      : (searchParams as { error?: string } | undefined);

  const error = sp?.error;

  // ✅ TENANT MODE: show email/password
  if (tenant) {
    const rootLoginUrl = await getRootLoginUrl();

    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold text-slate-900">Login</div>
          <div className="text-sm text-slate-500 mt-1">
            Workspace:{" "}
            <span className="font-medium text-slate-800">{tenant.name}</span>
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-5">
            <TenantLoginForm />
          </div>

          <div className="mt-4 text-xs text-slate-500">
            Need a different workspace?{" "}
            <Link className="underline" href={rootLoginUrl}>
              Go to workspace chooser
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ROOT MODE: workspace chooser
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold text-slate-900">Login</div>
        <div className="text-sm text-slate-500 mt-1">Choose your workspace</div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form action={continueToWorkspace} className="mt-5 space-y-3">
          <label className="space-y-1 block">
            <div className="text-xs font-medium text-slate-600">Workspace</div>
            <input
              name="workspace"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="e.g. freshfountain"
              required
            />
            <div className="text-xs text-slate-500">
              This is the subdomain you registered.
            </div>
          </label>

          <button className="w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-medium hover:bg-slate-800">
            Continue to login
          </button>
        </form>

        <div className="mt-4 text-xs text-slate-500">
          Don&apos;t have a workspace?{" "}
          <Link className="underline" href="/signup">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
