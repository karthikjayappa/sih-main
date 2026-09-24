import Link from "next/link";
import { ArrowRight, Landmark } from "lucide-react";

export function OverviewHero() {
  return (
    <section className="border-b border-line bg-white">
      <div className="grid-backdrop">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
          <div className="flex items-center gap-2 text-ledger-700">
            <Landmark className="h-4 w-4" />
            <span className="font-mono text-[12px] tracking-wide">
              SIH 2026 | Problem SIH26013 | Ministry of Rural Development
            </span>
          </div>

          <h1 className="mt-6 max-w-3xl font-serif text-4xl font-semibold leading-[1.15] text-ink md:text-5xl">
            One land parcel, four record-keepers, four different answers.
          </h1>

          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-soft md:text-base">
            Revenue, survey, municipal and registration departments each hold their own
            version of the same plot — different IDs, owners, boundaries and units. When a
            flood or earthquake hits, responders need one trustworthy map, not four
            conflicting ones. This prototype ingests all four, reconciles them automatically,
            and surfaces what still needs a human&rsquo;s judgement.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/department/login"
              className="inline-flex items-center gap-2 rounded bg-ledger-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ledger-700"
            >
              Department Login
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/citizen/login"
              className="inline-flex items-center gap-2 rounded border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-paper-dim"
            >
              Property Owner
            </Link>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-line pt-8 sm:grid-cols-4">
            {[
              ["4", "source systems"],
              ["170", "raw source records (demo)"],
              ["62", "unified parcels"],
              ["33", "conflicts auto-flagged"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-serif text-2xl font-semibold text-ink">{value}</dt>
                <dd className="mt-1 text-[13px] text-ink-soft">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
