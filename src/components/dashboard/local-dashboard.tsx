"use client";

import Link from "next/link";
import { DashboardPrayerCard } from "@/components/dashboard/prayer-card";
import { EmptyState, SectionHeading } from "@/components/ui/primitives";
import { BeadsIcon, BookIcon, BookmarkIcon, HeartIcon } from "@/components/ui/icons";
import {
  useLocalBookmarks,
  useLocalFavoriteDuas,
  useLocalQuranProgress,
  useLocalReadingHistory,
  useLocalTasbeehHistory,
} from "@/hooks/use-local-data";
import { getDuaById } from "@/lib/dua/service";
import { getSurahs } from "@/lib/quran/service";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function LocalDashboard() {
  const bookmarks = useLocalBookmarks();
  const favorites = useLocalFavoriteDuas();
  const quran = useLocalQuranProgress();
  const reading = useLocalReadingHistory();
  const tasbeeh = useLocalTasbeehHistory();
  const surahs = getSurahs();
  const totalAyahs = surahs.reduce((sum, surah) => sum + surah.numberOfAyahs, 0);
  const ayahsRead = quran.progress.reduce(
    (sum, item) => sum + Math.min(item.lastAyah, item.totalAyahs),
    0,
  );
  const percent = totalAyahs > 0 ? Math.min(100, (ayahsRead / totalAyahs) * 100) : 0;
  const lastRead = quran.progress[0] ?? null;
  const favoriteDuas = favorites.favoriteIds
    .map((id) => getDuaById(id))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const dhikrCounted = tasbeeh.sessions.reduce((sum, item) => sum + item.count, 0);

  const ready =
    bookmarks.ready && favorites.ready && quran.ready && reading.ready && tasbeeh.ready;

  if (!ready) {
    return (
      <div className="space-y-4" aria-busy="true">
        <p className="text-[0.8125rem] text-mute">Loading your data from this browser…</p>
        <div className="grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="skeleton h-52 rounded-[14px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface flex h-full flex-col rounded-[14px] p-5">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold">
            Continue reading
          </p>
          {lastRead ? (
            <>
              <p className="mt-3 font-display text-[1.25rem] leading-snug">
                {lastRead.surahEnglishName}
              </p>
              <p className="mt-1.5 flex-1 text-[0.875rem] text-mute">
                You stopped at ayah {lastRead.lastAyah} of {lastRead.totalAyahs}.
              </p>
              <Link
                href={`/quran/${lastRead.surahNumber}#ayah-${lastRead.lastAyah}`}
                className="link-quiet mt-4 text-[0.8125rem]"
              >
                Continue reading
              </Link>
            </>
          ) : (
            <>
              <p className="mt-3 flex-1 text-[0.875rem] leading-relaxed text-mute">
                Start reading the Quran and your position will appear here.
              </p>
              <Link href="/quran" className="link-quiet mt-4 text-[0.8125rem]">
                Open the Quran
              </Link>
            </>
          )}
        </div>

        <DashboardPrayerCard />

        <div className="surface flex h-full flex-col rounded-[14px] p-5">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold">
            Quran progress
          </p>
          <p className="mt-3 font-display text-[1.75rem] leading-none">{percent.toFixed(1)}%</p>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-sand dark:bg-night-soft"
            role="progressbar"
            aria-valuenow={Math.round(percent)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-emerald-ink dark:bg-sage"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-3 text-[0.875rem] text-mute">
            {ayahsRead.toLocaleString("en-GB")} of {totalAyahs.toLocaleString("en-GB")} ayahs ·{" "}
            {quran.progress.length} surah{quran.progress.length === 1 ? "" : "s"} opened
          </p>
        </div>
      </div>

      <section className="mt-14">
        <SectionHeading
          title="Saved items"
          description="Ayahs and hadith saved in this browser."
          action={
            <Link href="/bookmarks" className="link-quiet text-[0.875rem]">
              All bookmarks
            </Link>
          }
        />
        {bookmarks.bookmarks.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<BookmarkIcon />}
              title="No bookmarks yet."
              description="Save an Ayah or Hadith and it will appear here."
            />
          </div>
        ) : (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {bookmarks.bookmarks.slice(0, 4).map((bookmark) => (
              <li key={bookmark.id}>
                <Link
                  href={bookmark.href}
                  className="surface flex h-full flex-col rounded-[14px] p-4 transition-colors hover:border-emerald/40"
                >
                  <span className="text-[0.6875rem] uppercase tracking-[0.12em] text-gold">
                    {bookmark.itemType}
                  </span>
                  <span className="mt-1.5 font-display text-[1rem] leading-snug">
                    {bookmark.title}
                  </span>
                  {bookmark.snippet ? (
                    <span className="mt-2 line-clamp-2 text-[0.8125rem] leading-relaxed text-mute">
                      {bookmark.snippet}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-14">
        <SectionHeading
          title="Favorite duas"
          description="Supplications marked for quick access on this device."
        />
        {favoriteDuas.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<HeartIcon />}
              title="Your favorite duas will appear here."
              description="Open a dua and select the heart to save it locally."
            />
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
            {favoriteDuas.slice(0, 5).map((entry) => (
              <li key={entry.id}>
                <Link
                  href={`/duas?entry=${entry.id}`}
                  className="flex items-baseline justify-between gap-4 py-3"
                >
                  <span className="text-[0.9375rem]">{entry.title}</span>
                  <span className="text-[0.75rem] text-mute">
                    {entry.chapter ? `Chapter ${entry.chapter.number}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-14">
        <SectionHeading title="Recent activity" description="Your own reading and saved dhikr." />
        {reading.history.length === 0 && tasbeeh.sessions.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<BookIcon />}
              title="No activity yet."
              description="Read a surah or save a tasbeeh session and it will be listed here."
            />
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
            {reading.history.slice(0, 6).map((entry) => (
              <li key={entry.id} className="flex items-baseline justify-between gap-4 py-3">
                <Link href={entry.href} className="link-quiet text-[0.9375rem]">
                  {entry.title}
                </Link>
                <span className="shrink-0 text-[0.75rem] text-mute">
                  {entry.subtitle ? `${entry.subtitle} · ` : ""}
                  {dateFormatter.format(new Date(entry.occurredAt))}
                </span>
              </li>
            ))}
            {tasbeeh.sessions.slice(0, 5).map((session) => (
              <li key={session.id} className="flex items-baseline justify-between gap-4 py-3">
                <span className="text-[0.9375rem]">
                  <BeadsIcon width={16} height={16} className="me-2 inline text-sage" />
                  {session.dhikr} · {session.count} of {session.target}
                </span>
                <span className="shrink-0 text-[0.75rem] text-mute">
                  {dateFormatter.format(new Date(session.updatedAt))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-12 text-[0.75rem] text-mute">
        {bookmarks.bookmarks.length} bookmark{bookmarks.bookmarks.length === 1 ? "" : "s"} ·{" "}
        {favorites.favoriteIds.length} favorite{favorites.favoriteIds.length === 1 ? "" : "s"} ·{" "}
        {dhikrCounted.toLocaleString("en-GB")} dhikr counted. All figures come from this browser only.
      </p>
    </div>
  );
}
