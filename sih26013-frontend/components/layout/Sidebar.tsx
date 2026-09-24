"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  ShieldAlert,
  UploadCloud,
  ClipboardList,
  Code2,
  Info,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Land Map", icon: Map },
  { href: "/conflicts", label: "Conflicts", icon: ShieldAlert },
  { href: "/ingestion", label: "Data Ingestion", icon: UploadCloud },
  { href: "/correction-requests", label: "Correction Requests", icon: ClipboardList },
  { href: "/apis", label: "APIs", icon: Code2 },
  { href: "/about", label: "About", icon: Info },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 flex-shrink-0 border-r border-line bg-white md:flex md:flex-col">
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm border border-ledger-500 bg-ledger-50 text-ledger-700">
          <Landmark className="h-4 w-4" />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate font-serif text-[14px] font-semibold text-ink">
            Unified Land Records
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">
            SIH26013
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded px-3 py-2 text-[13.5px] font-medium transition-colors",
                active
                  ? "bg-ledger-50 text-ledger-700 border border-ledger-100"
                  : "text-ink-soft border border-transparent hover:bg-paper-dim hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line px-5 py-4">
        <p className="font-mono text-[10.5px] leading-relaxed text-ink-soft">
          Disaster management theme
          <br />
          Ministry of Rural Development
        </p>
      </div>
    </aside>
  );
}
