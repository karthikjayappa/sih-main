import type { MappingProfile } from "@/lib/types";
import { ArrowRight } from "lucide-react";

export function MappingTable({ profile }: { profile: MappingProfile | null }) {
  if (!profile) {
    return <p className="text-[13px] text-ink-soft">Select a data source to view its field mapping.</p>;
  }

  return (
    <div className="overflow-x-auto rounded border border-line bg-white">
      <table className="w-full min-w-[520px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-line bg-paper-dim/60 text-[11.5px] uppercase tracking-wide text-ink-soft">
            <th className="px-4 py-2.5 font-medium">Source field</th>
            <th className="px-4 py-2.5 font-medium" />
            <th className="px-4 py-2.5 font-medium">Target field</th>
            <th className="px-4 py-2.5 font-medium">Transformation</th>
          </tr>
        </thead>
        <tbody>
          {profile.rules.map((rule, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              <td className="px-4 py-2.5 font-mono text-[12.5px] text-ink">{rule.sourceField}</td>
              <td className="px-2 py-2.5 text-ink-soft">
                <ArrowRight className="h-3.5 w-3.5" />
              </td>
              <td className="px-4 py-2.5 font-mono text-[12.5px] text-ledger-700">{rule.targetField}</td>
              <td className="px-4 py-2.5 text-ink-soft">{rule.transform}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
