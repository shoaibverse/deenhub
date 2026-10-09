import type { Metadata } from "next";
import Link from "next/link";
import { QuranSearchForm } from "@/components/quran/search-form";
import { EmptyState, ErrorState, Note, SectionHeading } from "@/components/ui/primitives";
import { editionName, QURAN_SOURCES, searchQuran, searchSurahNames } from "@/lib/quran/service";
import { DEFAULT_PREFERENCES } from "@/lib/preferences";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quran search",
  description: "Search the Quran by surah, keyword or translation.",
  alternates: { canonical: "/quran/search" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function QuranSearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = (first(params.q) ?? "").trim();
  const edition = first(params.edition) ?? DEFAULT_PREFERENCES.translationEdition;
  const scope = first(params.scope) ?? "translation";

  const surahMatches = query.length >= 2 ? await searchSurahNames(query) : [];
  let ayahMatches: Awaited<ReturnType<typeof searchQuran>> | null = null;
  let failed = false;

  if (query.length >= 2 && scope !== "surah") {
    try {
      ayahMatches = await searchQuran(query, edition);
    } catch {
      failed = true;
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Quran search"
        title="Find a surah, a word or a passage"
        description={`Translation search uses the ${editionName(edition)} edition from ${QURAN_SOURCES.name}.`}
      />

      <div className="mt-8">
        <QuranSearchForm initialQuery={query} edition={edition} scope={scope} />
      </div>

      {query.length < 2 ? (
        <div className="mt-10">
          <EmptyState
            title="Enter at least two letters"
            description="Search surah names in English or Arabic, or search the translation text for a word or phrase."
          />
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          <section>
            <h2 className="font-display text-lg">Surahs</h2>
            {surahMatches.length === 0 ? (
              <p className="mt-3 text-[0.875rem] text-mute">No surah name matches this search.</p>
            ) : (
              <ul className="mt-3 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
                {surahMatches.map((surah) => (
                  <li key={surah.number}>
                    <Link
                      href={`/quran/${surah.number}`}
                      className="flex items-baseline gap-3 py-3 hover:bg-sand/50 dark:hover:bg-night-soft/60"
                    >
                      <span className="ayah-number w-8 text-center text-[0.8125rem] tabular-nums">
                        {surah.number}
                      </span>
                      <span className="font-display text-[1.0625rem]">{surah.englishName}</span>
                      <span className="text-[0.75rem] text-mute">
                        {surah.englishNameTranslation} · {surah.numberOfAyahs} ayahs
                      </span>
                      <span className="font-arabic ms-auto text-[1.125rem]" lang="ar">
                        {surah.name.replace(/^سُورَةُ\s*/, "")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {scope !== "surah" ? (
            <section>
              <h2 className="font-display text-lg">Translation matches</h2>
              {failed ? (
                <div className="mt-3">
                  <ErrorState
                    title="We couldn't load the search results right now."
                    description="The Quran source did not respond. Please try again in a moment."
                  />
                </div>
              ) : ayahMatches && ayahMatches.length > 0 ? (
                <>
                  <p className="mt-2 text-[0.8125rem] text-mute" aria-live="polite">
                    {ayahMatches.length} shown for “{query}”.
                  </p>
                  <ul className="mt-4 space-y-5">
                    {ayahMatches.map((match) => (
                      <li key={`${match.number}-${match.numberInSurah}`}>
                        <Link
                          href={`/quran/${match.surahNumber}#ayah-${match.numberInSurah}`}
                          className="block rounded-[12px] border border-[color:var(--line)] p-4 transition-colors hover:border-emerald/40"
                        >
                          <p className="flex flex-wrap items-baseline gap-2">
                            <span className="font-display text-[0.9375rem]">
                              {match.surahEnglishName} {match.surahNumber}:{match.numberInSurah}
                            </span>
                            <span className="font-arabic text-[1rem] text-mute" lang="ar">
                              {match.surahName.replace(/^سُورَةُ\s*/, "")}
                            </span>
                          </p>
                          <p className="mt-2 text-[0.9375rem] leading-relaxed">{match.text}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-3 text-[0.875rem] text-mute">
                  No translation matches for “{query}”. Try another word or a different edition.
                </p>
              )}
            </section>
          ) : null}
        </div>
      )}

      <div className="mt-12">
        <Note>
          Search runs against the {editionName(edition)} translation. Searching the Arabic text of
          the Quran is not supported by the configured source, so no Arabic results are shown.
        </Note>
      </div>
    </div>
  );
}
