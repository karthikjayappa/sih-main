"use client";

import type { Dataset } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDateTime } from "@/lib/utils";
import { FileSpreadsheet, FileJson, Map as MapIcon, FileText } from "lucide-react";

const FORMAT_ICON: Record<string, typeof FileText> = {
  CSV: FileSpreadsheet,
  SHAPEFILE: MapIcon,
  GEOJSON: FileJson,
  XLSX: FileSpreadsheet,
};

const STATUS_TONE: Record<string, "moss" | "gold" | "rust" | "neutral"> = {
  SUCCESS: "moss",
  PARTIAL: "gold",
  FAILED: "rust",
  NOT_RUN: "neutral",
};

export function DatasetCard({
  dataset,
  active,
  onSelect,
}: {
  dataset: Dataset;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = FORMAT_ICON[dataset.format] || FileText;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex flex-col items-start gap-2.5 rounded border p-4 text-left transition-colors",
        active ? "border-ledger-500 bg-ledger-50" : "border-line bg-white hover:bg-paper-dim"
      )}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-ledger-100 bg-white text-ledger-700">
          <Icon className="h-4 w-4" />
        </div>
        <Badge tone={STATUS_TONE[dataset.status]}>{dataset.status.replace("_", " ")}</Badge>
      </div>
      <p className="font-serif text-[14.5px] font-semibold leading-snug text-ink">{dataset.name}</p>
      <p className="font-mono text-[11px] text-ink-soft">{dataset.format} · {dataset.recordCount} records</p>
      <p className="text-[11.5px] text-ink-soft">
        {dataset.lastIngestedAt ? `Last ingested ${formatDateTime(dataset.lastIngestedAt)}` : "Not yet ingested"}
      </p>
    </button>
  );
}
