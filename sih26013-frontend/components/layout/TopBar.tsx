"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/map", label: "Land Map" },
  { href: "/conflicts", label: "Conflicts" },
  { href: "/ingestion", label: "Data Ingestion" },
  { href: "/apis", label: "APIs" },
  { href: "/about", label: "About" },
];

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Programme overview and key metrics" },
  "/map": { title: "Unified Land Map", subtitle: "Before and after harmonization" },
  "/conflicts": { title: "Conflicts Dashboard", subtitle: "Flagged records awaiting review" },
  "/ingestion": { title: "Data Sources & Mapping", subtitle: "Ingest and harmonize multi-source records" },
  "/apis": { title: "API Reference", subtitle: "Unified land record service" },
  "/about": { title: "About this project", subtitle: "SIH26013 — MVP prototype" },
};

export function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const meta = (pathname && TITLES[pathname]) || { title: "", subtitle: "" };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-5 py-3 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            className="flex h-8 w-8 items-center justify-center rounded border border-line md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <div className="min-w-0">
            <h1 className="truncate font-serif text-lg font-semibold leading-tight text-ink">
              {meta.title || "Unified Urban Land Records"}
            </h1>
            <p className="truncate text-[13px] text-ink-soft">
              {meta.subtitle || "Automated integration and harmonization of multi-source geospatial data"}
            </p>
          </div>
        </div>

        <div className="hidden flex-shrink-0 items-center gap-2 rounded border border-line bg-white px-3 py-1.5 lg:flex">
          <Landmark className="h-3.5 w-3.5 text-ledger-500" />
          <span className="font-mono text-[11px] text-ink-soft">
            SIH 2026 | Disaster Management | Rural Development
          </span>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-white px-5 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded px-3 py-2 text-sm font-medium",
                pathname === item.href
                  ? "bg-ledger-50 text-ledger-700"
                  : "text-ink-soft hover:bg-paper-dim"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
