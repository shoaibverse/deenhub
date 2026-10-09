import duaDataset from "@/data/duas.json";
import rawSources from "@/data/sources.json";
import type { DuaCategory, DuaEntry } from "@/types";

const dataset = duaDataset as unknown as {
  dataVersion: string;
  released: string;
  collection: { id: string; title: string; description: string; entryCount: number };
  reciter: string | null;
  tags: DuaCategory[];
  entries: DuaEntry[];
};

export const DUA_SOURCES = rawSources.duas;
export const DUA_COLLECTION = dataset.collection;
export const DUA_RECITER = dataset.reciter;

export function getCategories(): DuaCategory[] {
  return dataset.tags;
}

export function getCategoryTitle(id: string) {
  return dataset.tags.find((tag) => tag.id === id)?.title ?? id;
}

/** Curated moment filters used across the app, mapped to real dataset tags. */
export const MOMENT_FILTERS: Array<{ id: string; label: string; tag: string | null }> = [
  { id: "all", label: "All", tag: null },
  { id: "morning", label: "Morning", tag: "morning-and-evening" },
  { id: "evening", label: "Evening", tag: "morning-and-evening" },
  { id: "sleep", label: "Before sleeping", tag: "sleep-and-waking" },
  { id: "after-prayer", label: "After prayer", tag: "prayer-and-the-masjid" },
  { id: "travel", label: "Travel", tag: "travel" },
  { id: "food", label: "Food", tag: "food-and-drink" },
  { id: "forgiveness", label: "Forgiveness", tag: "forgiveness-and-repentance" },
  { id: "protection", label: "Protection", tag: "protection-and-refuge" },
  { id: "difficulty", label: "Difficulty", tag: "distress-and-anxiety" },
  { id: "parents", label: "Home and family", tag: "home-and-family" },
  { id: "knowledge", label: "Knowledge", tag: "knowledge-and-guidance" },
  { id: "ramadan", label: "Fasting and Ramadan", tag: "fasting" },
];

export type DuaQuery = {
  tag?: string | null;
  search?: string | null;
  limit?: number;
  offset?: number;
};

export function getDuas(query: DuaQuery = {}) {
  const { tag, search, limit, offset = 0 } = query;
  const needle = search?.trim().toLowerCase() ?? "";
  let results = dataset.entries;
  if (tag) results = results.filter((entry) => entry.tags.includes(tag));
  if (needle) {
    results = results.filter((entry) => {
      const haystack = [
        entry.title,
        entry.chapter?.title ?? "",
        ...entry.lines.flatMap((line) => [
          line.translation ?? "",
          line.transliteration ?? "",
        ]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }
  const total = results.length;
  const slice = typeof limit === "number" ? results.slice(offset, offset + limit) : results.slice(offset);
  return { total, entries: slice };
}

export function getDuaById(id: string): DuaEntry | null {
  return dataset.entries.find((entry) => entry.id === id) ?? null;
}

export function getDuaBySlug(slug: string): DuaEntry | null {
  return dataset.entries.find((entry) => entry.slug === slug) ?? null;
}

/**
 * Deterministic daily selection. The same entry is shown to everyone on the
 * same calendar day — nothing is randomly generated.
 */
export function getDuaOfTheDay(date: Date): DuaEntry {
  const dayIndex = Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000,
  );
  return dataset.entries[dayIndex % dataset.entries.length];
}

export function duaReference(entry: DuaEntry) {
  const chapter = entry.chapter ? `Chapter ${entry.chapter.number}` : "Hisn al-Muslim";
  return `${chapter}${entry.sourceReference ? `, entry ${entry.sourceReference}` : ""} — ${DUA_SOURCES.book}`;
}
