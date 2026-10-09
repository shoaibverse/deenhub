import { NextResponse } from "next/server";
import { searchQuran, searchSurahNames } from "@/lib/quran/service";
import { getDuas } from "@/lib/dua/service";
import { DEFAULT_PREFERENCES } from "@/lib/preferences";

export const dynamic = "force-dynamic";

type Result = {
  kind: "surah" | "ayah" | "dua";
  title: string;
  subtitle?: string | null;
  snippet?: string | null;
  href: string;
};

const MAX_PER_KIND = 6;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();
  const scope = url.searchParams.get("scope") ?? "all";
  const edition = url.searchParams.get("edition") ?? DEFAULT_PREFERENCES.translationEdition;

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results: Result[] = [];

  if (scope === "all" || scope === "quran") {
    try {
      const surahs = await searchSurahNames(query);
      for (const surah of surahs.slice(0, MAX_PER_KIND)) {
        results.push({
          kind: "surah",
          title: `${surah.number}. ${surah.englishName} — ${surah.englishNameTranslation}`,
          subtitle: `${surah.numberOfAyahs} ayahs · ${surah.revelationType}`,
          snippet: surah.name,
          href: `/quran/${surah.number}`,
        });
      }
    } catch {
      /* surah search is local and cannot fail */
    }

    try {
      const matches = await searchQuran(query, edition, MAX_PER_KIND);
      for (const match of matches) {
        results.push({
          kind: "ayah",
          title: `${match.surahEnglishName} ${match.surahNumber}:${match.numberInSurah}`,
          subtitle: match.surahName,
          snippet: match.text,
          href: `/quran/${match.surahNumber}#ayah-${match.numberInSurah}`,
        });
      }
    } catch {
      results.push({
        kind: "ayah",
        title: "Quran search is unavailable",
        subtitle: "The Quran source did not respond.",
        snippet: null,
        href: "/quran/search",
      });
    }
  }

  if (scope === "all" || scope === "duas") {
    const { entries } = getDuas({ search: query, limit: MAX_PER_KIND });
    for (const entry of entries) {
      results.push({
        kind: "dua",
        title: entry.title,
        subtitle: entry.chapter?.title ?? null,
        snippet: entry.lines[0]?.translation ?? null,
        href: `/duas?entry=${entry.id}`,
      });
    }
  }

  return NextResponse.json({ results: results.slice(0, 20) });
}
