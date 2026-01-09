import Link from "next/link";
import PublicHeader from "@/src/components/PublicHeader";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicHeader />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Support & onboarding
            </h1>
            <p className="mt-3 text-slate-600 text-base sm:text-lg">
              We don’t just give you software — we help your church get set up,
              trained, and confident using OviBase.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                Create a workspace
              </Link>
              <a
                href="mailto:support@ovibase.com"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Email support@ovibase.com
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
          <div className="grid gap-6 lg:grid-cols-3">
            <SupportCard
              title="Hands-on onboarding"
              desc="We help you set up your workspace properly, so your records are organised from day one."
              bullets={[
                "Initial setup guidance",
                "Best-practice structure for church records",
                "Help inviting staff and setting permissions",
              ]}
            />
            <SupportCard
              title="Training & tutorials"
              desc="We provide simple walkthroughs designed for church administrators (no technical knowledge needed)."
              bullets={[
                "Step-by-step guidance",
                "Tutorial videos (where needed)",
                "Answers to “how do we…” questions",
              ]}
            />
            <SupportCard
              title="Data migration help"
              desc="If your records are currently in spreadsheets or another system, we can help move them safely."
              bullets={[
                "Import planning",
                "Spreadsheet clean-up guidance",
                "Assisted migration (by request)",
              ]}
            />
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-semibold">How onboarding works</h2>
            <p className="mt-2 text-slate-600 text-sm">
              A simple approach that works for most churches.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Step
                n="1"
                title="Create your workspace"
                desc="Sign up and you’ll get your church workspace instantly."
              />
              <Step
                n="2"
                title="Bring your records"
                desc="We’ll guide you on how to organise members, leaders, attendance, and finance."
              />
              <Step
                n="3"
                title="Train your team"
                desc="Invite staff/volunteers and set permissions so everyone can help confidently."
              />
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">Need help getting started?</div>
              <div className="text-sm text-slate-600 mt-1">
                Email us and we’ll guide you through setup and next steps.
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:support@ovibase.com"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Email us
              </a>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function SupportCard({
  title,
  desc,
  bullets,
}: {
  title: string;
  desc: string;
  bullets: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-2 text-sm text-slate-600">{desc}</div>

      <ul className="mt-5 space-y-2 text-sm text-slate-700">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="mt-0.5 h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center justify-center text-xs">
              ✓
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white text-sm font-semibold">
        {n}
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      <div className="mt-2 text-sm text-slate-600">{desc}</div>
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
