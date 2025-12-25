// ovibase/src/lib/sms/index.ts
import { prisma } from "@/src/lib/prisma";
import { decryptSecret } from "@/src/lib/crypto";

export type SmsMessage = {
  to: string;
  message: string;
};

export type SmsSendResult = {
  provider: string;
  attempted: number;
  sent: number;
  failed: number;
  failures: Array<{ to: string; error: string }>;
};

function cleanNumber(n: string) {
  return n.replace(/\s+/g, "").trim();
}

async function sendTxtLocal(params: {
  apiKey: string;
  sender: string;
  to: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const body = new URLSearchParams();
    body.append("apikey", params.apiKey);
    body.append("numbers", cleanNumber(params.to));
    body.append("sender", params.sender);
    body.append("message", params.message);

    const res = await fetch("https://api.txtlocal.com/send/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = await res.json().catch(() => null);

    // TxtLocal usually returns { status: 'success' | 'failure', ... }
    if (!res.ok) {
      return {
        ok: false,
        error:
          (data && JSON.stringify(data)) ||
          `HTTP ${res.status} from TxtLocal`,
      };
    }

    if (!data || data.status !== "success") {
      return {
        ok: false,
        error: data ? JSON.stringify(data) : "Unknown TxtLocal response",
      };
    }

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "fetch failed" };
  }
}

export async function sendTenantSms(params: {
  tenantId: string;
  messages: SmsMessage[];
  tag?: string; // unused for txtlocal, kept for future providers/logging
}): Promise<SmsSendResult> {
  const attempted = params.messages.length;

  const setting = await prisma.smsProviderSetting.findUnique({
    where: { tenantId: params.tenantId },
    select: {
      provider: true,
      apiKeyEnc: true,
      apiKeyIv: true,
      apiKeyTag: true,
      senderId: true,
      from: true,
      baseUrl: true,
    },
  });

  if (!setting) {
    return {
      provider: "NONE",
      attempted,
      sent: 0,
      failed: attempted,
      failures: params.messages.map((m) => ({
        to: m.to,
        error: "SMS provider not configured. Add it in Admin Settings → SMS Provider.",
      })),
    };
  }

  if (!setting.apiKeyEnc || !setting.apiKeyIv || !setting.apiKeyTag) {
    return {
      provider: String(setting.provider),
      attempted,
      sent: 0,
      failed: attempted,
      failures: params.messages.map((m) => ({
        to: m.to,
        error:
          "SMS provider API key is missing. Add it in Admin Settings → SMS Provider.",
      })),
    };
  }

  const apiKey = decryptSecret({
    enc: setting.apiKeyEnc,
    iv: setting.apiKeyIv,
    tag: setting.apiKeyTag,
  });

  const provider = String(setting.provider);

  // Sender rules: TxtLocal sender must be 3-11 chars and alphanumeric (usually).
  // We won’t hard-block here; we’ll let TxtLocal validate and return a failure.
  const sender =
    (setting.senderId && setting.senderId.trim()) ||
    "OVIBASE";

  const failures: Array<{ to: string; error: string }> = [];

  // Send each message (parallel). If you prefer slower safe mode, make it sequential.
  const results = await Promise.allSettled(
    params.messages.map(async (m) => {
      const to = cleanNumber(m.to);
      if (!to) {
        failures.push({ to: m.to, error: "Missing recipient number." });
        return;
      }

      if (provider === "TEXTLOCAL") {
        const r = await sendTxtLocal({
          apiKey,
          sender,
          to,
          message: m.message,
        });

        if (!r.ok) failures.push({ to, error: r.error || "Failed" });
        return;
      }

      failures.push({
        to,
        error: `Provider not implemented: ${provider}`,
      });
    })
  );

  // If Promise itself rejects (shouldn't), treat as failure
  for (const r of results) {
    if (r.status === "rejected") {
      failures.push({ to: "unknown", error: r.reason?.message || "Failed" });
    }
  }

  const failed = failures.length;
  const sent = attempted - failed;

  return {
    provider,
    attempted,
    sent,
    failed,
    failures,
  };
}
