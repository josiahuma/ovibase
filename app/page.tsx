import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top nav */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-slate-200 bg-white">
                <Image
                  src="/ob-logo.png"
                  alt="OviBase"
                  fill
                  className="object-contain p-1"
                  priority
                />
              </div>
              <div className="leading-tight">
                <div className="font-bold tracking-tight text-slate-900">OviBase</div>
                <div className="text-xs text-slate-500">Church admin made simple</div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Multi-tenant • Roles & permissions • Bulk SMS
              </div>

              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
                Manage members, attendance, finance & SMS —{" "}
                <span className="text-slate-900">all in one place.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl">
                OviBase helps churches and organizations track members, record attendance,
                manage finance entries, and send bulk SMS reminders — with secure tenant workspaces
                and staff permissions.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Create your workspace
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Login
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 max-w-md">
                <Stat value="1 min" label="Setup time" />
                <Stat value="Secure" label="Tenant isolation" />
                <Stat value="Fast" label="Daily workflow" />
              </div>
            </div>

            {/* Hero card */}
            <div className="relative">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-xs text-slate-500">OviBase Dashboard</div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MiniCard title="Members" value="1,245" />
                    <MiniCard title="Leaders" value="62" />
                    <MiniCard title="Attendance" value="8,930" />
                    <MiniCard title="Finance entries" value="2,114" />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-medium text-slate-900">Bulk SMS</div>
                    <div className="text-sm text-slate-600 mt-1">
                      Send birthday/anniversary reminders in seconds.
                    </div>
                    <div className="mt-3 flex gap-2">
                      <div className="h-9 flex-1 rounded-lg border border-slate-200 bg-white" />
                      <div className="h-9 w-24 rounded-lg bg-slate-900" />
                    </div>
                    <div className="text-xs text-slate-500 mt-3">
                      Works with provider settings you configure.
                    </div>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-slate-100 blur-2xl" />
              <div className="pointer-events-none absolute -left-20 -bottom-24 h-64 w-64 rounded-full bg-slate-100 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Everything you need for church administration
            </h2>
            <p className="text-slate-600 mt-2">
              Simple screens, clear workflows, and role-based access — so your team can help without
              breaking things.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Feature
              title="Members"
              desc="Store member profiles, contacts, birthdays & custom fields."
            />
            <Feature
              title="Leaders"
              desc="Maintain leader records and link them to units & groups."
            />
            <Feature
              title="Attendance"
              desc="Record weekly attendance and events with totals."
            />
            <Feature
              title="Finance"
              desc="Track income & expenses with categories and reporting-ready data."
            />
            <Feature
              title="SMS Templates"
              desc="Create reusable templates for reminders and bulk messaging."
            />
            <Feature
              title="Users & Permissions"
              desc="Add staff accounts and choose what they can access (members, finance, SMS, etc)."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Get started in 3 steps
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Step n="1" title="Create your workspace" desc="Register and get your tenant instantly." />
            <Step n="2" title="Invite staff" desc="Create staff users and tick permissions." />
            <Step n="3" title="Track & send SMS" desc="Record data and send reminders when needed." />
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Create your workspace
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-slate-200 bg-white">
              <Image src="/ob-logo.png" alt="OviBase" fill className="object-contain p-1" />
            </div>
            <div>
              <div className="font-semibold">OviBase</div>
              <div className="text-xs text-slate-500">© {new Date().getFullYear()}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link className="text-slate-600 hover:text-slate-900" href="/login">
              Login
            </Link>
            <Link className="text-slate-600 hover:text-slate-900" href="/signup">
              Register
            </Link>
            <Link className="text-slate-600 hover:text-slate-900" href="/app">
              Go to App
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function MiniCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-xl font-semibold mt-2">{value}</div>
      <div className="text-xs text-slate-500 mt-2">View</div>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="font-semibold text-slate-900">{title}</div>
      <div className="text-sm text-slate-600 mt-2">{desc}</div>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white text-sm font-semibold">
        {n}
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      <div className="text-sm text-slate-600 mt-2">{desc}</div>
    </div>
  );
}
