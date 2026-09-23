"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type { UnifiedParcel } from "@/lib/types";
import { searchParcels } from "@/lib/api";

export function MapSearch({
  onSelect,
}: {
  onSelect: (parcel: UnifiedParcel) => void;
}) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<UnifiedParcel[]>([]);

  useEffect(() => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      searchParcels({ q })
        .then((results) => active && setSuggestions(results.slice(0, 6)))
        .catch(() => active && setSuggestions([]));
    }, 220);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [q]);

  return (
    <div className="relative w-full max-w-xs">
      <div className="flex items-center gap-2 rounded border border-line bg-white px-3 py-2 shadow-lifted">
        <Search className="h-4 w-4 flex-shrink-0 text-ink-soft" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search parcel ID, owner, village…"
          className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-soft"
        />
      </div>
      {focused && suggestions.length > 0 && (
        <ul className="absolute z-[500] mt-1 w-full overflow-hidden rounded border border-line bg-white shadow-lifted">
          {suggestions.map((p) => (
            <li key={p.unifiedParcelId}>
              <button
                onMouseDown={() => onSelect(p)}
                className="flex w-full flex-col items-start gap-0.5 px-3.5 py-2 text-left hover:bg-paper-dim"
              >
                <span className="font-mono text-[12px] text-ledger-700">{p.parcelId}</span>
                <span className="text-[12.5px] text-ink-soft">
                  {p.ownerName} — {p.village}, {p.tehsil}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
