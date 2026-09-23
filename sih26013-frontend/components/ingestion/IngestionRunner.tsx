"use client";

import { useEffect, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ingestFile } from "@/lib/api";
import { toast } from "@/lib/toastStore";
import type { Dataset } from "@/lib/types";

export function IngestionRunner({ dataset }: { dataset: Dataset | null }) {
  const [running, setRunning] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ ingested: number; mapped: number; warnings: string[] } | null>(null);

  useEffect(() => {
    setResult(null);
    setFile(null);
  }, [dataset?.id]);

  async function handleRun() {
    if (!dataset || !file) return;
    setRunning(true);
    setResult(null);
    toast("Uploading dataset", file.name);
    try {
      const res = await ingestFile(file, dataset.sourceSystem, dataset.id);
      setResult(res);
      if (res.warnings.length > 0) {
        toast("Ingestion completed with warnings", res.warnings.join(" "), "warning");
      } else {
        toast("Ingestion complete", `${res.mapped} of ${res.ingested} records mapped to the common schema.`, "success");
      }
    } catch (error) {
      toast("Ingestion failed", error instanceof Error ? error.message : "The upload could not be completed.", "error");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="rounded border border-line bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-ink">
            {dataset ? dataset.name : "Select a data source"}
          </p>
          <p className="text-[12px] text-ink-soft">
            {dataset ? `${dataset.sourceSystem} · ${dataset.format}` : "Choose a card above to enable ingestion"}
          </p>
        </div>
        <Button size="sm" disabled={!dataset || !file || running} onClick={handleRun}>
          {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
          Validate & upload
        </Button>
      </div>

      <label className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded border border-dashed border-line px-4 py-6 text-center hover:bg-paper-dim">
        <UploadCloud className="h-5 w-5 text-ledger-600" />
        <span className="text-[13px] font-medium text-ink">Choose a GeoJSON, CSV, XLSX, or ZIP file</span>
        <span className="text-[12px] text-ink-soft">{file ? file.name : "The selected mapping profile will be sent with the upload."}</span>
        <input type="file" accept=".geojson,.json,.csv,.xlsx,.zip" className="sr-only" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </label>

      {running && (
        <div className="mt-4">
          <p className="text-[13px] text-ink-soft">Uploading and validating geometry…</p>
        </div>
      )}

      {result && <div className="mt-3 flex flex-wrap gap-4 text-[13px]">
        <p className="text-ink"><span className="font-semibold">{result.ingested}</span> records ingested</p>
        <p className="text-ink"><span className="font-semibold">{result.mapped}</span> mapped to common schema</p>
        {result.warnings.length > 0 && <p className="text-gold-500">{result.warnings.join(" ")}</p>}
      </div>}
    </div>
  );
}
