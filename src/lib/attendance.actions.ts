// ovibase/src/lib/attendance.actions.ts
"use server";

import { redirect } from "next/navigation";
import { requireTenant } from "@/src/lib/guards";
import { prisma } from "@/src/lib/prisma";

function str(v: FormDataEntryValue | null) {
  if (typeof v !== "string") return "";
  return v.trim();
}

function num(v: FormDataEntryValue | null) {
  const s = str(v);
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function dateFromInput(v: FormDataEntryValue | null) {
  const s = str(v);
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export async function createAttendance(formData: FormData) {
  const { tenant } = await requireTenant();

  const date = dateFromInput(formData.get("date"));
  const men = num(formData.get("men"));
  const women = num(formData.get("women"));
  const children = num(formData.get("children"));
  const event = str(formData.get("event"));

  if (!date) throw new Error("Date is required.");
  if (!event) throw new Error("Event category is required.");
  if (men < 0 || women < 0 || children < 0) throw new Error("Counts cannot be negative.");

  const total = men + women + children;

  await prisma.attendance.create({
    data: {
      tenantId: tenant.id,
      date,
      men,
      women,
      children,
      total,
      event,
    },
  });

  redirect("/app/attendance");
}

export async function updateAttendance(attendanceId: string, formData: FormData) {
  const { tenant } = await requireTenant();

  const date = dateFromInput(formData.get("date"));
  const men = num(formData.get("men"));
  const women = num(formData.get("women"));
  const children = num(formData.get("children"));
  const event = str(formData.get("event"));

  if (!date) throw new Error("Date is required.");
  if (!event) throw new Error("Event category is required.");
  if (men < 0 || women < 0 || children < 0) throw new Error("Counts cannot be negative.");

  const total = men + women + children;

  await prisma.attendance.updateMany({
    where: { id: attendanceId, tenantId: tenant.id },
    data: {
      date,
      men,
      women,
      children,
      total,
      event,
    },
  });

  redirect(`/app/attendance/${attendanceId}`);
}

export async function deleteAttendance(attendanceId: string) {
  const { tenant } = await requireTenant();

  await prisma.attendance.deleteMany({
    where: { id: attendanceId, tenantId: tenant.id },
  });

  redirect("/app/attendance");
}
