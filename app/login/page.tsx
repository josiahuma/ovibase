// ovibase/app/login/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTenantFromRequest, buildTenantUrl } from "@/src/lib/tenant";
import TenantLoginForm from "./tenant-login-form";

async function continueToWorkspace(formData: FormData) {
  "use server";

  const workspace = String(formData.get("workspace") ?? "").trim().toLowerCase();
  if (!workspace) redirect("/login?error=Enter your workspace name.");

  redirect(buildTenantUrl(workspace, "/login"));
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }> | { error?: string };
}) {
  const tenant = await getTenantFromRequest();

  // ✅ Next.js (newer) can treat searchParams as async
  const sp =
    searchParams && typeof (searchParams as any).then === "function"
      ? await (searchParams as Promise<{ error?: string }>)
      : (searchParams as { error?: string } | undefined);

  const error = sp?.error;

  // ✅ TENANT MODE: show email/password
  if (tenant) {
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
            <Link className="underline" href={`http://ovibase.local:3000/login`}>
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
