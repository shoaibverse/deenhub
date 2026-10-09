import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "quiet" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,border-color,color,transform] duration-200 disabled:opacity-55 disabled:cursor-not-allowed active:translate-y-[1px] whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-emerald-ink text-ivory hover:bg-emerald-deep dark:bg-emerald-soft dark:text-ivory dark:hover:bg-emerald",
  secondary:
    "border border-[color:var(--line)] bg-[color:var(--surface-raised)] text-[color:var(--fg)] hover:border-emerald/50 hover:bg-sand/60 dark:hover:bg-night-soft",
  ghost:
    "text-[color:var(--fg)] hover:bg-sand/70 dark:hover:bg-night-soft",
  quiet:
    "text-emerald-ink dark:text-sage-soft underline-offset-4 hover:underline decoration-gold/60",
  danger:
    "border border-red-300/70 text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[0.8125rem]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[0.95rem]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button className={buttonClass(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}

export function IconButton({
  label,
  className,
  children,
  variant = "ghost",
  ...props
}: ComponentProps<"button"> & { label: string; variant?: Variant }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full transition-colors",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ChipLink({
  href,
  active,
  children,
  className,
}: {
  href: string;
  active?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-9 items-center rounded-full border px-3.5 text-[0.8125rem] transition-colors",
        active
          ? "border-emerald/60 bg-emerald-ink text-ivory dark:border-sage/50 dark:bg-emerald-soft"
          : "border-[color:var(--line)] bg-[color:var(--surface-raised)] text-[color:var(--fg)] hover:border-emerald/40",
        className,
      )}
    >
      {children}
    </Link>
  );
}
