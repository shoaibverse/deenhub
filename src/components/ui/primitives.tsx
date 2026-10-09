import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { AlertIcon, RefreshIcon } from "./icons";
import { Button } from "./button";

export function Panel({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("surface rounded-[14px] p-5 sm:p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl leading-snug sm:text-[1.75rem]">{title}</h2>
        {description ? (
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-mute">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Hairline({ className }: { className?: string }) {
  return <div className={cn("hairline my-8", className)} aria-hidden="true" />;
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "gold" | "emerald";
  className?: string;
}) {
  const tones = {
    neutral: "border-[color:var(--line)] text-mute",
    gold: "border-gold/40 text-gold",
    emerald: "border-emerald/30 text-emerald-ink dark:text-sage-soft",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.1em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton h-4 w-full", className)} aria-hidden="true" />;
}

export function SkeletonLines({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)} role="status" aria-label="Loading">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={index === lines - 1 ? "w-2/3" : "w-full"}
        />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[14px] border border-dashed border-[color:var(--line)] px-6 py-12 text-center">
      {icon ? <div className="text-sage">{icon}</div> : null}
      <p className="font-display text-lg">{title}</p>
      <p className="max-w-md text-sm leading-relaxed text-mute">{description}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  retryLabel = "Retry",
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-[14px] border border-[color:var(--line)] bg-[color:var(--surface-raised)] p-5"
    >
      <div className="flex items-center gap-2 text-gold">
        <AlertIcon />
        <p className="font-display text-lg text-[color:var(--fg)]">{title}</p>
      </div>
      <p className="text-sm leading-relaxed text-mute">{description}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshIcon width={16} height={16} />
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-[0.8125rem] font-medium text-[color:var(--fg)]"
      >
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-mute">{hint}</p> : null}
      {error ? (
        <p className="text-xs text-red-700 dark:text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-[10px] border border-[color:var(--line)] bg-[color:var(--surface-raised)] px-3.5 py-2.5 text-sm text-[color:var(--fg)] placeholder:text-mute/70 focus:border-emerald/60 focus:outline-none focus:ring-2 focus:ring-emerald/20";

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--surface-sunken)] p-0.5",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors",
              active
                ? "bg-[color:var(--surface-raised)] text-emerald-ink shadow-sm dark:text-sage-soft"
                : "text-mute hover:text-[color:var(--fg)]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Note({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "gold";
}) {
  return (
    <p
      className={cn(
        "rounded-[10px] border-l-2 px-4 py-3 text-[0.8125rem] leading-relaxed",
        tone === "gold"
          ? "border-gold/60 bg-gold-pale/30 text-[color:var(--fg)] dark:bg-gold/10"
          : "border-sage/50 bg-sand/50 text-mute dark:bg-night-soft",
      )}
    >
      {children}
    </p>
  );
}
