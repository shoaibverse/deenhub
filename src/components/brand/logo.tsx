import { cn } from "@/lib/utils/cn";

/**
 * NoorHub mark: a crescent with a single ray of light passing through it,
 * resting on a subtle eight-point star. Drawn as SVG so it stays crisp at any
 * size and works as a favicon.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("size-8", className)}
      role="img"
      aria-label="NoorHub"
    >
      <rect width="40" height="40" rx="10" fill="currentColor" opacity="0.06" />
      <path
        d="M25.4 10.6a9.4 9.4 0 1 0 0 18.8 10.6 10.6 0 0 1 0-18.8Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M11.6 20h6.2M14.7 12.9l3.1 5.4M14.7 27.1l3.1-5.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="28.6" cy="20" r="1.5" fill="var(--color-gold, #a5813a)" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="size-8 text-emerald-ink dark:text-sage-soft" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.0625rem] font-semibold tracking-[0.14em] text-[color:var(--fg)]">
          NOORHUB
        </span>
        <span className="mt-0.5 text-[0.5625rem] uppercase tracking-[0.2em] text-mute">
          Reconnect with your deen
        </span>
      </span>
    </span>
  );
}
