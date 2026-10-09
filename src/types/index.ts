export type ThemeMode = "light" | "dark" | "system";

export type SessionUser = {
  id: string;
  email: string;
  displayName: string | null;
};

export type Preferences = {
  language: string;
  theme: ThemeMode;
  arabicFontSize: number;
  translationEdition: string;
  showTranslation: boolean;
  showTransliteration: boolean;
  reciter: string;
  prayerMethod: string;
  asrJuristic: "standard" | "hanafi";
  latitude: number | null;
  longitude: number | null;
  locationLabel: string | null;
  notifyPrayer: boolean;
};

export type SurahMeta = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan" | string;
};

export type JuzMeta = { number: number; surah: number | null; ayah: number | null };

export type Ayah = {
  key: string;
  number: number;
  numberInSurah: number;
  juz: number;
  page: number;
  sajda: boolean;
  arabic: string;
  translation: string | null;
  audioUrl: string | null;
};

export type SurahContent = {
  surah: SurahMeta;
  edition: string;
  bismillahPrefix: boolean;
  ayahs: Ayah[];
  sourceNote: string;
};

export type QuranSearchMatch = {
  number: number;
  text: string;
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  numberInSurah: number;
  edition: string;
};

export type TafsirLanguage = "urdu" | "english";

export type TafsirResource = {
  id: number;
  slug: string;
  name: string;
  displayName: string;
  author: string;
  language: TafsirLanguage;
  direction: "rtl" | "ltr";
};

export type TafsirContent = {
  resource: TafsirResource;
  requestedVerseKey: string;
  coveredVerseKeys: string[];
  html: string;
  text: string;
  sourceUrl: string;
};

export type HadithCollectionId =
  | "bukhari"
  | "muslim"
  | "abudawud"
  | "tirmidhi"
  | "nasai"
  | "ibnmajah";

export type HadithSectionRef = {
  id: string;
  collection: HadithCollectionId;
  collectionName: string;
  section: number;
  sectionTitle: string;
  categoryId: string;
};

export type HadithItem = {
  id: string;
  collection: HadithCollectionId;
  collectionName: string;
  section: number;
  sectionTitle: string;
  hadithNumber: number | string;
  arabicNumber: number | string | null;
  arabic: string | null;
  urdu: string | null;
  english: string;
  grades: { name: string; grade: string }[];
  book: number | null;
  reference: string;
};

export type DuaLine = {
  arabic: string;
  transliteration: string | null;
  translation: string | null;
  references: unknown[];
  audio: string | null;
};

export type DuaEntry = {
  id: string;
  slug: string;
  title: string;
  chapter: { number: number; title: string } | null;
  sourceReference: string | null;
  tags: string[];
  references: unknown[];
  lines: DuaLine[];
};

export type DuaCategory = { id: string; title: string };

export type PrayerName =
  | "fajr"
  | "sunrise"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha";

export type ComputedPrayerTime = {
  name: PrayerName;
  label: string;
  at: string;
};

export type PrayerComputation = {
  times: ComputedPrayerTime[];
  method: string;
  methodLabel: string;
  asrJuristic: "standard" | "hanafi";
  timezoneOffsetMinutes: number;
  computedFor: string;
};

export type NextPrayerInfo = {
  name: PrayerName;
  label: string;
  at: string;
  msRemaining: number;
  current: PrayerName | null;
};

export type HijriDate = {
  year: number;
  month: number;
  day: number;
  monthName: string;
  formatted: string;
};

export type IslamicOccasion = {
  id: string;
  name: string;
  hijri: { month: number; day: number };
  note: string;
};

export type MetalPrice = {
  goldPerOunce: number | null;
  silverPerOunce: number | null;
  currency: string;
  retrievedAt: string;
  source: string;
  available: boolean;
};

export type BookmarkItem = {
  id: string;
  itemType: "quran" | "hadith" | "dua";
  itemId: string;
  title: string;
  subtitle: string | null;
  reference: string | null;
  href: string;
  snippet: string | null;
  createdAt: string;
};

export type ContentResult<T> =
  | { status: "ok"; data: T }
  | { status: "error"; message: string };
