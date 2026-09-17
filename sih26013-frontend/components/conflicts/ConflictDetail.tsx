"use client";

import { useState } from "react";
import { X, CheckCircle2, GitMerge, StickyNote, History } from "lucide-react";
import type { UnifiedParcel } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GeometryPreview } from "./GeometryPreview";
import {
  CONFLICT_TYPE_LABEL,
  STATUS_LABEL,
  SOURCE_LABEL,
  formatArea,
  formatDateTime,
} from "@/lib/utils";

export function ConflictDetail({
  parcel,
  onClose,
  onUpdateStatus,
}: {
  parcel: UnifiedParcel;
  onClose: () => void;
  onUpdateStatus: (status: "REVIEWED" | "RESOLVED", note: string) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleAction(status: "REVIEWED" | "RESOLVED") {
    setBusy(true);
    try {
      await onUpdateStatus(status, note);
      setNote("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[600] flex justify-end bg-ink/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-lg flex-col overflow-hidden bg-white shadow-lifted"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <p className="font-mono text-[12px] text-ledger-700">{parcel.parcelId}</p>
            <h2 className="mt-0.5 font-serif text-[18px] font-semibold text-ink">
              Conflict review
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-ink-soft hover:text-ink">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="border-b border-line px-5 py-4">
            <div className="flex flex-wrap gap-1.5">
              {parcel.conflictTypes.map((t) => (
                <Badge key={t} tone="rust">
                  {CONFLICT_TYPE_LABEL[t]}
                </Badge>
              ))}
              <Badge tone="neutral">{STATUS_LABEL[parcel.status]}</Badge>
            </div>
            <p className="mt-3 text-[13px] text-ink-soft">
              {parcel.village}, {parcel.tehsil}, {parcel.district}
            </p>
          </div>

          <div className="border-b border-line px-5 py-4">
            <p className="mb-3 text-[12.5px] font-semibold uppercase tracking-wide text-ink-soft">
              Source comparison
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-line text-[11.5px] uppercase tracking-wide text-ink-soft">
                    <th className="py-2 pr-3 font-medium">Field</th>
                    {parcel.sourceRecords.map((r, i) => (
                      <th key={i} className="py-2 pr-3 font-medium">
                        {SOURCE_LABEL[r.sourceSystem]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-line">
                    <td className="py-2 pr-3 text-ink-soft">Source ID</td>
                    {parcel.sourceRecords.map((r, i) => (
                      <td key={i} className="py-2 pr-3 font-mono text-[12px] text-ink">
                        {r.sourceParcelId}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-2 pr-3 text-ink-soft">Owner</td>
                    {parcel.sourceRecords.map((r, i) => (
                      <td key={i} className="py-2 pr-3 text-ink">
                        {r.ownerName}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 text-ink-soft">Area</td>
                    {parcel.sourceRecords.map((r, i) => (
                      <td key={i} className="py-2 pr-3 text-ink">
                        {formatArea(r.areaSqm)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-b border-line px-5 py-4">
            <p className="mb-3 text-[12.5px] font-semibold uppercase tracking-wide text-ink-soft">
              Geometry preview
            </p>
            <GeometryPreview records={parcel.sourceRecords} />
          </div>

          <div className="border-b border-line px-5 py-4">
            <p className="mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-wide text-ink-soft">
              <History className="h-3.5 w-3.5" /> Audit timeline
            </p>
            <ol className="space-y-3 border-l border-line pl-4">
              {parcel.auditLog.map((entry, i) => (
                <li key={i} className="relative text-[12.5px]">
                  <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-ledger-500" />
                  <p className="font-medium text-ink">{entry.detail}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-ink-soft">
                    {formatDateTime(entry.timestamp)} · {entry.actor}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="px-5 py-4">
            <label className="mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-wide text-ink-soft">
              <StickyNote className="h-3.5 w-3.5" /> Add a note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="e.g. Field-verified boundary with the tehsildar's office on 5 Sep."
              className="w-full rounded border border-line px-3 py-2 text-[13px] text-ink outline-none placeholder:text-ink-soft"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-line px-5 py-4">
          <Button variant="outline" size="sm" disabled={busy} onClick={() => handleAction("REVIEWED")}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Mark as reviewed
          </Button>
          <Button variant="secondary" size="sm" disabled={busy} onClick={() => handleAction("RESOLVED")}>
            <GitMerge className="h-3.5 w-3.5" /> Propose merge & resolve
          </Button>
        </div>
      </div>
    </div>
  );
}
