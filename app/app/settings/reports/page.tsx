"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// month labels
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

type AttendancePoint = { month: number; total: number };
type FinancePoint = { month: number; income: number; expense: number };

export default function ReportsPage() {
  // ✅ Replace this with however you already store tenantId (cookie, session, etc.)
  const tenantId = useMemo(() => {
    // Example: read from localStorage or your existing tenant context
    return (typeof window !== "undefined" && localStorage.getItem("tenantId")) || "";
  }, []);

  const [years, setYears] = useState<number[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const [attendance, setAttendance] = useState<AttendancePoint[]>([]);
  const [finance, setFinance] = useState<FinancePoint[]>([]);
  const [tab, setTab] = useState<"attendance" | "finance">("attendance");

  useEffect(() => {
    if (!tenantId) return;

    (async () => {
      const res = await fetch(`/api/reports/years?tenantId=${encodeURIComponent(tenantId)}`);
      const json = await res.json();
      const ys = (json.years ?? []) as number[];
      setYears(ys);

      // pick latest available year if any
      if (ys.length > 0) setYear(ys[0]);
    })();
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId || !year) return;

    (async () => {
      const aRes = await fetch(`/api/reports/attendance?tenantId=${encodeURIComponent(tenantId)}&year=${year}`);
      const aJson = await aRes.json();
      setAttendance((aJson.data ?? []) as AttendancePoint[]);

      const fRes = await fetch(`/api/reports/finance?tenantId=${encodeURIComponent(tenantId)}&year=${year}`);
      const fJson = await fRes.json();
      setFinance((fJson.data ?? []) as FinancePoint[]);
    })();
  }, [tenantId, year]);

  const attendanceChartData = attendance.map(p => ({
    month: MONTHS[p.month - 1] ?? String(p.month),
    total: p.total,
  }));

  const financeChartData = finance.map(p => ({
    month: MONTHS[p.month - 1] ?? String(p.month),
    income: p.income,
    expense: p.expense,
  }));

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">Monthly attendance and finance summary.</p>
        </div>

        <div className="flex gap-2 items-center">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              className={`px-3 py-1.5 text-sm rounded-md ${tab === "attendance" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"}`}
              onClick={() => setTab("attendance")}
              type="button"
            >
              Attendance
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-md ${tab === "finance" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"}`}
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
              years.map((y) => <option key={y} value={y}>{y}</option>)
            )}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        {tab === "attendance" ? (
          <>
            <div className="text-sm font-medium text-slate-800 mb-3">Attendance (Monthly Totals)</div>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceChartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm font-medium text-slate-800 mb-3">Finance (Income vs Expense)</div>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financeChartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" />
                  <Bar dataKey="expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
