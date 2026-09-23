"use client";

import type { ConflictFilterParams } from "@/lib/api";
import { CONFLICT_TYPE_LABEL, STATUS_LABEL } from "@/lib/utils";

const STATUSES = ["ALL", "PENDING_REVIEW", "REVIEWED", "RESOLVED"] as const;
const TYPES = ["ALL", "OWNER_MISMATCH", "AREA_MISMATCH", "GEOMETRY_OVERLAP", "DUPLICATE_ID"] as const;

export function ConflictFilters({
  filters,
  onChange,
  villages,
  tehsils,
}: {
  filters: ConflictFilterParams;
  onChange: (f: ConflictFilterParams) => void;
  villages: string[];
  tehsils: string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded border border-line bg-white p-3.5">
      <Select
        label="Status"
        value={filters.status || "ALL"}
        onChange={(v) => onChange({ ...filters, status: v as ConflictFilterParams["status"] })}
        options={STATUSES.map((s) => [s, s === "ALL" ? "All statuses" : STATUS_LABEL[s]])}
      />
      <Select
        label="Conflict type"
        value={filters.conflictType || "ALL"}
        onChange={(v) => onChange({ ...filters, conflictType: v as ConflictFilterParams["conflictType"] })}
        options={TYPES.map((t) => [t, t === "ALL" ? "All types" : CONFLICT_TYPE_LABEL[t]])}
      />
      <Select
        label="Village"
        value={filters.village || "ALL"}
        onChange={(v) => onChange({ ...filters, village: v === "ALL" ? undefined : v })}
        options={[["ALL", "All villages"], ...villages.map((v) => [v, v] as [string, string])]}
      />
      <Select
        label="Tehsil"
        value={filters.tehsil || "ALL"}
        onChange={(v) => onChange({ ...filters, tehsil: v === "ALL" ? undefined : v })}
        options={[["ALL", "All tehsils"], ...tehsils.map((t) => [t, t] as [string, string])]}
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="flex flex-col gap-1 text-[12px] text-ink-soft">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-line bg-white px-2.5 py-1.5 text-[13px] text-ink"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
