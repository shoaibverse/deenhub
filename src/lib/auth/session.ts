import { cache } from "react";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db } from "@/db";
import { profiles, sessions, userPreferences } from "@/db/schema";
import { DEFAULT_PREFERENCES } from "@/lib/preferences";
import type { Preferences, SessionUser } from "@/types";

export const SESSION_COOKIE = "noorhub_session";
const SESSION_DAYS = 30;

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.insert(sessions).values({ id: token, userId, expiresAt });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
  return token;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, token)).catch(() => undefined);
  }
  store.delete(SESSION_COOKIE);
}

/**
 * Resolves the signed-in user for the current request. Cached per request so
 * multiple server components can call it without extra queries.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const rows = await db
      .select({
        id: profiles.id,
        email: profiles.email,
        displayName: profiles.displayName,
      })
      .from(sessions)
      .innerJoin(profiles, eq(profiles.id, sessions.userId))
      .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date())))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
});

export const getPreferences = cache(async (): Promise<Preferences> => {
  const user = await getSessionUser();
  if (!user) return DEFAULT_PREFERENCES;
  try {
    const rows = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, user.id))
      .limit(1);
    const row = rows[0];
    if (!row) return DEFAULT_PREFERENCES;
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
  } catch {
    return DEFAULT_PREFERENCES;
  }
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}
