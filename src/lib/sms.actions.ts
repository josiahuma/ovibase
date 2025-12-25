// ovibase/src/lib/sms.actions.ts
"use server";

import { prisma } from "@/src/lib/prisma";
import { requireTenant } from "@/src/lib/guards";
import { requirePermission } from "@/src/lib/permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendTenantSms } from "@/src/lib/sms";

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

/**
 * ADMIN: Create SMS template
 */
export async function createSmsTemplate(formData: FormData) {
  const { tenant, session } = await requireTenant();

  // Only OWNER/ADMIN can manage templates
  const membership = await prisma.userTenant.findUnique({
    where: { userId_tenantId: { userId: session.userId, tenantId: tenant.id } },
    select: { role: true },
  });

  const role = membership?.role ?? "STAFF";
  const isAdmin = role === "OWNER" || role === "ADMIN";
  if (!isAdmin) redirect("/app");

  const name = s(formData.get("name"));
  const message = s(formData.get("message"));

  if (!name) redirect("/app/settings/sms-templates?error=Name is required");
  if (!message) redirect("/app/settings/sms-templates?error=Message is required");

  await prisma.smsTemplate.create({
    data: {
      tenantId: tenant.id,
      name,
      message,
    },
  });

  revalidatePath("/app/settings/sms-templates");
  redirect("/app/settings/sms-templates?ok=1");
}

/**
 * ADMIN: Delete SMS template
 */
export async function deleteSmsTemplate(templateId: string) {
  const { tenant, session } = await requireTenant();

  const membership = await prisma.userTenant.findUnique({
    where: { userId_tenantId: { userId: session.userId, tenantId: tenant.id } },
    select: { role: true },
  });

  const role = membership?.role ?? "STAFF";
  const isAdmin = role === "OWNER" || role === "ADMIN";
  if (!isAdmin) redirect("/app");

  await prisma.smsTemplate.deleteMany({
    where: { id: templateId, tenantId: tenant.id },
  });

  revalidatePath("/app/settings/sms-templates");
}

/**
 * DASHBOARD: Send bulk SMS (works with DashboardCelebrations)
 * It expects:
 * - templateId
 * - memberIds[] checkboxes (name="memberIds")
 */
export async function sendBulkSmsFromDashboard(formData: FormData) {
  return sendBulkSms(formData);
}

/**
 * Generic bulk sender (permission: sms)
 */
export async function sendBulkSms(formData: FormData) {
  const ctx = await requirePermission("sms");

  const templateId = s(formData.get("templateId"));
  if (!templateId) redirect("/app?error=Choose a template first.");

  const selectedIds = formData.getAll("memberIds").map((x) => String(x));
  if (!selectedIds.length) redirect("/app?error=Select at least one member.");

  const template = await prisma.smsTemplate.findFirst({
    where: { id: templateId, tenantId: ctx.tenant.id },
    select: { id: true, name: true, message: true },
  });

  if (!template) redirect("/app?error=Template not found.");

  const members = await prisma.member.findMany({
    where: {
      tenantId: ctx.tenant.id,
      id: { in: selectedIds },
      mobileNumber: { not: null },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      mobileNumber: true,
    },
  });

  const messages = members.map((m) => {
    const msg = template.message
      .replaceAll("{first_name}", m.firstName || "")
      .replaceAll("{last_name}", m.lastName || "")
      .replaceAll("{name}", `${m.firstName || ""} ${m.lastName || ""}`.trim());

    return {
      to: m.mobileNumber || "",
      message: msg,
      memberId: m.id,
    };
  });

  const tag = `template:${template.id}`;

  const result = await sendTenantSms({
    tenantId: ctx.tenant.id,
    messages: messages.map((m) => ({ to: m.to, message: m.message })),
    tag,
  });

  // Build a quick lookup for failed numbers -> error
  const failedMap = new Map<string, string>();
  for (const f of result.failures) failedMap.set(f.to, f.error);

  // Fetch provider used (if your sendTenantSms returns it; otherwise default)
  const provider = result.provider ?? "TEXTLOCAL";

  // Write logs (one row per message)
  await prisma.smsLog.createMany({
    data: messages.map((m) => {
      const err = failedMap.get(m.to);
      return {
        tenantId: ctx.tenant.id,
        templateId: template.id,
        memberId: m.memberId,
        to: m.to,
        message: m.message,
        tag,
        provider: provider as any,
        status: err ? ("FAILED" as any) : ("SENT" as any),
        error: err ?? null,
      };
    }),
  });

  console.log("SMS SEND (real)", {
    tenantId: ctx.tenant.id,
    template: template.name,
    attempted: result.attempted,
    sent: result.sent,
    failed: result.failed,
    failuresSample: result.failures.slice(0, 5),
  });

  revalidatePath("/app");

  if (result.failed > 0) {
    redirect(
      `/app?sms=partial&sent=${result.sent}&failed=${result.failed}&template=${encodeURIComponent(
        template.name
      )}`
    );
  }

  redirect(
    `/app?sms=sent&count=${result.sent}&template=${encodeURIComponent(template.name)}`
  );
}

/**
 * MEMBERS PAGE: Send bulk SMS to ALL members
 */
export async function sendBulkSmsToAllMembers(formData: FormData) {
  const ctx = await requirePermission("sms");

  const templateId = s(formData.get("templateId"));
  if (!templateId) redirect("/app/members?error=Choose a template");

  const template = await prisma.smsTemplate.findFirst({
    where: { id: templateId, tenantId: ctx.tenant.id },
    select: { id: true, name: true, message: true },
  });

  if (!template) redirect("/app/members?error=Template not found");

  const members = await prisma.member.findMany({
    where: {
      tenantId: ctx.tenant.id,
      mobileNumber: { not: null },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      mobileNumber: true,
    },
  });

  if (members.length === 0) {
    redirect("/app/members?error=No members with mobile numbers");
  }

  const messages = members.map((m) => {
    const msg = template.message
      .replaceAll("{first_name}", m.firstName || "")
      .replaceAll("{last_name}", m.lastName || "")
      .replaceAll("{name}", `${m.firstName || ""} ${m.lastName || ""}`.trim());

    return {
      to: m.mobileNumber!,
      message: msg,
    };
  });

  const result = await sendTenantSms({
    tenantId: ctx.tenant.id,
    messages,
    tag: `members:all:${template.id}`,
  });

  console.log("SMS BULK ALL", {
    tenantId: ctx.tenant.id,
    template: template.name,
    attempted: result.attempted,
    sent: result.sent,
    failed: result.failed,
  });

  revalidatePath("/app/members");

  if (result.failed > 0) {
    redirect(
      `/app/members?sms=partial&sent=${result.sent}&failed=${result.failed}`
    );
  }

  redirect(`/app/members?sms=sent&count=${result.sent}`);
}
