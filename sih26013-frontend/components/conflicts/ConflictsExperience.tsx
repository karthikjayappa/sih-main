"use client";

import { useEffect, useMemo, useState } from "react";
import type { UnifiedParcel } from "@/lib/types";
import { getConflicts, updateConflictStatus, type ConflictFilterParams } from "@/lib/mockApi";
import { ConflictFilters } from "./ConflictFilters";
import { ConflictsTable } from "./ConflictsTable";
import { ConflictDetail } from "./ConflictDetail";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "@/lib/toastStore";

export function ConflictsExperience({ allVillages, allTehsils }: { allVillages: string[]; allTehsils: string[] }) {
  const [filters, setFilters] = useState<ConflictFilterParams>({ status: "ALL", conflictType: "ALL" });
  const [conflicts, setConflicts] = useState<UnifiedParcel[] | null>(null);
  const [selected, setSelected] = useState<UnifiedParcel | null>(null);

  useEffect(() => {
    let active = true;
    setConflicts(null);
    getConflicts(filters).then((data) => {
      if (active) setConflicts(data);
    });
    return () => {
      active = false;
    };
  }, [filters]);

  async function handleUpdateStatus(status: "REVIEWED" | "RESOLVED", note: string) {
    if (!selected) return;
    const updated = await updateConflictStatus(selected.unifiedParcelId, {
      status,
      notes: note || undefined,
      resolvedBy: "officer.demo",
    });
    if (updated) {
      setSelected(updated);
      setConflicts((prev) => prev?.map((c) => (c.unifiedParcelId === updated.unifiedParcelId ? updated : c)) ?? prev);
      toast(
        status === "RESOLVED" ? "Conflict resolved" : "Conflict marked as reviewed",
        `${updated.parcelId} — ${updated.village}, ${updated.tehsil}`,
        "success"
      );
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-5 py-6 md:px-8 md:py-8">
      <ConflictFilters filters={filters} onChange={setFilters} villages={allVillages} tehsils={allTehsils} />

      {conflicts === null ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <ConflictsTable conflicts={conflicts} onSelect={setSelected} />
      )}

      {selected && (
        <ConflictDetail
          parcel={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
