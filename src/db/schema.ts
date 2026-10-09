import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * NoorHub data model.
 *
 * Every table that holds personal data is keyed by `userId` and is only ever
 * queried through the server-side session layer (src/lib/auth), which always
 * filters by the authenticated user. See src/db/policies.sql for the
 * production Row Level Security policies used when running on Supabase.
 */

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash"),
    displayName: text("display_name"),
    authProvider: text("auth_provider").notNull().default("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("profiles_email_unique").on(table.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("sessions_user_idx").on(table.userId)],
);

export const userPreferences = pgTable("user_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  language: text("language").notNull().default("en"),
  theme: text("theme").notNull().default("system"),
  arabicFontSize: integer("arabic_font_size").notNull().default(30),
  translationEdition: text("translation_edition").notNull().default("en.sahih"),
  showTranslation: boolean("show_translation").notNull().default(true),
  showTransliteration: boolean("show_transliteration").notNull().default(true),
  reciter: text("reciter").notNull().default("ar.alafasy"),
  prayerMethod: text("prayer_method").notNull().default("MuslimWorldLeague"),
  asrJuristic: text("asr_juristic").notNull().default("standard"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  locationLabel: text("location_label"),
  notifyPrayer: boolean("notify_prayer").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    itemType: text("item_type").notNull(),
    itemId: text("item_id").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    reference: text("reference"),
    href: text("href").notNull(),
    snippet: text("snippet"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("bookmarks_user_item_unique").on(table.userId, table.itemType, table.itemId),
    index("bookmarks_user_idx").on(table.userId),
  ],
);

export const quranProgress = pgTable(
  "quran_progress",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    surahNumber: integer("surah_number").notNull(),
    lastAyah: integer("last_ayah").notNull().default(1),
    ayahsRead: integer("ayahs_read").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.surahNumber] })],
);

export const readingHistory = pgTable(
  "reading_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    itemType: text("item_type").notNull(),
    itemId: text("item_id").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    href: text("href").notNull(),
    meta: jsonb("meta"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("reading_history_user_idx").on(table.userId, table.occurredAt)],
);

export const favoriteDuas = pgTable(
  "favorite_duas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    duaId: text("dua_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("favorite_duas_user_dua_unique").on(table.userId, table.duaId)],
);

export const tasbeehSessions = pgTable(
  "tasbeeh_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    dhikr: text("dhikr").notNull().default("subhanallah"),
    target: integer("target").notNull().default(33),
    count: integer("count").notNull().default(0),
    completed: boolean("completed").notNull().default(false),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("tasbeeh_user_idx").on(table.userId, table.updatedAt)],
);

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  preferences: one(userPreferences, {
    fields: [profiles.id],
    references: [userPreferences.userId],
  }),
  bookmarks: many(bookmarks),
}));

export type Profile = typeof profiles.$inferSelect;
export type UserPreferencesRow = typeof userPreferences.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type QuranProgressRow = typeof quranProgress.$inferSelect;
export type FavoriteDua = typeof favoriteDuas.$inferSelect;
export type TasbeehSession = typeof tasbeehSessions.$inferSelect;
export type ReadingHistoryRow = typeof readingHistory.$inferSelect;
