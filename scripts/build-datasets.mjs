/**
 * Vendoring script for NoorHub content datasets.
 *
 * NoorHub never fabricates religious content. Every dataset below is downloaded
 * from an established, attributed source and stored verbatim (trimmed for size)
 * together with its attribution record in src/data/sources.json.
 *
 * Run with: node scripts/build-datasets.mjs
 */
import { writeFile, mkdir } from "node:fs/promises";

const DATA_DIR = "src/data";
await mkdir(DATA_DIR, { recursive: true });

/* ------------------------------------------------------------------ */
/* 1. Hisn al-Muslim (OpenDua edition) — duas with references          */
/* ------------------------------------------------------------------ */
const opendua = await fetch("https://opendua.org/v0.0.4/catalogue.json").then(
  (r) => {
    if (!r.ok) throw new Error(`OpenDua catalogue failed: ${r.status}`);
    return r.json();
  },
);

const chapterById = new Map(
  opendua.chapters.map((c) => [c.id, { number: c.number, title: c.title }]),
);
const tagById = new Map(opendua.tags.map((t) => [t.id, t.title]));

const duas = opendua.entries.map((entry) => {
  const steps = entry.variations?.[0]?.steps ?? [];
  const items = steps.flatMap((step) => step.items ?? []);
  return {
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    chapter: chapterById.get(entry.chapterId) ?? null,
    sourceReference: entry.sourceReference ?? null,
    tags: entry.tags ?? [],
    references: entry.references ?? [],
    lines: items.map((item) => {
      const recordings = steps
        .flatMap((step) => step.recordings ?? [])
        .map((r) => r.url);
      return {
        arabic: item.dua.arabic,
        transliteration: item.dua.transliteration ?? null,
        translation: item.dua.translation ?? null,
        references: item.dua.references ?? [],
        audio: recordings.length > 0 ? recordings[0] : null,
      };
    }),
  };
});

const duaDataset = {
  dataVersion: opendua.dataVersion,
  released: opendua.released,
  collection: opendua.collections[0],
  reciter: opendua.reciters?.[0]?.name ?? null,
  tags: opendua.tags.map((t) => ({ id: t.id, title: t.title })),
  entries: duas,
};

/* ------------------------------------------------------------------ */
/* 2. Quran structure (surah + juz metadata) from AlQuran Cloud        */
/* ------------------------------------------------------------------ */
const quranResponse = await fetch("https://api.alquran.cloud/v1/meta").then(
  (r) => {
    if (!r.ok) throw new Error(`AlQuran Cloud meta failed: ${r.status}`);
    return r.json();
  },
);

const surahs = quranResponse.data.surahs.references.map((s) => ({
  number: s.number,
  name: s.name,
  englishName: s.englishName,
  englishNameTranslation: s.englishNameTranslation,
  numberOfAyahs: s.numberOfAyahs,
  revelationType: s.revelationType,
}));

const juz = quranResponse.data.juzs.references.map((j) => ({
  number: j.number,
  surah: j.surah?.number ?? null,
  ayah: j.ayah?.numberInSurah ?? null,
}));

/* ------------------------------------------------------------------ */
/* 3. Attribution manifest                                             */
/* ------------------------------------------------------------------ */
const sources = {
  quran: {
    name: "AlQuran Cloud",
    url: "https://alquran.cloud",
    api: "https://api.alquran.cloud/v1",
    textSource: "Tanzil Quran text",
    translations: {
      "en.sahih": "Saheeh International",
      "en.pickthall": "Marmaduke Pickthall",
      "en.yusufali": "Abdullah Yusuf Ali",
      "en.hilali": "Hilali & Khan",
      "ur.jalandhry": "Fateh Muhammad Jalandhry",
      "id.indonesian": "Bahasa Indonesia",
      "fr.hamidullah": "Muhammad Hamidullah",
      "tr.diyanet": "Diyanet İşleri Başkanlığı",
      "bn.bengali": "Muhiuddin Khan",
      "ru.kuliev": "Elmir Kuliev",
    },
    audio: {
      provider: "Islamic Network",
      url: "https://cdn.islamic.network/quran/audio",
      reciters: {
        "ar.alafasy": "Mishary Alafasy",
        "ar.abdulbasitmurattal": "Abdul Basit (Murattal)",
        "ar.husary": "Mahmoud Khalil Al-Husary",
        "ar.minshawi": "Mohamed Minshawi",
        "ar.muhammadayyoub": "Muhammad Ayyoub",
      },
    },
  },
  hadith: {
    name: "Hadith API (fawazahmed0/hadith-api)",
    url: "https://github.com/fawazahmed0/hadith-api",
    api: "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1",
    collections: {
      bukhari: "Sahih al-Bukhari",
      muslim: "Sahih Muslim",
      abudawud: "Sunan Abu Dawud",
      tirmidhi: "Jami' at-Tirmidhi",
      nasai: "Sunan an-Nasa'i",
      ibnmajah: "Sunan Ibn Majah",
    },
    note: "Arabic text and English and Urdu translations are provided by the upstream dataset and matched by hadith number. Translator attribution is not included in the upstream Urdu edition metadata. Always verify wording with a qualified scholar or the original Arabic text.",
  },
  duas: {
    name: `Hisn al-Muslim — OpenDua edition (data v${duaDataset.dataVersion})`,
    url: "https://opendua.org",
    book: "Hisn al-Muslim (Fortress of the Muslim)",
    author: "Said ibn Ali ibn Wahf Al-Qahtani",
    licence: opendua.licences?.data?.url ?? "https://opendua.org/licence/data",
  },
  tafsir: {
    name: "Quran Foundation Content API",
    url: "https://quran.com",
    catalogue: "https://api.quran.com/api/v4/resources/tafsirs",
    documentation:
      "https://api-docs.quran.foundation/docs/content_apis_versioned/4.0.0/tafsir/",
    note: "Tafsir passages are displayed verbatim from their selected edition and are never generated or paraphrased by NoorHub.",
  },
  prayerTimes: {
    name: "Adhan.js",
    url: "https://github.com/batoulapps/adhan-js",
    note: "Astronomical prayer time calculation performed locally in the browser. No location data is sent to a server.",
  },
  hijriCalendar: {
    name: "Intl.DateTimeFormat — islamic-umalqura calendar",
    note: "Tabular/Umm al-Qura conversion. Local moon sighting may differ by a day.",
  },
  nisab: {
    name: "Gold API",
    url: "https://gold-api.com",
    note: "Spot gold (XAU) and silver (XAG) prices used for nisab estimation.",
  },
};

await writeFile(
  `${DATA_DIR}/duas.json`,
  JSON.stringify(duaDataset, null, 0),
  "utf8",
);
await writeFile(
  `${DATA_DIR}/quran-meta.json`,
  JSON.stringify({ surahs, juz }, null, 0),
  "utf8",
);
await writeFile(
  `${DATA_DIR}/sources.json`,
  JSON.stringify(sources, null, 2),
  "utf8",
);

console.log(
  `Vendored ${duaDataset.entries.length} dua entries, ${surahs.length} surahs, ${juz.length} juz.`,
);
console.log("Tag list:", [...tagById.keys()].slice(0, 40).join(", "));
