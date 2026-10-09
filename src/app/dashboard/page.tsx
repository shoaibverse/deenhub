import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState, SectionHeading } from "@/components/ui/primitives";
import { DashboardPrayerCard } from "@/components/dashboard/prayer-card";
import { Reveal } from "@/components/ui/motion";
import { BookIcon, HeartIcon, BeadsIcon, BookmarkIcon } from "@/components/ui/icons";
import { getSessionUser } from "@/lib/auth/session";
import {
  countDashboardStats,
  getQuranProgress,
  listBookmarks,
  listFavoriteDuas,
  listReadingHistory,
  listTasbeehSessions,
} from "@/db/queries";
import { getDuaById } from "@/lib/dua/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your reading progress, saved items and daily prayer.",
  robots: { index: false, follow: false },
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");

  const [progress, bookmarks, favourites, history, tasbeeh, stats] = await Promise.all([
    getQuranProgress(user.id),
    listBookmarks(user.id),
    listFavoriteDuas(user.id),
    listReadingHistory(user.id, 6),
    listTasbeehSessions(user.id, 5),
    countDashboardStats(user.id),
  ]);

  const favouriteDuas = favourites
    .map((favourite) => getDuaById(favourite.duaId))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const firstName = (user.displayName ?? user.email.split("@")[0]).split(" ")[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header>
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">
          Assalamu Alaikum
        </p>
        <h1 className="mt-3 font-display text-[2rem] leading-snug sm:text-[2.25rem]">
          Welcome back, {firstName}.
        </h1>
        <p className="mt-2 text-[0.9375rem] text-mute">
          Everything below comes from your own activity on NoorHub.
        </p>
      </header>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        <Reveal>
          <div className="surface flex h-full flex-col rounded-[14px] p-5">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold">
              Continue reading
            </p>
            {progress.lastRead ? (
              <>
                <p className="mt-3 font-display text-[1.25rem] leading-snug">
                  {progress.lastRead.surahEnglishName}
                </p>
                <p className="mt-1.5 flex-1 text-[0.875rem] text-mute">
                  You stopped at ayah {progress.lastRead.lastAyah} of{" "}
                  {progress.surahs.find((row) => row.surahNumber === progress.lastRead?.surahNumber)
                    ?.totalAyahs ?? "—"}
                  .
                </p>
                <Link
                  href={`/quran/${progress.lastRead.surahNumber}#ayah-${progress.lastRead.lastAyah}`}
                  className="link-quiet mt-4 text-[0.8125rem]"
                >
                  Continue reading
                </Link>
              </>
            ) : (
              <>
                <p className="mt-3 flex-1 text-[0.875rem] leading-relaxed text-mute">
                  You haven’t started reading yet. Open the Quran and your position will be recorded
                  here.
                </p>
                <Link href="/quran" className="link-quiet mt-4 text-[0.8125rem]">
                  Open the Quran
                </Link>
              </>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <DashboardPrayerCard />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="surface flex h-full flex-col rounded-[14px] p-5">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold">
              Quran progress
            </p>
            <p className="mt-3 font-display text-[1.75rem] leading-none">
              {progress.percent.toFixed(1)}%
            </p>
            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-sand dark:bg-night-soft"
              role="progressbar"
              aria-valuenow={Math.round(progress.percent)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Quran reading progress"
            >
              <div
                className="h-full rounded-full bg-emerald-ink dark:bg-sage"
                style={{ width: `${Math.min(100, progress.percent)}%` }}
              />
            </div>
            <p className="mt-3 flex-1 text-[0.875rem] text-mute">
              {progress.ayahsRead.toLocaleString("en-GB")} of{" "}
              {progress.totalAyahs.toLocaleString("en-GB")} ayahs · {progress.surahsTouched} surah
              {progress.surahsTouched === 1 ? "" : "s"} opened
            </p>
            {progress.surahs.length > 0 ? (
              <ul className="mt-3 space-y-1.5">
                {progress.surahs.slice(0, 3).map((row) => (
                  <li key={row.surahNumber} className="text-[0.75rem] text-mute">
                    <Link href={`/quran/${row.surahNumber}`} className="link-quiet">
                      {row.surahEnglishName}
                    </Link>{" "}
                    · ayah {row.lastAyah}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Reveal>
      </div>

      {/* Saved items ------------------------------------------------------ */}
      <section className="mt-14">
        <SectionHeading
          title="Saved items"
          description="Ayahs, hadith and duas you have bookmarked."
          action={
            <Link href="/bookmarks" className="link-quiet text-[0.875rem]">
              All bookmarks
            </Link>
          }
        />
        {bookmarks.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<BookmarkIcon />}
              title="You haven't saved anything yet."
              description="Save an Ayah, Hadith or Dua and it will appear here."
            />
          </div>
        ) : (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {bookmarks.slice(0, 4).map((bookmark) => (
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
                  {bookmark.subtitle ? (
                    <span className="mt-1 text-[0.75rem] text-mute">{bookmark.subtitle}</span>
                  ) : null}
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

      {/* Favourite duas --------------------------------------------------- */}
      <section className="mt-14">
        <SectionHeading
          title="Favourite duas"
          description="Supplications you have marked for quick access."
          action={
            <Link href="/duas" className="link-quiet text-[0.875rem]">
              Browse duas
            </Link>
          }
        />
        {favouriteDuas.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<HeartIcon />}
              title="Your favourite duas will appear here."
              description="Open a dua and select the heart to save it for later."
            />
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
            {favouriteDuas.slice(0, 5).map((entry) => (
              <li key={entry.id}>
                <Link
                  href={`/duas?entry=${entry.id}`}
                  className="flex items-baseline justify-between gap-4 py-3 hover:bg-sand/50 dark:hover:bg-night-soft/60"
                >
                  <span className="text-[0.9375rem]">{entry.title}</span>
                  <span className="shrink-0 text-[0.75rem] text-mute">
                    {entry.chapter ? `Chapter ${entry.chapter.number}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent activity -------------------------------------------------- */}
      <section className="mt-14">
        <SectionHeading title="Recent activity" description="Your own reading and dhikr." />
        {history.length === 0 && tasbeeh.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<BookIcon />}
              title="No activity yet."
              description="Read a surah or count some dhikr, and your recent activity will be listed here."
            />
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
            {history.map((entry) => (
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
            {tasbeeh.map((session) => (
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
        {stats.bookmarks} bookmark{stats.bookmarks === 1 ? "" : "s"} · {stats.favorites} favourite
        {stats.favorites === 1 ? "" : "s"} · {stats.dhikrCounted.toLocaleString("en-GB")} dhikr
        counted in saved sessions. These figures are taken from your own record.
      </p>
    </div>
  );
}
