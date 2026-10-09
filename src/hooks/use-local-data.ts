"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LOCAL_DATA_EVENT,
  LOCAL_DATA_KEYS,
  localId,
  readLocalData,
  writeLocalData,
  type LocalBookmark,
  type LocalQuranProgress,
  type LocalReadingHistory,
  type LocalTasbeehSession,
} from "@/lib/local-data";

function useStoredValue<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setValue(readLocalData(key, fallback));
    setReady(true);
  }, [fallback, key]);

  useEffect(() => {
    refresh();
    const onCustom = (event: Event) => {
      const changedKey = (event as CustomEvent<{ key?: string }>).detail?.key;
      if (!changedKey || changedKey === key || changedKey === "*") refresh();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) refresh();
    };
    window.addEventListener(LOCAL_DATA_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(LOCAL_DATA_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, [key, refresh]);

  const save = useCallback(
    (next: T | ((current: T) => T)) => {
      setValue((current) => {
        const resolved = typeof next === "function" ? (next as (value: T) => T)(current) : next;
        writeLocalData(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return { value, save, ready };
}

const EMPTY_BOOKMARKS: LocalBookmark[] = [];
const EMPTY_FAVORITES: string[] = [];
const EMPTY_PROGRESS: LocalQuranProgress[] = [];
const EMPTY_HISTORY: LocalReadingHistory[] = [];
const EMPTY_TASBEEH: LocalTasbeehSession[] = [];

export function useLocalBookmarks() {
  const state = useStoredValue(LOCAL_DATA_KEYS.bookmarks, EMPTY_BOOKMARKS);

  const has = useCallback(
    (itemType: LocalBookmark["itemType"], itemId: string) =>
      state.value.some((item) => item.itemType === itemType && item.itemId === itemId),
    [state.value],
  );

  const toggle = useCallback(
    (input: Omit<LocalBookmark, "id" | "createdAt">) => {
      const exists = state.value.some(
        (item) => item.itemType === input.itemType && item.itemId === input.itemId,
      );
      if (exists) {
        state.save((items) =>
          items.filter(
            (item) => !(item.itemType === input.itemType && item.itemId === input.itemId),
          ),
        );
        return false;
      }
      state.save((items) => [
        {
          ...input,
          id: localId("bookmark"),
          createdAt: new Date().toISOString(),
        },
        ...items,
      ]);
      return true;
    },
    [state],
  );

  const remove = useCallback(
    (id: string) => state.save((items) => items.filter((item) => item.id !== id)),
    [state],
  );

  return { bookmarks: state.value, ready: state.ready, has, toggle, remove };
}

export function useLocalFavoriteDuas() {
  const state = useStoredValue(LOCAL_DATA_KEYS.favoriteDuas, EMPTY_FAVORITES);
  const has = useCallback((id: string) => state.value.includes(id), [state.value]);
  const toggle = useCallback(
    (id: string) => {
      const exists = state.value.includes(id);
      state.save((items) => (exists ? items.filter((item) => item !== id) : [id, ...items]));
      return !exists;
    },
    [state],
  );
  return { favoriteIds: state.value, ready: state.ready, has, toggle };
}

export function useLocalQuranProgress() {
  const state = useStoredValue(LOCAL_DATA_KEYS.quranProgress, EMPTY_PROGRESS);

  const saveProgress = useCallback(
    (progress: Omit<LocalQuranProgress, "updatedAt">) => {
      const updatedAt = new Date().toISOString();
      state.save((items) => {
        const previous = items.find((item) => item.surahNumber === progress.surahNumber);
        return [
          {
            ...progress,
            lastAyah: progress.lastAyah,
            updatedAt,
          },
          ...items.filter((item) => item.surahNumber !== progress.surahNumber),
        ].map((item) =>
          item.surahNumber === progress.surahNumber && previous
            ? { ...item, lastAyah: progress.lastAyah, updatedAt }
            : item,
        );
      });

      const history = readLocalData<LocalReadingHistory[]>(
        LOCAL_DATA_KEYS.readingHistory,
        [],
      );
      writeLocalData(LOCAL_DATA_KEYS.readingHistory, [
        {
          id: localId("history"),
          itemType: "quran",
          title: `Surah ${progress.surahNumber} · ${progress.surahEnglishName}`,
          subtitle: `Ayah ${progress.lastAyah} of ${progress.totalAyahs}`,
          href: `/quran/${progress.surahNumber}#ayah-${progress.lastAyah}`,
          occurredAt: updatedAt,
        },
        ...history,
      ].slice(0, 50));
    },
    [state],
  );

  return { progress: state.value, ready: state.ready, saveProgress };
}

export function useLocalReadingHistory() {
  const state = useStoredValue(LOCAL_DATA_KEYS.readingHistory, EMPTY_HISTORY);
  return { history: state.value, ready: state.ready };
}

export function useLocalTasbeehHistory() {
  const state = useStoredValue(LOCAL_DATA_KEYS.tasbeehHistory, EMPTY_TASBEEH);
  const saveSession = useCallback(
    (session: Omit<LocalTasbeehSession, "id" | "updatedAt">) => {
      state.save((items) => [
        { ...session, id: localId("tasbeeh"), updatedAt: new Date().toISOString() },
        ...items,
      ].slice(0, 50));
    },
    [state],
  );
  return { sessions: state.value, ready: state.ready, saveSession };
}
