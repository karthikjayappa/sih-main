"use client";

import { X, ShieldAlert, ShieldCheck, History } from "lucide-react";
import type { UnifiedParcel } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import {
  CONFLICT_TYPE_LABEL,
  STATUS_LABEL,
  SOURCE_LABEL,
  formatArea,
  formatDateTime,
} from "@/lib/utils";

export function ParcelPanel({
  parcel,
  onClose,
}: {
  parcel: UnifiedParcel;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-y-0 right-0 z-[500] flex w-full max-w-sm flex-col border-l border-line bg-white shadow-lifted">
      <div className="flex items-start justify-between border-b border-line px-5 py-4">
        <div>
          <p className="font-mono text-[12px] text-ledger-700">{parcel.parcelId}</p>
          <h3 className="mt-0.5 font-serif text-[17px] font-semibold text-ink">{parcel.ownerName}</h3>
        </div>
        <button onClick={onClose} aria-label="Close parcel details" className="text-ink-soft hover:text-ink">
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="border-b border-line px-5 py-4">
          <div className="flex flex-wrap gap-1.5">
            {parcel.conflictFlag ? (
              <Badge tone="rust">
                <ShieldAlert className="h-3 w-3" /> Conflict flagged
              </Badge>
            ) : (
              <Badge tone="moss">
                <ShieldCheck className="h-3 w-3" /> No conflict
              </Badge>
            )}
            <Badge tone="neutral">{STATUS_LABEL[parcel.status]}</Badge>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-y-3 text-[13px]">
            <dt className="text-ink-soft">Area</dt>
            <dd className="text-right font-medium text-ink">{formatArea(parcel.areaSqm)}</dd>
            <dt className="text-ink-soft">Village</dt>
            <dd className="text-right font-medium text-ink">{parcel.village}</dd>
            <dt className="text-ink-soft">Tehsil</dt>
            <dd className="text-right font-medium text-ink">{parcel.tehsil}</dd>
            <dt className="text-ink-soft">District</dt>
            <dd className="text-right font-medium text-ink">{parcel.district}</dd>
            <dt className="text-ink-soft">Sources merged</dt>
            <dd className="text-right font-medium text-ink">
              {parcel.sources.map((s) => SOURCE_LABEL[s]).join(" + ")}
            </dd>
          </dl>
        </div>

        {parcel.conflictFlag && (
          <div className="border-b border-line bg-rust-50/50 px-5 py-4">
            <p className="text-[12.5px] font-semibold uppercase tracking-wide text-rust-700">
              Conflict details
            </p>
            <ul className="mt-2 space-y-2">
              {parcel.conflictTypes.map((t) => (
                <li key={t} className="text-[13px] text-ink">
                  <span className="font-medium">{CONFLICT_TYPE_LABEL[t]}:</span>{" "}
                  {t === "OWNER_MISMATCH" &&
                    describeOwnerMismatch(parcel)}
                  {t === "AREA_MISMATCH" && describeAreaMismatch(parcel)}
                  {t === "GEOMETRY_OVERLAP" &&
                    "Source boundaries for this parcel do not align within the 5 m matching threshold."}
                  {t === "DUPLICATE_ID" &&
                    "This parcel's ID collides with another record from a different source."}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="px-5 py-4">
          <p className="flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-wide text-ink-soft">
            <History className="h-3.5 w-3.5" /> Audit log
          </p>
          <p className="mt-2 text-[12.5px] text-ink-soft">
            Merged from {parcel.sources.length} source{parcel.sources.length > 1 ? "s" : ""} on{" "}
            {formatDateTime(parcel.createdAt)}.
          </p>
          <ol className="mt-3 space-y-3 border-l border-line pl-4">
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
      </div>
    </div>
  );
}

function describeOwnerMismatch(parcel: UnifiedParcel) {
  const owners = Array.from(new Set(parcel.sourceRecords.map((r) => `${SOURCE_LABEL[r.sourceSystem]} says ${r.ownerName}`)));
  return owners.join("; ") + ".";
}

function describeAreaMismatch(parcel: UnifiedParcel) {
  const areas = parcel.sourceRecords.map((r) => `${SOURCE_LABEL[r.sourceSystem]}: ${formatArea(r.areaSqm)}`);
  return areas.join(", ") + ".";
}
