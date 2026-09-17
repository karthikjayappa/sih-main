"use client";

import { useToastStore } from "@/lib/toastStore";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  default: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const BORDER: Record<string, string> = {
  default: "border-ledger-300",
  success: "border-moss-100",
  warning: "border-gold-500/40",
  error: "border-rust-100",
};

const ICON_COLOR: Record<string, string> = {
  default: "text-ledger-500",
  success: "text-moss-500",
  warning: "text-gold-500",
  error: "text-rust-500",
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-[340px] flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICONS[t.variant];
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded border bg-white px-4 py-3 shadow-lifted",
              BORDER[t.variant]
            )}
            role="status"
          >
            <Icon className={cn("mt-0.5 h-4 w-4 flex-shrink-0", ICON_COLOR[t.variant])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-[13px] text-ink-soft">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="text-ink-soft hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
