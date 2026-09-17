import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "ledger",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "ledger" | "moss" | "rust" | "gold";
}) {
  const toneClasses: Record<string, string> = {
    ledger: "text-ledger-700 bg-ledger-50 border-ledger-100",
    moss: "text-moss-700 bg-moss-50 border-moss-100",
    rust: "text-rust-700 bg-rust-50 border-rust-100",
    gold: "text-gold-500 bg-gold-50 border-gold-500/20",
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] text-ink-soft">{label}</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-ink">{value}</p>
        </div>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-sm border", toneClasses[tone])}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
    </Card>
  );
}
