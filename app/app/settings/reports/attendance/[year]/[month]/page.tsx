"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import ExportPdfButton from "@/src/components/ExportPdfButton";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

type Row = { category: string; total: number };

export default function AttendanceMonthByCategoryPage() {
  const router = useRouter();
  const params = useParams<{ year: string; month: string }>();

  const year = Number(params.year);
  const month = Number(params.month);

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const exportRef = useRef<HTMLDivElement | null>(null);

  const monthLabel = MONTHS[month - 1] ?? `Month ${month}`;
  const title = useMemo(() => `Attendance by Category — ${monthLabel} ${year}`, [monthLabel, year]);

  useEffect(() => {
    if (!year || !month) return;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/reports/attendance-by-category?year=${year}&month=${month}`, {
          cache: "no-store",
        });

        const text = await res.text();
        let json: any = null;

        try {
          json = text ? JSON.parse(text) : null;
        } catch {
          json = null;
        }

        if (!res.ok) {
          const msgParts = [
            json?.error ? String(json.error) : `Request failed (${res.status})`,
            json?.message ? String(json.message) : null,
            !json && text ? `Raw: ${text.slice(0, 300)}` : null,
          ].filter(Boolean);

          setError(msgParts.join("\n"));
          setRows([]);
          return;
        }

        setRows((json?.data ?? []) as Row[]);
      } catch (e: any) {
        setError(e?.message ?? "Something went wrong.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [year, month]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">Breakdown of the selected month by event category.</p>
        </div>

        <div className="flex gap-2 items-center">
          <ExportPdfButton
            getElement={() => exportRef.current}
            filename={`attendance-by-category-${year}-${String(month).padStart(2, "0")}.pdf`}
            title={title}
          />
          <button
            type="button"
            onClick={() => router.push("/app/settings/reports")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            ← Back to Reports
          </button>
        </div>
      </div>

      {/* Everything inside this div will be exported */}
      <div ref={exportRef} className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
          <div className="text-sm font-medium text-slate-800 mb-3">Totals by Event Category</div>

          {loading ? (
            <div className="text-sm text-slate-500 py-10">Loading…</div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="font-semibold mb-1">Could not load report</div>
              <pre className="whitespace-pre-wrap text-xs leading-relaxed">{error}</pre>
            </div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-slate-500 py-10">No data for this month.</div>
          ) : (
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows}>
                  <XAxis dataKey="category" interval={0} angle={-15} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
