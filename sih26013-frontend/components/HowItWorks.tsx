import { Database, Shuffle, GitMerge, FlagTriangleRight } from "lucide-react";

const STEPS = [
  {
    icon: Database,
    title: "Ingest multi-source data",
    body: "CSV, Excel, Shapefile, GeoJSON and WFS feeds from revenue, survey, municipal and registration systems land in one pipeline.",
  },
  {
    icon: Shuffle,
    title: "Detect schema, map to a common model",
    body: "Field names, units and coordinate systems vary by agency. Mapping rules translate each into one shared land-parcel schema.",
  },
  {
    icon: GitMerge,
    title: "Conflate by ID and geometry",
    body: "Parcels are matched across sources using ID similarity and a geometry-distance threshold, then merged into one record.",
  },
  {
    icon: FlagTriangleRight,
    title: "Flag conflicts, publish the layer",
    body: "Mismatched owners, areas or boundaries are flagged for review. Everything else becomes the unified, queryable land layer.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
      <h2 className="font-serif text-2xl font-semibold text-ink">How it works</h2>
      <p className="mt-2 max-w-xl text-[14px] text-ink-soft">
        Four stages turn fragmented departmental records into one accountable source of truth.
      </p>

      <ol className="mt-10 grid gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex flex-col gap-3 bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-ledger-100 bg-ledger-50 text-ledger-700">
                <step.icon className="h-4.5 w-4.5" />
              </div>
              <span className="font-mono text-xs text-ink-soft">{`0${i + 1}`}</span>
            </div>
            <h3 className="font-serif text-[15px] font-semibold leading-snug text-ink">
              {step.title}
            </h3>
            <p className="text-[13px] leading-relaxed text-ink-soft">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
