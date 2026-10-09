"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePreferences } from "@/components/providers/preferences-provider";
import { MoonIcon, SunIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import type { ThemeMode } from "@/types";

const OPTIONS: Array<{ value: ThemeMode; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeToggle() {
  const { preferences, setTheme } = usePreferences();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const cycle = () => {
    const order: ThemeMode[] = ["light", "dark", "system"];
    const next = order[(order.indexOf(preferences.theme) + 1) % order.length];
    setTheme(next);
  };

  const label = OPTIONS.find((option) => option.value === preferences.theme)?.label ?? "System";

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${label}. Change theme`}
      title={`Theme: ${label}`}
      className="relative inline-flex size-10 items-center justify-center rounded-full text-[color:var(--fg)] transition-colors hover:bg-sand/70 dark:hover:bg-night-soft"
    >
      {mounted && preferences.theme === "dark" ? (
        <MoonIcon width={18} height={18} />
      ) : (
        <SunIcon width={18} height={18} />
      )}
      <AnimatePresence>
        <motion.span
          key={label}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className="sr-only"
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function ThemeSegmented({ className }: { className?: string }) {
  const { preferences, setTheme } = usePreferences();
  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        "inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--surface-sunken)] p-0.5",
        className,
      )}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={preferences.theme === option.value}
          onClick={() => setTheme(option.value)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors",
            preferences.theme === option.value
              ? "bg-[color:var(--surface-raised)] text-emerald-ink shadow-sm dark:text-sage-soft"
              : "text-mute hover:text-[color:var(--fg)]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
