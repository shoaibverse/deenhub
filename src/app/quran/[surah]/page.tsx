import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuranReader } from "@/components/quran/quran-reader";
import { ErrorState } from "@/components/ui/primitives";
import {
  editionName,
  getSurahContent,
  getSurahMeta,
  getSurahs,
  surahAudioUrl,
} from "@/lib/quran/service";
import { DEFAULT_PREFERENCES } from "@/lib/preferences";
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

  const editionParam = Array.isArray(translation) ? translation[0] : translation;
  const edition =
    editionParam === "" ? "" : (editionParam ?? DEFAULT_PREFERENCES.translationEdition);
  const reciter = DEFAULT_PREFERENCES.reciter;

  let content;
  try {
    content = await getSurahContent(number, edition, reciter);
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

  const surahs = getSurahs();
  const previous = number > 1 ? surahs[number - 2] : null;
  const nextSurah = number < 114 ? surahs[number] : null;

  return (
    <div className="pb-16">
      <QuranReader
        content={content}
        surahAudioUrl={surahAudioUrl(reciter, number)}
        lastReadAyah={null}
        previous={previous ? { number: previous.number, englishName: previous.englishName } : null}
        next={nextSurah ? { number: nextSurah.number, englishName: nextSurah.englishName } : null}
      />
      <p className="mx-auto mt-8 max-w-4xl px-4 text-center text-[0.6875rem] text-mute sm:px-6">
        Read on {toHijri(new Date()).formatted} · Translation:{" "}
        {edition ? editionName(edition) : "Arabic only"} · Progress is stored only in this browser.
      </p>
    </div>
  );
}

export default async function SurahPage(props: PageProps) {
  const { surah } = await props.params;
  const surahNumber = Number(surah);
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) notFound();

  return (
    <div className="py-8 sm:py-12">
      <Reader {...props} />
    </div>
  );
}
