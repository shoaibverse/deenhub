import quranMeta from "@/data/quran-meta.json";
import rawSources from "@/data/sources.json";
import type { Ayah, JuzMeta, QuranSearchMatch, SurahContent, SurahMeta } from "@/types";

const API_BASE = process.env.QURAN_API_URL ?? "https://api.alquran.cloud/v1";

export const QURAN_SOURCES = rawSources.quran;

export const TRANSLATIONS = Object.entries(
  QURAN_SOURCES.translations as Record<string, string>,
).map(([id, name]) => ({ id, name }));

export const RECITERS = Object.entries(
  QURAN_SOURCES.audio.reciters as Record<string, string>,
).map(([id, name]) => ({ id, name }));

const surahs = quranMeta.surahs as unknown as SurahMeta[];
const juzList = quranMeta.juz as unknown as JuzMeta[];

export function getSurahs(): SurahMeta[] {
  return surahs;
}

export function getSurahMeta(number: number): SurahMeta | null {
  return surahs.find((s) => s.number === number) ?? null;
}

export function getJuzList(): JuzMeta[] {
  return juzList;
}

export function getJuzSurahRange(juzNumber: number) {
  const start = juzList.find((j) => j.number === juzNumber);
  const end = juzList.find((j) => j.number === juzNumber + 1);
  if (!start) return null;
  return {
    startSurah: start.surah,
    startAyah: start.ayah,
    endSurah: end?.surah ?? 114,
    endAyah: end?.ayah ?? 6,
  };
}

export function audioUrlFor(reciter: string, globalAyahNumber: number) {
  return `${QURAN_SOURCES.audio.url}/128/${reciter}/${globalAyahNumber}.mp3`;
}

export function surahAudioUrl(reciter: string, surahNumber: number) {
  return `${QURAN_SOURCES.audio.url}-surah/128/${reciter}/${surahNumber}.mp3`;
}

type ApiAyah = {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  sajda: boolean | object;
};

type ApiEditionResponse = {
  code: number;
  status: string;
  data: Array<{
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
    ayahs: ApiAyah[];
  }>;
};

/**
 * Stripping the Basmala: the Uthmani edition prepends it to the first ayah of
 * every surah except Surah At-Tawbah (9). We derive the exact prefix from
 * Surah Al-Fatiha at runtime rather than hard-coding Arabic text.
 */
let bismillahPrefix: string | null = null;
async function getBismillahPrefix(): Promise<string | null> {
  if (bismillahPrefix) return bismillahPrefix;
  try {
    const fatiha = await getEditions(1, ["quran-uthmani"]);
    const text = fatiha?.[0]?.ayahs?.[0]?.text ?? "";
    const marker = "ٱلرَّحِيمِ";
    const index = text.indexOf(marker);
    if (index > 0) {
      bismillahPrefix = text.slice(0, index + marker.length).trim();
    }
  } catch {
    bismillahPrefix = null;
  }
  return bismillahPrefix;
}

async function getEditions(surahNumber: number, editions: string[]) {
  const url = `${API_BASE}/surah/${surahNumber}/editions/${editions.join(",")}`;
  const response = await fetch(url, { next: { revalidate: 604800 } });
  if (!response.ok) throw new Error(`Quran source responded with ${response.status}`);
  const payload = (await response.json()) as ApiEditionResponse;
  if (payload.code !== 200 || !Array.isArray(payload.data)) {
    throw new Error("Quran source returned an unexpected response");
  }
  return payload.data;
}

export async function getSurahContent(
  surahNumber: number,
  translationEdition: string,
  reciter: string,
): Promise<SurahContent> {
  if (surahNumber < 1 || surahNumber > 114) throw new Error("Surah not found");
  const arabicEdition = "quran-uthmani";
  const editions = translationEdition
    ? [arabicEdition, translationEdition]
    : [arabicEdition];

  const [data, bismillah] = await Promise.all([
    getEditions(surahNumber, editions),
    getBismillahPrefix(),
  ]);

  const arabic = data.find((item) => item.ayahs) as (typeof data)[number] | undefined;
  const arabicData = data[0];
  const translationData = data[1];

  if (!arabicData) throw new Error("Quran text unavailable");

  const shouldStrip = surahNumber !== 1 && surahNumber !== 9 && Boolean(bismillah);

  const ayahs: Ayah[] = (arabicData.ayahs ?? []).map((ayah, index) => {
    let text = ayah.text;
    if (shouldStrip && ayah.numberInSurah === 1 && bismillah && text.startsWith(bismillah)) {
      text = text.slice(bismillah.length).trim();
    }
    const translation = translationData?.ayahs?.[index]?.text ?? null;
    return {
      key: `${surahNumber}:${ayah.numberInSurah}`,
      number: ayah.number,
      numberInSurah: ayah.numberInSurah,
      juz: ayah.juz,
      page: ayah.page,
      sajda: Boolean(ayah.sajda),
      arabic: text,
      translation,
      audioUrl: audioUrlFor(reciter, ayah.number),
    };
  });

  void arabic;

  return {
    surah: {
      number: arabicData.number,
      name: arabicData.name,
      englishName: arabicData.englishName,
      englishNameTranslation: arabicData.englishNameTranslation,
      numberOfAyahs: arabicData.numberOfAyahs,
      revelationType: arabicData.revelationType,
    },
    edition: translationEdition,
    bismillahPrefix: surahNumber !== 1 && surahNumber !== 9,
    ayahs,
    sourceNote: `Uthmani text and ${editionName(translationEdition)} translation via ${QURAN_SOURCES.name}.`,
  };
}

export function editionName(edition: string) {
  return (QURAN_SOURCES.translations as Record<string, string>)[edition] ?? edition;
}

type SearchResponse = {
  code: number;
  data: { count: number; matches: Array<Record<string, unknown>> };
};

export async function searchQuran(
  query: string,
  edition: string,
  limit = 40,
): Promise<QuranSearchMatch[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const url = `${API_BASE}/search/${encodeURIComponent(trimmed)}/all/${edition}`;
  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error(`Search source responded with ${response.status}`);
  const payload = (await response.json()) as SearchResponse;
  if (payload.code !== 200 || !payload.data) return [];
  return (payload.data.matches ?? []).slice(0, limit).map((match) => ({
    number: Number(match.number),
    text: String(match.text ?? ""),
    surahNumber: Number((match.surah as Record<string, unknown>)?.number ?? 0),
    surahName: String((match.surah as Record<string, unknown>)?.name ?? ""),
    surahEnglishName: String((match.surah as Record<string, unknown>)?.englishName ?? ""),
    numberInSurah: Number(match.numberInSurah ?? 0),
    edition: String(match.edition ?? edition),
  }));
}

export async function searchSurahNames(query: string): Promise<SurahMeta[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];
  return surahs
    .filter(
      (s) =>
        s.englishName.toLowerCase().includes(trimmed) ||
        s.englishNameTranslation.toLowerCase().includes(trimmed) ||
        s.name.includes(query.trim()) ||
        String(s.number) === trimmed,
    )
    .slice(0, 12);
}
