import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Tone = "neutral" | "ledger" | "moss" | "rust" | "gold";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "border-line text-ink-soft bg-paper-dim",
  ledger: "border-ledger-300 text-ledger-700 bg-ledger-50",
  moss: "border-moss-100 text-moss-700 bg-moss-50",
  rust: "border-rust-100 text-rust-700 bg-rust-50",
  gold: "border-gold-500/30 text-gold-500 bg-gold-50",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide",
        TONE_CLASSES[tone],
        className
      )}
      {...props}
    />
  );
}
