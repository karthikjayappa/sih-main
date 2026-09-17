"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { UnifiedParcel, SourceParcel } from "@/lib/types";
import { LayerToggle } from "./LayerToggle";
import { Legend } from "./Legend";
import { MapSearch } from "./MapSearch";
import { ParcelPanel } from "./ParcelPanel";
import { Info } from "lucide-react";

const ParcelMap = dynamic(() => import("./ParcelMap").then((m) => m.ParcelMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-[13px] text-ink-soft">
      Loading map…
    </div>
  ),
});

export function MapExperience({
  unifiedParcels,
  sourceParcels,
}: {
  unifiedParcels: UnifiedParcel[];
  sourceParcels: SourceParcel[];
}) {
  const [mode, setMode] = useState<"before" | "after">("before");
  const [selected, setSelected] = useState<UnifiedParcel | null>(null);
  const [flyTo, setFlyTo] = useState<UnifiedParcel | null>(null);

  function handleSearchSelect(parcel: UnifiedParcel) {
    setMode("after");
    setSelected(parcel);
    setFlyTo(parcel);
  }

  return (
    <div className="relative h-[calc(100vh-89px)] w-full">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex items-start justify-between gap-3 p-4">
        <div className="pointer-events-auto flex flex-col gap-2">
          <LayerToggle mode={mode} onChange={setMode} />
          <Legend mode={mode} />
        </div>
        <div className="pointer-events-auto">
          <MapSearch parcels={unifiedParcels} onSelect={handleSearchSelect} />
        </div>
      </div>

      {mode === "before" && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-[500] max-w-xs rounded border border-line bg-white/95 px-3.5 py-2.5 text-[12px] text-ink-soft shadow-lifted">
          <Info className="mb-1 h-3.5 w-3.5 text-ledger-500" />
          Fragmented records: overlapping parcels from three agencies, each with its own ID,
          owner, and boundary.
        </div>
      )}
      {mode === "after" && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-[500] max-w-xs rounded border border-line bg-white/95 px-3.5 py-2.5 text-[12px] text-ink-soft shadow-lifted">
          <Info className="mb-1 h-3.5 w-3.5 text-moss-500" />
          One unified record per parcel. Red boundaries still need manual review.
        </div>
      )}

      <ParcelMap
        mode={mode}
        unifiedParcels={unifiedParcels}
        sourceParcels={sourceParcels}
        flyToParcel={flyTo}
        onSelectUnified={setSelected}
      />

      {selected && <ParcelPanel parcel={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
