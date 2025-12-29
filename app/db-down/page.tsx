export default function DbDownPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Temporarily unavailable</h1>
        <p className="text-sm text-slate-600 mt-2">
          We’re having trouble connecting to the database right now.
          Please refresh in a few seconds.
        </p>

        <div className="mt-5 flex gap-2">
          <a
            href=""
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm"
          >
            Refresh
          </a>
          <a
            href="/app"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
          >
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
