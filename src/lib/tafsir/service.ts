import sanitizeHtml from "sanitize-html";
import type { TafsirContent, TafsirResource } from "@/types";

const API_BASE =
  process.env.TAFSIR_API_URL ?? "https://api.quran.com/api/v4";

/**
 * Verified Tafsir catalogue from Quran Foundation's content API.
 *
 * IDs, slugs, names, authors and languages are returned by:
 *   GET https://api.quran.com/api/v4/resources/tafsirs
 *
 * Only resources actually present in that catalogue are exposed here. NoorHub
 * never generates, translates or paraphrases Tafsir text.
 */
export const TAFSIR_RESOURCES: TafsirResource[] = [
  {
    id: 160,
    slug: "tafseer-ibn-e-kaseer-urdu",
    name: "Tafsir Ibn Kathir",
    displayName: "تفسیر ابنِ کثیر — اردو",
    author: "Hafiz Ibn Kathir",
    language: "urdu",
    direction: "rtl",
  },
  {
    id: 159,
    slug: "tafsir-bayan-ul-quran",
    name: "Bayan ul Quran",
    displayName: "تفسیر بیان القرآن — اردو",
    author: "Dr. Israr Ahmad",
    language: "urdu",
    direction: "rtl",
  },
  {
    id: 157,
    slug: "tafsir-fe-zalul-quran-syed-qatab",
    name: "Fi Zilal al-Quran",
    displayName: "فی ظلال القرآن — اردو",
    author: "Sayyid Ibrahim Qutb",
    language: "urdu",
    direction: "rtl",
  },
  {
    id: 818,
    slug: "tazkiru-quran-ur",
    name: "Tazkir ul Quran",
    displayName: "تذکیر القرآن — اردو",
    author: "Maulana Wahid Uddin Khan",
    language: "urdu",
    direction: "rtl",
  },
  {
    id: 168,
    slug: "en-tafsir-maarif-ul-quran",
    name: "Ma'arif al-Qur'an",
    displayName: "Ma'arif al-Qur'an — English",
    author: "Mufti Muhammad Shafi",
    language: "english",
    direction: "ltr",
  },
  {
    id: 169,
    slug: "en-tafisr-ibn-kathir",
    name: "Ibn Kathir (Abridged)",
    displayName: "Ibn Kathir (Abridged) — English",
    author: "Hafiz Ibn Kathir",
    language: "english",
    direction: "ltr",
  },
];

export const DEFAULT_TAFSIR_ID = 160;

export const TAFSIR_SOURCE = {
  name: "Quran Foundation Content API",
  site: "Quran.com",
  catalogueUrl: "https://api.quran.com/api/v4/resources/tafsirs",
  documentationUrl:
    "https://api-docs.quran.foundation/docs/content_apis_versioned/4.0.0/tafsir/",
  note:
    "Tafsir passages are displayed verbatim from the selected edition. Some scholars discuss a group of ayahs in one passage, so the same commentary may appear for each ayah in that range.",
} as const;

export function getTafsirResource(id: number): TafsirResource | null {
  return TAFSIR_RESOURCES.find((resource) => resource.id === id) ?? null;
}

export function getTafsirResources(language?: "urdu" | "english") {
  return language
    ? TAFSIR_RESOURCES.filter((resource) => resource.language === language)
    : TAFSIR_RESOURCES;
}

type ApiTafsirPayload = {
  tafsir?: {
    verses?: Record<string, { id?: number }>;
    resource_id?: number;
    resource_name?: string;
    slug?: string;
    text?: string;
  };
};

/**
 * Remove upstream styling/scripts while preserving the semantic structure of
 * the commentary. This method runs only on the server.
 */
function cleanTafsirHtml(rawHtml: string) {
  return sanitizeHtml(rawHtml, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "h1",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "blockquote",
      "span",
      "sup",
      "sub",
    ],
    allowedAttributes: {
      span: ["lang", "dir"],
      p: ["lang", "dir"],
      blockquote: ["lang", "dir"],
    },
    allowedSchemes: [],
    disallowedTagsMode: "discard",
    enforceHtmlBoundary: true,
  });
}

function plainTextFromHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getTafsirForAyah(
  resourceId: number,
  surahNumber: number,
  ayahNumber: number,
): Promise<TafsirContent> {
  const resource = getTafsirResource(resourceId);
  if (!resource) throw new Error("Tafsir edition not found");
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    throw new Error("Surah not found");
  }
  if (!Number.isInteger(ayahNumber) || ayahNumber < 1) {
    throw new Error("Ayah not found");
  }

  const verseKey = `${surahNumber}:${ayahNumber}`;
  const endpoint = `${API_BASE}/tafsirs/${resource.id}/by_ayah/${verseKey}`;
  const response = await fetch(endpoint, { next: { revalidate: 604800 } });
  if (!response.ok) {
    throw new Error(`Tafsir source responded with ${response.status}`);
  }
  const payload = (await response.json()) as ApiTafsirPayload;
  const upstream = payload.tafsir;
  const rawHtml = upstream?.text?.trim() ?? "";
  if (!rawHtml) throw new Error("Tafsir unavailable for this ayah");

  const html = cleanTafsirHtml(rawHtml);
  const coveredVerseKeys = Object.keys(upstream?.verses ?? {});

  return {
    resource,
    requestedVerseKey: verseKey,
    coveredVerseKeys:
      coveredVerseKeys.length > 0 ? coveredVerseKeys : [verseKey],
    html,
    text: plainTextFromHtml(html),
    sourceUrl: endpoint,
  };
}

export function formatCoveredVerses(keys: string[]) {
  if (keys.length === 0) return "";
  if (keys.length === 1) return keys[0];
  return `${keys[0]}–${keys[keys.length - 1]}`;
}
