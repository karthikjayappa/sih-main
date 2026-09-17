import {
  Layers3,
  Wand2,
  GitMerge,
  ShieldAlert,
  Globe2,
  Github,
  Linkedin,
} from "lucide-react";

const PROBLEM_POINTS = [
  "Revenue, survey, municipal and registration departments each maintain their own parcel records, in different formats and coordinate systems.",
  "The same physical plot often carries duplicate or contradictory IDs, owners and boundaries across agencies.",
  "Officials cannot easily verify ownership or extent, slowing land-related decisions and tax assessment.",
  "During a disaster, responders lack a single trustworthy map of who holds what, delaying relief and rebuilding.",
];

const CAPABILITIES = [
  { icon: Layers3, title: "Multi-format ingestion", body: "CSV, Excel, Shapefile, GeoJSON and WFS feeds from any agency." },
  { icon: Wand2, title: "Automatic schema mapping", body: "Detects field and unit differences and maps them to one common land data model." },
  { icon: GitMerge, title: "Rule-based spatial conflation", body: "Matches parcels using ID similarity and a configurable geometry-distance threshold." },
  { icon: ShieldAlert, title: "Conflict detection & review", body: "Flags owner, area and boundary mismatches for a human reviewer, with a full audit trail." },
  { icon: Globe2, title: "Unified queryable layer", body: "One parcel layer exposed through REST APIs and an interactive web map." },
];

const TEAM = [
  { name: "Team name", role: "Team Lead", placeholder: true },
  { name: "Member two", role: "Frontend", placeholder: true },
  { name: "Member three", role: "Backend", placeholder: true },
  { name: "Member four", role: "GIS / Data", placeholder: true },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-14 px-5 py-8 md:px-8 md:py-10">
      <section>
        <h2 className="font-serif text-xl font-semibold text-ink">The problem, in short</h2>
        <ul className="mt-4 space-y-3">
          {PROBLEM_POINTS.map((p, i) => (
            <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-ink-soft">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ledger-500" />
              {p}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold text-ink">Key capabilities</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {CAPABILITIES.map((c) => (
            <div key={c.title} className="flex gap-3 rounded border border-line bg-white p-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm border border-ledger-100 bg-ledger-50 text-ledger-700">
                <c.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-serif text-[14.5px] font-semibold text-ink">{c.title}</p>
                <p className="mt-0.5 text-[13px] text-ink-soft">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded border border-ledger-100 bg-ledger-50 px-5 py-4">
        <p className="text-[13.5px] text-ledger-700">
          Built as a 36-hour MVP for Smart India Hackathon 2026 — problem SIH26013, Disaster
          Management theme, Ministry of Rural Development. Data shown throughout this
          prototype is synthetic and generated for demonstration only.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold text-ink">Team</h2>
        <p className="mt-1 text-[13px] text-ink-soft">
          Replace these placeholders with your team name, college and members before submission.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((m, i) => (
            <div key={i} className="rounded border border-dashed border-line bg-white p-4 text-center">
              <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-paper-dim" />
              <p className="font-serif text-[14px] font-semibold text-ink">{m.name}</p>
              <p className="text-[12px] text-ink-soft">{m.role}</p>
              <div className="mt-2 flex justify-center gap-2 text-ink-soft">
                <Github className="h-3.5 w-3.5" />
                <Linkedin className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[11.5px] text-ink-soft">College: [Your College Name]</p>
      </section>
    </div>
  );
}
