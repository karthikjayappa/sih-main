import { SOURCE_COLOR, SOURCE_LABEL } from "@/lib/utils";

export function Legend({ mode }: { mode: "before" | "after" }) {
  return (
    <div className="rounded border border-line bg-white/95 px-3.5 py-3 shadow-lifted">
      <p className="mb-2 font-mono text-[10.5px] uppercase tracking-wide text-ink-soft">Legend</p>
      {mode === "before" ? (
        <ul className="space-y-1.5">
          {(["REVENUE", "SURVEY", "MUNICIPAL"] as const).map((s) => (
            <li key={s} className="flex items-center gap-2 text-[12.5px] text-ink">
              <span className="h-3 w-3 flex-shrink-0 rounded-sm border" style={{ background: SOURCE_COLOR[s] + "55", borderColor: SOURCE_COLOR[s] }} />
              {SOURCE_LABEL[s]} parcels
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-1.5">
          <li className="flex items-center gap-2 text-[12.5px] text-ink">
            <span className="h-3 w-3 flex-shrink-0 rounded-sm border border-rust-500" style={{ background: "#B5502D55" }} />
            Conflict flagged
          </li>
          <li className="flex items-center gap-2 text-[12.5px] text-ink">
            <span className="h-3 w-3 flex-shrink-0 rounded-sm border border-moss-500" style={{ background: "#3C6E5255" }} />
            No conflict
          </li>
        </ul>
      )}
    </div>
  );
}
