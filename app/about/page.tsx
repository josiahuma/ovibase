import Link from "next/link";
import PublicHeader from "@/src/components/PublicHeader";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicHeader />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Built to help churches stay organised
            </h1>
            <p className="mt-3 text-slate-600 text-base sm:text-lg">
              OviBase helps church administrators keep records tidy, reduce paperwork,
              and stay on top of members, attendance, finance, and communication —
              without the stress.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                Create a workspace
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Get onboarding support
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
          <div className="grid gap-8 lg:grid-cols-3">
            <Card
              title="Why we built OviBase"
              desc="Because church administration is often done with spreadsheets, notebooks, and scattered messages. We wanted one simple place to manage everything."
            />
            <Card
              title="What we believe"
              desc="Church tools should be simple, clear, and easy for staff and volunteers to use — even if they’re not “techy”."
            />
            <Card
              title="Who it’s for"
              desc="Churches, charities, and organisations that want better records, smoother routines, and reliable reporting."
            />
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <div className="text-lg font-semibold">Our mission</div>
            <p className="mt-2 text-slate-600">
              To help churches spend less time on admin and more time on ministry —
              by making record keeping simpler, faster, and more reliable.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Value
              title="Simplicity over complexity"
              desc="Clear screens and workflows that make sense for church admin."
            />
            <Value
              title="Support over “figure it out”"
              desc="We provide onboarding, training, and help migrating your data — so you’re not alone."
            />
            <Value
              title="People-first permissions"
              desc="Invite staff and volunteers and choose what each person can access."
            />
            <Value
              title="Secure workspaces"
              desc="Each church has its own workspace, separated and protected."
            />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Contact us
          </h2>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Need help, want onboarding, or have questions before signing up?
            We’re happy to support you.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <ContactCard
              title="Support email"
              desc="Email us and we’ll respond as quickly as possible."
              value="support@ovibase.com"
            />
            <ContactCard
              title="Onboarding & training"
              desc="We offer hands-on onboarding, tutorials, and guided setup."
              value="Request onboarding"
              href="/support"
            />
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/support"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Support & onboarding
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-2 text-sm text-slate-600">{desc}</div>
    </div>
  );
}

function Value({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="font-semibold">{title}</div>
      <div className="mt-2 text-sm text-slate-600">{desc}</div>
    </div>
  );
}

function ContactCard({
  title,
  desc,
  value,
  href,
}: {
  title: string;
  desc: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="font-semibold">{title}</div>
      <div className="mt-2 text-sm text-slate-600">{desc}</div>
      <div className="mt-4 inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">
        {value}
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
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
