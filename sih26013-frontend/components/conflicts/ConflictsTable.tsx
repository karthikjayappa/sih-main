"use client";

import type { UnifiedParcel } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { CONFLICT_TYPE_LABEL, STATUS_LABEL, SOURCE_LABEL, formatDateTime } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShieldOff } from "lucide-react";

const STATUS_TONE: Record<string, "gold" | "ledger" | "moss"> = {
  PENDING_REVIEW: "gold",
  REVIEWED: "ledger",
  RESOLVED: "moss",
};

export function ConflictsTable({
  conflicts,
  onSelect,
}: {
  conflicts: UnifiedParcel[];
  onSelect: (parcel: UnifiedParcel) => void;
}) {
  if (conflicts.length === 0) {
    return (
      <EmptyState
        icon={ShieldOff}
        title="No conflicts match these filters"
        description="Try widening the status, type, or location filters above."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-line bg-white">
      <table className="w-full min-w-[760px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-line bg-paper-dim/60 text-[11.5px] uppercase tracking-wide text-ink-soft">
            <th className="px-4 py-2.5 font-medium">Parcel ID</th>
            <th className="px-4 py-2.5 font-medium">Location</th>
            <th className="px-4 py-2.5 font-medium">Conflict type</th>
            <th className="px-4 py-2.5 font-medium">Sources</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Last updated</th>
          </tr>
        </thead>
        <tbody>
          {conflicts.map((c) => (
            <tr
              key={c.unifiedParcelId}
              onClick={() => onSelect(c)}
              className="cursor-pointer border-b border-line last:border-0 hover:bg-paper-dim/50"
            >
              <td className="px-4 py-3 font-mono text-[12.5px] text-ledger-700">{c.parcelId}</td>
              <td className="px-4 py-3 text-ink-soft">
                {c.village}, {c.tehsil}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {c.conflictTypes.map((t) => (
                    <Badge key={t} tone="rust">
                      {CONFLICT_TYPE_LABEL[t]}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-ink-soft">{c.sources.map((s) => SOURCE_LABEL[s]).join(", ")}</td>
              <td className="px-4 py-3">
                <Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Badge>
              </td>
              <td className="px-4 py-3 font-mono text-[11.5px] text-ink-soft">{formatDateTime(c.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
