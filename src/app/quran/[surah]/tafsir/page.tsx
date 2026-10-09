import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TafsirReader } from "@/components/quran/tafsir-reader";
import { ErrorState } from "@/components/ui/primitives";
import { getSurahContent, getSurahMeta, getSurahs } from "@/lib/quran/service";
import {
  DEFAULT_TAFSIR_ID,
  getTafsirForAyah,
  getTafsirResource,
  getTafsirResources,
} from "@/lib/tafsir/service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ surah: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { surah } = await params;
  const query = await searchParams;
  const surahNumber = Number(surah);
  const ayahNumber = Number(first(query.ayah) ?? "1");
  const resourceId = Number(first(query.edition) ?? DEFAULT_TAFSIR_ID);
  const meta = getSurahMeta(surahNumber);
  const resource = getTafsirResource(resourceId);
  if (!meta) return { title: "Quran Tafseer" };
  return {
    title: `${meta.englishName} ${surahNumber}:${ayahNumber} Tafseer`,
    description: `Read ${resource?.displayName ?? "Quran Tafseer"} for Surah ${meta.englishName}, ayah ${ayahNumber}.`,
    alternates: {
      canonical: `/quran/${surahNumber}/tafsir?ayah=${ayahNumber}&edition=${resourceId}`,
    },
  };
}

export default async function TafsirPage({ params, searchParams }: PageProps) {
  const { surah } = await params;
  const query = await searchParams;
  const surahNumber = Number(surah);
  const surahMeta = getSurahMeta(surahNumber);
  if (!surahMeta) notFound();

  const ayahNumber = Number(first(query.ayah) ?? "1");
  if (
    !Number.isInteger(ayahNumber) ||
    ayahNumber < 1 ||
    ayahNumber > surahMeta.numberOfAyahs
  ) {
    notFound();
  }

  const requestedResourceId = Number(first(query.edition) ?? DEFAULT_TAFSIR_ID);
  const resource = getTafsirResource(requestedResourceId);
  if (!resource) notFound();

  let content: Awaited<ReturnType<typeof getSurahContent>>;
  let tafsir: Awaited<ReturnType<typeof getTafsirForAyah>>;
  try {
    [content, tafsir] = await Promise.all([
      getSurahContent(surahNumber, "ur.jalandhry", "ar.alafasy"),
      getTafsirForAyah(resource.id, surahNumber, ayahNumber),
    ]);
  } catch {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-[0.75rem] text-mute">
          <Link href="/quran" className="link-quiet">
            Quran · قرآن
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href={`/quran/${surahNumber}`} className="link-quiet">
            {surahMeta.englishName}
          </Link>
          <span aria-hidden="true"> / </span>
          <span>Tafseer · تفسیر</span>
        </nav>
        <ErrorState
          title="We couldn't load this Tafseer right now."
          description="The verified Tafseer source did not respond, or this edition has no passage for the selected ayah. Nothing has been substituted in its place. Please try again."
        />
      </div>
    );
  }

  const ayah = content.ayahs.find((item) => item.numberInSurah === ayahNumber);
  if (!ayah) notFound();

  const surahs = getSurahs();
  const previous =
    ayahNumber > 1
      ? {
          surah: surahNumber,
          ayah: ayahNumber - 1,
          label: `${surahMeta.englishName} ${surahNumber}:${ayahNumber - 1}`,
        }
      : surahNumber > 1
        ? {
            surah: surahNumber - 1,
            ayah: surahs[surahNumber - 2].numberOfAyahs,
            label: `${surahs[surahNumber - 2].englishName} ${surahNumber - 1}:${surahs[surahNumber - 2].numberOfAyahs}`,
          }
        : null;
  const next =
    ayahNumber < surahMeta.numberOfAyahs
      ? {
          surah: surahNumber,
          ayah: ayahNumber + 1,
          label: `${surahMeta.englishName} ${surahNumber}:${ayahNumber + 1}`,
        }
      : surahNumber < 114
        ? {
            surah: surahNumber + 1,
            ayah: 1,
            label: `${surahs[surahNumber].englishName} ${surahNumber + 1}:1`,
          }
        : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-[0.75rem] text-mute">
        <Link href="/quran" className="link-quiet">
          Quran · قرآن
        </Link>
        <span aria-hidden="true"> / </span>
        <Link href={`/quran/${surahNumber}`} className="link-quiet">
          {surahMeta.englishName} · {surahMeta.name.replace(/^سُورَةُ\s*/, "")}
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Tafseer · تفسیر</span>
      </nav>

      <TafsirReader
        surah={surahMeta}
        ayah={ayah}
        tafsir={tafsir}
        resources={getTafsirResources()}
        previous={previous}
        next={next}
      />
    </div>
  );
}
