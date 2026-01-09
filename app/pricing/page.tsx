import Link from "next/link";
import PublicHeader from "@/src/components/PublicHeader";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicHeader />

      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Simple pricing for churches
            </h1>
            <p className="mt-3 text-slate-600 text-base sm:text-lg">
              Start free and get organised. Upgrade only when you’re ready to
              unlock more tools for your church office.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                Get started free
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Talk to us about onboarding
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <div className="grid gap-6 lg:grid-cols-2">
            <PlanCard
              badge="Free"
              title="Free plan"
              subtitle="For churches getting organised"
              price="£0"
              priceNote="forever"
              bullets={[
                "Member records",
                "Leaders & groups",
                "Online giving & donations",
                "Secure church workspace",
                "Basic admin access",
              ]}
              ctaHref="/signup"
              ctaText="Get started free"
              secondaryNote="No card required"
            />

            <PlanCard
              badge="Most popular"
              title="Pro plan"
              subtitle="For growing churches that want more"
              price="£19"
              priceNote="per month"
              bullets={[
                "Everything in Free",
                "Finance (income & expenses)",
                "Online giving & donations",
                "Bulk SMS & message templates",
                "Add team members & permissions",
                "Reports & admin settings",
              ]}
              highlight
              ctaHref="/app/upgrade"
              ctaText="Start 30-day free trial"
              secondaryNote="Cancel anytime"
              extraLine="🎁 30-day free trial included"
            />
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <InfoPill title="No long contracts" desc="Pay monthly and cancel anytime." />
            <InfoPill title="Volunteer-friendly" desc="Add users and choose what they can access." />
            <InfoPill title="Private church workspace" desc="Each church is separated and secure." />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-white border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Pricing questions
            </h2>
            <p className="mt-2 text-slate-600">
              Clear answers to the questions church administrators usually ask.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Faq
              q="Do we need to pay to get started?"
              a="No. You can use OviBase for free and upgrade only if you need Pro tools like finance, donations, and messaging."
            />
            <Faq
              q="Is there a contract or long-term commitment?"
              a="No contracts. You can cancel Pro at any time."
            />
            <Faq
              q="Can volunteers use OviBase?"
              a="Yes. You can add staff or volunteers and choose exactly what each person can access."
            />
            <Faq
              q="Is our church data secure?"
              a="Yes. Each church has its own private workspace, and data is not shared between churches."
            />
            <Faq
              q="Can you help us move from spreadsheets or another system?"
              a="Absolutely. We offer hands-on onboarding, training, and help migrating your data."
            />
            <Faq
              q="What happens if we stop paying for Pro?"
              a="Your data remains safe. Pro-only features will be locked, but nothing is deleted."
            />
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">Want help getting set up?</div>
              <div className="text-slate-600 text-sm mt-1">
                We can guide your church through setup, training, and data migration.
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/support"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Support & onboarding
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                Start free
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function PlanCard({
  badge,
  title,
  subtitle,
  price,
  priceNote,
  bullets,
  ctaHref,
  ctaText,
  secondaryNote,
  extraLine,
  highlight,
}: {
  badge: string;
  title: string;
  subtitle: string;
  price: string;
  priceNote: string;
  bullets: string[];
  ctaHref: string;
  ctaText: string;
  secondaryNote?: string;
  extraLine?: string;
  highlight?: boolean;
}) {
  return (
    <div className={["rounded-2xl border bg-white p-6 shadow-sm", highlight ? "border-slate-900" : "border-slate-200"].join(" ")}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className={["inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", highlight ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"].join(" ")}>
            {badge}
          </div>
          <div className="mt-3 text-xl font-semibold">{title}</div>
          <div className="mt-1 text-sm text-slate-600">{subtitle}</div>
          {extraLine ? <div className="mt-3 text-sm text-slate-700">{extraLine}</div> : null}
        </div>

        <div className="text-right">
          <div className="text-3xl font-semibold">{price}</div>
          <div className="text-xs text-slate-500">{priceNote}</div>
        </div>
      </div>

      <ul className="mt-6 space-y-2 text-sm text-slate-700">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="mt-0.5 h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center justify-center text-xs">
              ✓
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-2">
        <Link
          href={ctaHref}
          className={[
            "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
            highlight
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
          ].join(" ")}
        >
          {ctaText}
        </Link>
        {secondaryNote ? (
          <div className="text-xs text-slate-500 text-center">{secondaryNote}</div>
        ) : null}
      </div>
    </div>
  );
}

function InfoPill({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-slate-600 mt-2">{desc}</div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="font-semibold">{q}</div>
      <div className="text-sm text-slate-600 mt-2">{a}</div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="font-semibold">OviBase</div>
          <div className="text-xs text-slate-500">© {new Date().getFullYear()}</div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link className="text-slate-600 hover:text-slate-900" href="/pricing">Pricing</Link>
          <Link className="text-slate-600 hover:text-slate-900" href="/about">About</Link>
          <Link className="text-slate-600 hover:text-slate-900" href="/support">Support</Link>
          <Link className="text-slate-600 hover:text-slate-900" href="/login">Login</Link>
          <Link className="text-slate-600 hover:text-slate-900" href="/signup">Sign up</Link>
        </div>
      </div>
    </footer>
  );
}
