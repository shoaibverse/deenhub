import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { QuranReader } from "@/components/quran/quran-reader";
import { ErrorState } from "@/components/ui/primitives";
import {
  editionName,
  getSurahContent,
  getSurahMeta,
  getSurahs,
  surahAudioUrl,
} from "@/lib/quran/service";
import { getSessionUser, getPreferences } from "@/lib/auth/session";
import { listBookmarkedKeys, getQuranProgress } from "@/db/queries";
import { toHijri } from "@/lib/calendar/service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ surah: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { surah } = await params;
  const number = Number(surah);
  const meta = getSurahMeta(number);
  if (!meta) return { title: "Quran" };
  return {
    title: `Surah ${meta.englishName}`,
    description: `Read Surah ${meta.englishName} (${meta.englishNameTranslation}) — ${meta.numberOfAyahs} ayahs, ${meta.revelationType}.`,
    alternates: { canonical: `/quran/${number}` },
  };
}

async function Reader({ params, searchParams }: PageProps) {
  const { surah } = await params;
  const { translation } = await searchParams;
  const number = Number(surah);
  if (!Number.isInteger(number) || number < 1 || number > 114) notFound();

  const user = await getSessionUser();
  const preferences = await getPreferences();
  const editionParam = Array.isArray(translation) ? translation[0] : translation;
  const edition =
    editionParam === "" ? "" : (editionParam ?? preferences.translationEdition);

  let content;
  try {
    content = await getSurahContent(number, edition, preferences.reciter);
  } catch {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ErrorState
          title="We couldn't load this surah"
          description="The Quran source did not respond. Check your connection and try again in a moment."
        />
      </div>
    );
  }

  const [bookmarks, progress] = user
    ? await Promise.all([listBookmarkedKeys(user.id, "quran"), getQuranProgress(user.id)])
    : [new Set<string>(), null];

  const surahs = getSurahs();
  const previous = number > 1 ? surahs[number - 2] : null;
  const nextSurah = number < 114 ? surahs[number] : null;

  return (
    <div className="pb-16">
      <QuranReader
        content={content}
        surahAudioUrl={surahAudioUrl(preferences.reciter, number)}
        signedIn={Boolean(user)}
        bookmarkedAyahs={[...bookmarks]}
        lastReadAyah={progress?.surahs.find((row) => row.surahNumber === number)?.lastAyah ?? null}
        previous={previous ? { number: previous.number, englishName: previous.englishName } : null}
        next={nextSurah ? { number: nextSurah.number, englishName: nextSurah.englishName } : null}
      />
      <p className="mx-auto mt-8 max-w-4xl px-4 text-center text-[0.6875rem] text-mute sm:px-6">
        Read on {toHijri(new Date()).formatted} · Translation:{" "}
        {edition ? editionName(edition) : "Arabic only"}
      </p>
    </div>
  );
}

export default async function SurahPage(props: PageProps) {
  // Validate before the Suspense boundary so an invalid surah returns a proper
  // 404 rather than a streamed response.
  const { surah } = await props.params;
  const surahNumber = Number(surah);
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) notFound();

  return (
    <div className="py-8 sm:py-12">
      <Reader {...props} />
    </div>
  );
}
