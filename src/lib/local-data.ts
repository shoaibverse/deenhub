import type { BookmarkItem } from "@/types";

/**
 * NoorHub is local-first: all personal data stays in this browser.
 * No account, database, cookie, or server-side personal-data API is required.
 */
export const LOCAL_DATA_KEYS = {
  bookmarks: "noorhub.bookmarks.v1",
  favoriteDuas: "noorhub.favorite-duas.v1",
  quranProgress: "noorhub.quran-progress.v1",
  readingHistory: "noorhub.reading-history.v1",
  tasbeehHistory: "noorhub.tasbeeh-history.v1",
} as const;

export const LOCAL_DATA_EVENT = "noorhub:local-data";

export type LocalBookmark = BookmarkItem;

export type LocalQuranProgress = {
  surahNumber: number;
  surahEnglishName: string;
  surahName: string;
  lastAyah: number;
  totalAyahs: number;
  updatedAt: string;
};

export type LocalReadingHistory = {
  id: string;
  itemType: "quran" | "hadith" | "dua" | "tasbeeh";
  title: string;
  subtitle: string | null;
  href: string;
  occurredAt: string;
};

export type LocalTasbeehSession = {
  id: string;
  dhikr: string;
  target: number;
  count: number;
  updatedAt: string;
};

export function readLocalData<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocalData<T>(key: string, value: T) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(LOCAL_DATA_EVENT, { detail: { key } }));
    return true;
  } catch {
    return false;
  }
}

export function removeLocalData(key: string) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent(LOCAL_DATA_EVENT, { detail: { key } }));
    return true;
  } catch {
    return false;
  }
}

export function localId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function clearAllNoorHubLocalData() {
  if (typeof window === "undefined") return false;
  try {
    for (const key of Object.values(LOCAL_DATA_KEYS)) {
      window.localStorage.removeItem(key);
    }
    window.localStorage.removeItem("noorhub.preferences.v1");
    window.localStorage.removeItem("noorhub.tasbeeh.v1");
    window.localStorage.removeItem("noorhub.location.v1");
    window.localStorage.removeItem("noorhub.recent-searches.v1");
    window.dispatchEvent(new CustomEvent(LOCAL_DATA_EVENT, { detail: { key: "*" } }));
    return true;
  } catch {
    return false;
  }
}
