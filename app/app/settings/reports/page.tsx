"use client";

// ovibase/app/app/settings/reports/page.tsx
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import ExportPdfButton from "@/src/components/ExportPdfButton";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

type AttendancePoint = { month: number; total: number };
type FinancePoint = { month: number; income: number; expense: number };

type AttendanceChartRow = { month: string; total: number; monthNumber: number };
type FinanceChartRow = { month: string; income: number; expense: number; monthNumber: number };

export default function ReportsPage() {
  const router = useRouter();
  const exportRef = useRef<HTMLDivElement | null>(null);

  const [years, setYears] = useState<number[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [attendance, setAttendance] = useState<AttendancePoint[]>([]);
  const [finance, setFinance] = useState<FinancePoint[]>([]);
  const [tab, setTab] = useState<"attendance" | "finance">("attendance");

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/reports/years`, { cache: "no-store" });
      const json = await res.json();
      const ys = (json.years ?? []) as number[];
      setYears(ys);
      if (ys.length > 0) setYear(ys[0]);
    })();
  }, []);

  useEffect(() => {
    if (!year) return;

    (async () => {
      const aRes = await fetch(`/api/reports/attendance?year=${year}`, { cache: "no-store" });
      const aJson = await aRes.json();
      setAttendance((aJson.data ?? []) as AttendancePoint[]);

      const fRes = await fetch(`/api/reports/finance?year=${year}`, { cache: "no-store" });
      const fJson = await fRes.json();
      setFinance((fJson.data ?? []) as FinancePoint[]);
    })();
  }, [year]);

  const attendanceChartData: AttendanceChartRow[] = attendance.map((p) => ({
    month: MONTHS[p.month - 1] ?? String(p.month),
    total: p.total,
    monthNumber: p.month,
  }));

  const financeChartData: FinanceChartRow[] = finance.map((p) => ({
    month: MONTHS[p.month - 1] ?? String(p.month),
    income: p.income,
    expense: p.expense,
    monthNumber: p.month,
  }));

  const handleAttendanceBarClick = (bar: any) => {
    const payload = bar?.payload as AttendanceChartRow | undefined;
    const monthNumber = Number(payload?.monthNumber);
    if (!year || !monthNumber || Number.isNaN(monthNumber)) return;
    router.push(`/app/settings/reports/attendance/${year}/${monthNumber}`);
  };

  const handleFinanceBarClick = (bar: any) => {
    const payload = bar?.payload as FinanceChartRow | undefined;
    const monthNumber = Number(payload?.monthNumber);
    if (!year || !monthNumber || Number.isNaN(monthNumber)) return;
    router.push(`/app/settings/reports/finance/${year}/${monthNumber}`);
  };

  const exportTitle =
    tab === "attendance"
      ? `Reports — Attendance (Monthly Totals) — ${year}`
      : `Reports — Finance (Income vs Expense) — ${year}`;

  const exportFilename =
    tab === "attendance"
      ? `reports-attendance-${year}.pdf`
      : `reports-finance-${year}.pdf`;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">Monthly attendance and finance summary.</p>
        </div>

        <div className="flex gap-2 items-center">
          <ExportPdfButton
            getElement={() => exportRef.current}
            filename={exportFilename}
            title={exportTitle}
          />

          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              className={`px-3 py-1.5 text-sm rounded-md ${
                tab === "attendance" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => setTab("attendance")}
              type="button"
            >
              Attendance
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-md ${
                tab === "finance" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => setTab("finance")}
              type="button"
            >
              Finance
            </button>
          </div>

          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            disabled={years.length === 0}
          >
            {years.length === 0 ? (
              <option>No data yet</option>
            ) : (
              years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Everything inside here is what will export */}
      <div ref={exportRef} className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        {tab === "attendance" ? (
          <>
            <div className="text-sm font-medium text-slate-800 mb-3">
              Attendance (Monthly Totals)
              <span className="ml-2 text-xs text-slate-500">(click a month to drill down)</span>
            </div>

            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceChartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="total"
                    style={{ cursor: "pointer" }}
                    onClick={handleAttendanceBarClick}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm font-medium text-slate-800 mb-3">
              Finance (Income vs Expense)
              <span className="ml-2 text-xs text-slate-500">(click a month to drill down)</span>
            </div>

            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financeChartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="income"
                    style={{ cursor: "pointer" }}
                    onClick={handleFinanceBarClick}
                  />
                  <Bar
                    dataKey="expense"
                    fill="#ef4444"
                    style={{ cursor: "pointer" }}
                    onClick={handleFinanceBarClick}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
