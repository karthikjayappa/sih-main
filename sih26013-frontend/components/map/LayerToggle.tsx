import { cn } from "@/lib/utils";

export function LayerToggle({
  mode,
  onChange,
}: {
  mode: "before" | "after";
  onChange: (mode: "before" | "after") => void;
}) {
  return (
    <div className="inline-flex rounded border border-line bg-white p-0.5 shadow-lifted">
      {(["before", "after"] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={cn(
            "rounded-sm px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
            mode === m ? "bg-ledger-500 text-white" : "text-ink-soft hover:text-ink"
          )}
        >
          {m === "before" ? "Before harmonization" : "After harmonization"}
        </button>
      ))}
    </div>
  );
}
