import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-ledger-500 text-white hover:bg-ledger-700 border border-ledger-500",
  secondary: "bg-moss-500 text-white hover:bg-moss-700 border border-moss-500",
  outline: "bg-transparent text-ink border border-line hover:bg-paper-dim",
  ghost: "bg-transparent text-ink-soft hover:bg-paper-dim border border-transparent",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "text-[13px] px-2.5 py-1.5",
  md: "text-sm px-4 py-2",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(({ className, variant = "primary", size = "md", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";
