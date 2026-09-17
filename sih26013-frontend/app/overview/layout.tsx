import Link from "next/link";
import { Landmark } from "lucide-react";

export default function OverviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-ledger-500 bg-ledger-50 text-ledger-700">
              <Landmark className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <p className="font-serif text-[14px] font-semibold text-ink">Unified Land Records</p>
              <p className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">SIH26013</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="rounded border border-ledger-500 bg-ledger-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ledger-700"
          >
            Enter workspace
          </Link>
        </div>
      </header>
      {children}
      <footer className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8 text-[12.5px] text-ink-soft md:px-10">
          Prototype built for Smart India Hackathon 2026 — Problem SIH26013. Not an official
          government service.
        </div>
      </footer>
    </div>
  );
}
