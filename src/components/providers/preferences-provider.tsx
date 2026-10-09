"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ARABIC_FONT_MAX,
  ARABIC_FONT_MIN,
  DEFAULT_PREFERENCES,
  LOCAL_PREFERENCES_KEY,
  type LocalPreferences,
} from "@/lib/preferences";
import type { ThemeMode } from "@/types";

type PreferencesContextValue = {
  preferences: LocalPreferences;
  ready: boolean;
  update: (patch: Partial<LocalPreferences>) => void;
  reset: () => void;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: "light" | "dark";
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function clampFont(value: number) {
  if (Number.isNaN(value)) return DEFAULT_PREFERENCES.arabicFontSize;
  return Math.min(ARABIC_FONT_MAX, Math.max(ARABIC_FONT_MIN, value));
}

export function resolveTheme(theme: ThemeMode): "light" | "dark" {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function PreferencesProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: Partial<LocalPreferences>;
}) {
  const [preferences, setPreferences] = useState<LocalPreferences>({
    ...DEFAULT_PREFERENCES,
    ...initial,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCAL_PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<LocalPreferences>;
        setPreferences((current) => ({
          ...current,
          ...parsed,
          arabicFontSize: clampFont(parsed.arabicFontSize ?? current.arabicFontSize),
        }));
      }
    } catch {
      /* ignore unreadable preferences */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(LOCAL_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch {
      /* storage may be unavailable */
    }
  }, [preferences, ready]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const resolved = resolveTheme(preferences.theme);
      document.documentElement.classList.toggle("dark", resolved === "dark");
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [preferences.theme]);

  const update = useCallback((patch: Partial<LocalPreferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      if (patch.arabicFontSize !== undefined) {
        next.arabicFontSize = clampFont(patch.arabicFontSize);
      }
      return next;
    });
  }, []);

  const setTheme = useCallback((theme: ThemeMode) => {
    update({ theme });
  }, [update]);

  const reset = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      preferences,
      ready,
      update,
      reset,
      setTheme,
      resolvedTheme:
        typeof document !== "undefined" && document.documentElement.classList.contains("dark")
          ? "dark"
          : "light",
    }),
    [preferences, ready, update, reset, setTheme],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used inside PreferencesProvider");
  }
  return context;
}
