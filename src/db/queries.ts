import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  bookmarks,
  favoriteDuas,
  quranProgress,
  readingHistory,
  tasbeehSessions,
  userPreferences,
  profiles,
} from "@/db/schema";
import { getSurahs } from "@/lib/quran/service";
import type { BookmarkItem, Preferences } from "@/types";
import { DEFAULT_PREFERENCES } from "@/lib/preferences";

export async function listBookmarks(userId: string): Promise<BookmarkItem[]> {
  const rows = await db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt));
  return rows.map((row) => ({
    id: row.id,
    itemType: row.itemType as BookmarkItem["itemType"],
    itemId: row.itemId,
    title: row.title,
    subtitle: row.subtitle,
    reference: row.reference,
    href: row.href,
    snippet: row.snippet,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function isBookmarked(userId: string, itemType: string, itemId: string) {
  const rows = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.userId, userId),
        eq(bookmarks.itemType, itemType),
        eq(bookmarks.itemId, itemId),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

export async function listBookmarkedKeys(userId: string, itemType: string) {
  const rows = await db
    .select({ itemId: bookmarks.itemId })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.itemType, itemType)));
  return new Set(rows.map((row) => row.itemId));
}

export type QuranProgressSummary = {
  ayahsRead: number;
  totalAyahs: number;
  percent: number;
  surahsTouched: number;
  lastRead: {
    surahNumber: number;
    surahName: string;
    surahEnglishName: string;
    lastAyah: number;
    updatedAt: string;
  } | null;
  surahs: Array<{
    surahNumber: number;
    surahEnglishName: string;
    surahName: string;
    lastAyah: number;
    ayahsRead: number;
    totalAyahs: number;
    updatedAt: string;
  }>;
};

export async function getQuranProgress(userId: string): Promise<QuranProgressSummary> {
  const surahs = getSurahs();
  const totalAyahs = surahs.reduce((sum, s) => sum + s.numberOfAyahs, 0);
  const rows = await db
    .select()
    .from(quranProgress)
    .where(eq(quranProgress.userId, userId))
    .orderBy(desc(quranProgress.updatedAt));

  const bySurah = new Map(rows.map((row) => [row.surahNumber, row]));
  const ayahsRead = rows.reduce((sum, row) => sum + row.ayahsRead, 0);
  const lastReadRow = rows[0] ?? null;
  const surahMeta = lastReadRow ? surahs.find((s) => s.number === lastReadRow.surahNumber) : null;

  return {
    ayahsRead,
    totalAyahs,
    percent: totalAyahs === 0 ? 0 : Math.min(100, (ayahsRead / totalAyahs) * 100),
    surahsTouched: rows.length,
    lastRead: lastReadRow
      ? {
          surahNumber: lastReadRow.surahNumber,
          surahName: surahMeta?.name ?? "",
          surahEnglishName: surahMeta?.englishName ?? `Surah ${lastReadRow.surahNumber}`,
          lastAyah: lastReadRow.lastAyah,
          updatedAt: lastReadRow.updatedAt.toISOString(),
        }
      : null,
    surahs: rows.map((row) => {
      const meta = surahs.find((s) => s.number === row.surahNumber);
      return {
        surahNumber: row.surahNumber,
        surahEnglishName: meta?.englishName ?? `Surah ${row.surahNumber}`,
        surahName: meta?.name ?? "",
        lastAyah: row.lastAyah,
        ayahsRead: row.ayahsRead,
        totalAyahs: meta?.numberOfAyahs ?? 0,
        updatedAt: row.updatedAt.toISOString(),
      };
    }),
  };
}

export async function listFavoriteDuas(userId: string) {
  return db
    .select()
    .from(favoriteDuas)
    .where(eq(favoriteDuas.userId, userId))
    .orderBy(desc(favoriteDuas.createdAt));
}

export async function listFavoriteDuaIds(userId: string) {
  const rows = await db
    .select({ duaId: favoriteDuas.duaId })
    .from(favoriteDuas)
    .where(eq(favoriteDuas.userId, userId));
  return new Set(rows.map((row) => row.duaId));
}

export async function listReadingHistory(userId: string, limit = 8) {
  return db
    .select()
    .from(readingHistory)
    .where(eq(readingHistory.userId, userId))
    .orderBy(desc(readingHistory.occurredAt))
    .limit(limit);
}

export async function listTasbeehSessions(userId: string, limit = 10) {
  return db
    .select()
    .from(tasbeehSessions)
    .where(eq(tasbeehSessions.userId, userId))
    .orderBy(desc(tasbeehSessions.updatedAt))
    .limit(limit);
}

export async function countDashboardStats(userId: string) {
  const [bookmarkCount] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId));
  const [favoriteCount] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(favoriteDuas)
    .where(eq(favoriteDuas.userId, userId));
  const [tasbeehTotal] = await db
    .select({ value: sql<number>`coalesce(sum(${tasbeehSessions.count}), 0)::int` })
    .from(tasbeehSessions)
    .where(eq(tasbeehSessions.userId, userId));
  return {
    bookmarks: bookmarkCount?.value ?? 0,
    favorites: favoriteCount?.value ?? 0,
    dhikrCounted: tasbeehTotal?.value ?? 0,
  };
}

export async function upsertPreferences(
  userId: string,
  patch: Partial<Preferences>,
): Promise<Preferences> {
  const existing = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  if (existing.length === 0) {
    const inserted = await db
      .insert(userPreferences)
      .values({ userId, ...DEFAULT_PREFERENCES, ...patch })
      .returning();
    return toPreferences(inserted[0]);
  }

  const updated = await db
    .update(userPreferences)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(userPreferences.userId, userId))
    .returning();
  return toPreferences(updated[0]);
}

type PreferencesRow = typeof userPreferences.$inferSelect;

function toPreferences(row: PreferencesRow): Preferences {
  return {
    language: row.language,
    theme: row.theme as Preferences["theme"],
    arabicFontSize: row.arabicFontSize,
    translationEdition: row.translationEdition,
    showTranslation: row.showTranslation,
    showTransliteration: row.showTransliteration,
    reciter: row.reciter,
    prayerMethod: row.prayerMethod,
    asrJuristic: row.asrJuristic as Preferences["asrJuristic"],
    latitude: row.latitude,
    longitude: row.longitude,
    locationLabel: row.locationLabel,
    notifyPrayer: row.notifyPrayer,
  };
}

export async function getProfile(userId: string) {
  const rows = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  return rows[0] ?? null;
}
