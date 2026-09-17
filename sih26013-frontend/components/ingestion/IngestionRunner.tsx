"use client";

import { useEffect, useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { runIngestion } from "@/lib/mockApi";
import { toast } from "@/lib/toastStore";
import type { Dataset } from "@/lib/types";

export function IngestionRunner({ dataset }: { dataset: Dataset | null }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ ingested: number; mapped: number; warnings: string[] } | null>(null);

  useEffect(() => {
    setResult(null);
    setProgress(0);
  }, [dataset?.id]);

  async function handleRun() {
    if (!dataset) return;
    setRunning(true);
    setProgress(4);
    setResult(null);
    toast("Running ingestion…", dataset.name);

    const ticker = setInterval(() => {
      setProgress((p) => Math.min(92, p + Math.random() * 18));
    }, 220);

    const res = await runIngestion(dataset.id);
    clearInterval(ticker);
    setProgress(100);
    setResult(res);
    setRunning(false);

    if (res.warnings.length > 0) {
      toast("Ingestion completed with warnings", res.warnings.join(" "), "warning");
    } else {
      toast("Ingestion complete", `${res.mapped} of ${res.ingested} records mapped to the common schema.`, "success");
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
            {dataset ? `${dataset.recordCount} records · ${dataset.format}` : "Choose a card above to enable ingestion"}
          </p>
        </div>
        <Button size="sm" disabled={!dataset || running} onClick={handleRun}>
          {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          Run ingestion
        </Button>
      </div>

      {(running || progress > 0) && (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-paper-dim">
            <div
              className="h-full rounded-full bg-ledger-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          {result && (
            <div className="mt-3 flex flex-wrap gap-4 text-[13px]">
              <p className="text-ink">
                <span className="font-semibold">{result.ingested}</span> records ingested
              </p>
              <p className="text-ink">
                <span className="font-semibold">{result.mapped}</span> mapped to common schema
              </p>
              {result.warnings.length > 0 && (
                <p className="text-gold-500">{result.warnings.join(" ")}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
