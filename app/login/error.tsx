"use client";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold text-slate-900">
          Something went wrong
        </div>
        <div className="text-sm text-slate-600 mt-2">
          Please try again.
        </div>

        {error?.digest ? (
          <div className="mt-3 text-xs text-slate-500">
            Error code: <span className="font-mono">{error.digest}</span>
          </div>
        ) : null}

        <button
          onClick={reset}
          className="mt-5 w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-medium hover:bg-slate-800"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
