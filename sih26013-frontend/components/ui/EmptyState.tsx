import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-line px-6 py-14 text-center">
      <Icon className="h-6 w-6 text-ink-soft" />
      <p className="font-serif text-[15px] font-semibold text-ink">{title}</p>
      <p className="max-w-sm text-[13px] text-ink-soft">{description}</p>
    </div>
  );
}
