"use client";

import { useMemo, useState } from "react";

type Fund = { id: string; name: string; isDefault: boolean };

export default function DonateClient({
  tenantName,
  funds,
}: {
  tenantName: string;
  funds: Fund[];
}) {
  const defaultFund =
    funds.find((f) => f.isDefault) ?? funds[0] ?? null;

  const [amount, setAmount] = useState<string>("20");

  // ✅ store selected fundId (not name)
  const [fundId, setFundId] = useState<string>(defaultFund?.id ?? "");
  const selectedFundName =
    funds.find((f) => f.id === fundId)?.name ?? "General";

  const [frequency, setFrequency] = useState<"oneoff" | "month" | "year">("oneoff");
  const [giftAid, setGiftAid] = useState(false);
  const [coverFees, setCoverFees] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");

  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("GB");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numericAmount = useMemo(() => {
    const n = Number(String(amount ?? "").trim());
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  // Optional fee cover
  const finalAmount = useMemo(() => {
    if (!coverFees) return numericAmount;
    const fee = numericAmount * 0.036 + 0.2;
    return Math.round((numericAmount + fee) * 100) / 100;
  }, [numericAmount, coverFees]);

  const recurring = frequency !== "oneoff";
  const interval = frequency === "year" ? "year" : "month";

  const canProceed = useMemo(() => {
    if (!numericAmount || numericAmount <= 0) return false;
    if (!acceptPrivacy) return false;

    // If you REQUIRE fund selection when funds exist:
    if (funds.length > 0 && !fundId) return false;

    if (giftAid) {
      if (!donorName.trim()) return false;
      if (!address1.trim() || !city.trim() || !postcode.trim()) return false;
    }

    return true;
  }, [numericAmount, acceptPrivacy, giftAid, donorName, address1, city, postcode, funds.length, fundId]);

  async function submit() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,

          // ✅ send fund info dynamically
          fundId: fundId || null,
          fundName: selectedFundName,

          recurring,
          interval: recurring ? interval : null,
          giftAid,
          donorName,
          donorEmail,
          address1,
          address2,
          city,
          county,
          postcode,
          country,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to start checkout");

      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-slate-500">GIVE ONLINE</div>
            <h1 className="text-xl font-semibold text-slate-900">{tenantName}</h1>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
            <span className="h-2 w-2 rounded-full bg-green-600" />
            Secure
          </div>
        </div>

        <div className="mt-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-900">Make a donation</h2>
            <p className="mt-1 text-sm text-slate-600">
              You are donating to <span className="font-medium">{tenantName}</span>.
            </p>
          </div>

          {/* Amount */}
          <div className="mt-6">
            <div className="text-xs font-medium text-slate-600">Amount</div>
            <div className="mt-2 flex items-center rounded-lg border border-slate-200 bg-white px-3 py-3">
              <span className="mr-2 text-slate-400">£</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                className="w-full text-2xl font-semibold text-slate-900 outline-none"
                placeholder="0.00"
              />
            </div>

            {coverFees && numericAmount > 0 && (
              <div className="mt-2 text-xs text-slate-500">
                With fee cover: <span className="font-medium">£{finalAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Fund / Frequency / Method */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <label className="space-y-1">
              <div className="text-xs font-medium text-slate-600">Fund</div>
              <select
                value={fundId}
                onChange={(e) => setFundId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                disabled={funds.length === 0}
              >
                {funds.length === 0 ? (
                  <option value="">General</option>
                ) : (
                  funds.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))
                )}
              </select>
              {funds.length === 0 && (
                <div className="text-xs text-slate-500">
                  No funds configured yet (admin can add them in Settings).
                </div>
              )}
            </label>

            <label className="space-y-1">
              <div className="text-xs font-medium text-slate-600">Frequency</div>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
              >
                <option value="oneoff">One-off</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </label>

            <label className="space-y-1">
              <div className="text-xs font-medium text-slate-600">Method</div>
              <select
                value="card"
                disabled
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
              >
                <option value="card">Card</option>
              </select>
            </label>
          </div>

          {/* Gift Aid */}
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={giftAid}
                onChange={(e) => setGiftAid(e.target.checked)}
                className="mt-1"
              />
              <div>
                <div className="text-sm font-medium text-slate-900">
                  I am a UK tax payer and wish Gift Aid to be claimed.
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  I want to Gift Aid my donation(s) to {tenantName}. I am a UK taxpayer and
                  understand that if I pay less Income Tax and/or Capital Gains Tax than the amount
                  of Gift Aid claimed on all my donations in that tax year it is my responsibility
                  to pay any difference.
                </p>
              </div>
            </label>

            {giftAid && (
              <div className="mt-4 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1">
                    <div className="text-xs font-medium text-slate-600">Full name</div>
                    <input
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      placeholder="Your full name"
                    />
                  </label>

                  <label className="space-y-1">
                    <div className="text-xs font-medium text-slate-600">Email (optional)</div>
                    <input
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      placeholder="you@example.com"
                    />
                  </label>
                </div>

                <label className="space-y-1">
                  <div className="text-xs font-medium text-slate-600">Address line 1</div>
                  <input
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    placeholder="House number and street"
                  />
                </label>

                <label className="space-y-1">
                  <div className="text-xs font-medium text-slate-600">Address line 2 (optional)</div>
                  <input
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    placeholder="Apartment, suite, etc."
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="space-y-1">
                    <div className="text-xs font-medium text-slate-600">City</div>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      placeholder="City"
                    />
                  </label>

                  <label className="space-y-1">
                    <div className="text-xs font-medium text-slate-600">County (optional)</div>
                    <input
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      placeholder="County"
                    />
                  </label>

                  <label className="space-y-1">
                    <div className="text-xs font-medium text-slate-600">Postcode</div>
                    <input
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      placeholder="Postcode"
                    />
                  </label>
                </div>

                <label className="space-y-1">
                  <div className="text-xs font-medium text-slate-600">Country</div>
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    placeholder="GB"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Cover fees */}
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={coverFees}
                onChange={(e) => setCoverFees(e.target.checked)}
                className="mt-1"
              />
              <div>
                <div className="text-sm font-medium text-slate-900">
                  Increase my donation to{" "}
                  {numericAmount > 0 ? `£${finalAmount.toFixed(2)}` : "cover fees"} to cover the transaction fee.
                </div>
                <div className="text-xs text-slate-600">
                  Optional — helps ensure the full donation reaches {tenantName}.
                </div>
              </div>
            </label>
          </div>

          {/* Privacy */}
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={acceptPrivacy}
                onChange={(e) => setAcceptPrivacy(e.target.checked)}
                className="mt-1"
              />
              <div>
                <div className="text-sm font-medium text-slate-900">
                  I accept your <span className="underline">Privacy Notice</span>
                </div>
                <div className="text-xs text-slate-600">
                  It is important that you read and understand how we use your personal data.
                </div>
              </div>
            </label>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={!canProceed || loading}
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-50"
          >
            {loading ? "Redirecting..." : "Proceed"}
          </button>
        </div>
      </div>
    </div>
  );
}
