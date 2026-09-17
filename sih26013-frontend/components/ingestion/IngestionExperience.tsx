"use client";

import { useEffect, useState } from "react";
import type { Dataset, MappingProfile } from "@/lib/types";
import { getMappingProfile } from "@/lib/mockApi";
import { DatasetCard } from "./DatasetCard";
import { MappingTable } from "./MappingTable";
import { IngestionRunner } from "./IngestionRunner";
import { SOURCE_LABEL } from "@/lib/utils";

export function IngestionExperience({ datasets }: { datasets: Dataset[] }) {
  const [selectedId, setSelectedId] = useState(datasets[0]?.id ?? null);
  const [profile, setProfile] = useState<MappingProfile | null>(null);

  const selected = datasets.find((d) => d.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) return;
    getMappingProfile(selectedId).then(setProfile);
  }, [selectedId]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 md:px-8 md:py-8">
      <section>
        <h2 className="mb-1 font-serif text-lg font-semibold text-ink">Data sources</h2>
        <p className="mb-4 text-[13px] text-ink-soft">
          Three agencies, three schemas — select a source to inspect its raw fields and mapping.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {datasets.map((d) => (
            <DatasetCard key={d.id} dataset={d} active={d.id === selectedId} onSelect={() => setSelectedId(d.id)} />
          ))}
        </div>
      </section>

      {selected && (
        <section>
          <h3 className="mb-1 font-serif text-[15px] font-semibold text-ink">
            Raw fields — {SOURCE_LABEL[selected.sourceSystem]}
          </h3>
          <div className="flex flex-wrap gap-2 rounded border border-line bg-white p-3.5">
            {selected.sampleFields.map((f) => (
              <span key={f} className="rounded-sm border border-line bg-paper-dim px-2 py-1 font-mono text-[11.5px] text-ink-soft">
                {f}
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-2 font-serif text-[15px] font-semibold text-ink">Mapping rules → common land data model</h3>
        <MappingTable profile={profile} />
      </section>

      <section>
        <h3 className="mb-2 font-serif text-[15px] font-semibold text-ink">Run ingestion</h3>
        <IngestionRunner dataset={selected} />
      </section>
    </div>
  );
}
