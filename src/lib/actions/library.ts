"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  bookmarks,
  contactMessages,
  favoriteDuas,
  quranProgress,
  readingHistory,
  tasbeehSessions,
} from "@/db/schema";
import { getSessionUser } from "@/lib/auth/session";
import { upsertPreferences } from "@/db/queries";
import { getSurahMeta } from "@/lib/quran/service";
import { isValidEmail } from "@/lib/utils/cn";
import type { Preferences } from "@/types";

export type ActionResult = { ok: boolean; error?: string; message?: string };

export async function toggleBookmark(input: {
  itemType: "quran" | "hadith" | "dua";
  itemId: string;
  title: string;
  subtitle?: string | null;
  reference?: string | null;
  href: string;
  snippet?: string | null;
}): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Sign in to save this to your bookmarks." };

  const existing = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.userId, user.id),
        eq(bookmarks.itemType, input.itemType),
        eq(bookmarks.itemId, input.itemId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id));
    revalidatePath("/bookmarks");
    revalidatePath("/dashboard");
    return { ok: true, message: "Bookmark removed." };
  }

  await db.insert(bookmarks).values({
    userId: user.id,
    itemType: input.itemType,
    itemId: input.itemId,
    title: input.title,
    subtitle: input.subtitle ?? null,
    reference: input.reference ?? null,
    href: input.href,
    snippet: input.snippet ?? null,
  });
  revalidatePath("/bookmarks");
  revalidatePath("/dashboard");
  return { ok: true, message: "Saved to your bookmarks." };
}

export async function deleteBookmark(id: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Please sign in." };
  await db.delete(bookmarks).where(and(eq(bookmarks.id, id), eq(bookmarks.userId, user.id)));
  revalidatePath("/bookmarks");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function saveReadingProgress(input: {
  surahNumber: number;
  lastAyah: number;
}): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false };

  const surah = getSurahMeta(input.surahNumber);
  if (!surah) return { ok: false, error: "Surah not found." };
  const lastAyah = Math.min(Math.max(input.lastAyah, 1), surah.numberOfAyahs);

  await db
    .insert(quranProgress)
    .values({
      userId: user.id,
      surahNumber: surah.number,
      lastAyah,
      ayahsRead: lastAyah,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [quranProgress.userId, quranProgress.surahNumber],
      set: {
        lastAyah,
        ayahsRead: sql`greatest(${quranProgress.ayahsRead}, ${lastAyah})`,
        updatedAt: new Date(),
      },
    });

  await db.insert(readingHistory).values({
    userId: user.id,
    itemType: "quran",
    itemId: `surah-${surah.number}`,
    title: `Surah ${surah.number} · ${surah.englishName}`,
    subtitle: `Ayah ${lastAyah} of ${surah.numberOfAyahs}`,
    href: `/quran/${surah.number}#ayah-${lastAyah}`,
    meta: { surahNumber: surah.number, lastAyah },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function toggleFavoriteDua(duaId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Sign in to save your favourite duas." };

  const existing = await db
    .select({ id: favoriteDuas.id })
    .from(favoriteDuas)
    .where(and(eq(favoriteDuas.userId, user.id), eq(favoriteDuas.duaId, duaId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(favoriteDuas).where(eq(favoriteDuas.id, existing[0].id));
    revalidatePath("/duas");
    revalidatePath("/dashboard");
    return { ok: true, message: "Removed from favourites." };
  }

  await db.insert(favoriteDuas).values({ userId: user.id, duaId });
  revalidatePath("/duas");
  revalidatePath("/dashboard");
  return { ok: true, message: "Saved to your favourite duas." };
}

export async function saveTasbeehSession(input: {
  dhikr: string;
  target: number;
  count: number;
}): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false };
  await db.insert(tasbeehSessions).values({
    userId: user.id,
    dhikr: input.dhikr,
    target: input.target,
    count: input.count,
    completed: input.count >= input.target,
  });
  revalidatePath("/tasbeeh");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updatePreferencesAction(
  patch: Partial<Preferences>,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Sign in to save preferences." };
  await upsertPreferences(user.id, patch);
  revalidatePath("/settings");
  revalidatePath("/quran");
  return { ok: true };
}

export async function sendContactMessage(
  _previous: { error: string | null; ok: boolean },
  formData: FormData,
): Promise<{ error: string | null; ok: boolean }> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (name.length < 2) return { error: "Please enter your name.", ok: false };
  if (!isValidEmail(email)) return { error: "Enter a valid email address.", ok: false };
  if (message.length < 10) return { error: "Please write a little more detail.", ok: false };

  try {
    await db.insert(contactMessages).values({ name, email, message });
    return { error: null, ok: true };
  } catch {
    return { error: "We could not send your message right now. Please try again.", ok: false };
  }
}
