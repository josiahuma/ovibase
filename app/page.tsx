//ovibase/app/page.tsx
import Image from "next/image";
import Link from "next/link";
import PublicHeader from "@/src/components/PublicHeader";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top nav */}
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Members • Attendance • Finance • Messaging • Donations
              </div>

              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
                Keep your church records organised —{" "}
                <span className="text-slate-900">without the stress.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl">
                OviBase helps you manage member details, attendance, income & expenses,
                giving/donations, and communication — in one simple system your staff and
                volunteers can actually use.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Set up your church
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  I already have an account
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 max-w-md">
                <Stat value="Minutes" label="to get started" />
                <Stat value="Clear" label="records every week" />
                <Stat value="Confident" label="team access" />
              </div>

              <div className="text-xs text-slate-500">
                Built for churches, charities and organisations that want less admin and fewer spreadsheets.
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
                    <MiniCard title="Church members" value="1,245" />
                    <MiniCard title="Leaders & teams" value="62" />
                    <MiniCard title="Attendance records" value="8,930" />
                    <MiniCard title="Income & expenses" value="2,114" />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-medium text-slate-900">
                      Messages & reminders
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Send service reminders, meeting updates and announcements in seconds.
                    </div>
                    <div className="mt-3 flex gap-2">
                      <div className="h-9 flex-1 rounded-lg border border-slate-200 bg-white" />
                      <div className="h-9 w-24 rounded-lg bg-slate-900" />
                    </div>
                    <div className="text-xs text-slate-500 mt-3">
                      Great for admins and volunteers — no complicated setup screens.
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

      {/* Why OviBase */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Why churches choose OviBase
            </h2>
            <p className="text-slate-600 mt-2">
              Most church admin tools become “too much” over time. OviBase is built to stay simple —
              while still giving you everything you need.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <WhyCard
              title="One place for your records"
              desc="Stop chasing spreadsheets, notebooks and WhatsApp messages. Keep members, attendance, finance and giving together."
            />
            <WhyCard
              title="Made for staff and volunteers"
              desc="Clear screens and simple steps — so anyone helping in the office can use it confidently."
            />
            <WhyCard
              title="You control access"
              desc="Give helpers access only to what they need. Keep sensitive areas restricted to the right people."
            />
            <WhyCard
              title="Week-by-week clarity"
              desc="Record attendance and view totals easily. See progress over time without extra work."
            />
            <WhyCard
              title="Better communication"
              desc="Send reminders and announcements quickly — using templates so you don’t type the same message repeatedly."
            />
            <WhyCard
              title="Built to grow with you"
              desc="Start small, then unlock more modules when you’re ready — without changing your process."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Everything your church office needs
            </h2>
            <p className="text-slate-600 mt-2">
              Clear workflows that reduce mistakes, save time, and keep your records up to date.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Feature
              title="Member records"
              desc="Store contact details, birthdays, notes and custom fields — and find them instantly."
            />
            <Feature
              title="Leaders & groups"
              desc="Keep track of leaders, teams and units so you know who is responsible for what."
            />
            <Feature
              title="Attendance tracking"
              desc="Record weekly service attendance and event totals without paperwork."
            />
            <Feature
              title="Income & expenses"
              desc="Keep a clear record of what comes in and what goes out — ready for reporting."
            />
            <Feature
              title="Giving & donations"
              desc="Accept and track online giving securely, including recurring donations when needed."
            />
            <Feature
              title="Team access"
              desc="Add staff accounts and control what each person can view or manage."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Get started in 3 simple steps
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Step
              n="1"
              title="Create your church workspace"
              desc="Set up your church in minutes and get your own private login link."
            />
            <Step
              n="2"
              title="Add your team"
              desc="Invite staff or volunteers and give them the right access."
            />
            <Step
              n="3"
              title="Start recording & communicating"
              desc="Track members, attendance and finances — and send reminders when needed."
            />
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Set up your church
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-6 text-xs text-slate-500">
            Tip: Start with the basics (members), then unlock Pro features when you’re ready.
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
              <div className="text-xs text-slate-500">
                Helping churches stay organised • © {new Date().getFullYear()}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link className="text-slate-600 hover:text-slate-900" href="/login">
              Sign in
            </Link>
            <Link className="text-slate-600 hover:text-slate-900" href="/signup">
              Set up your church
            </Link>
            <Link className="text-slate-600 hover:text-slate-900" href="/app">
              Go to dashboard
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
      <div className="text-xs text-slate-500 mt-2">Open</div>
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

function WhyCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="font-semibold text-slate-900">{title}</div>
      <div className="text-sm text-slate-600 mt-2">{desc}</div>
    </div>
  );
}
