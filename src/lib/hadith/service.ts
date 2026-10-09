import hadithIndex from "@/data/hadith-index.json";
import rawSources from "@/data/sources.json";
import type {
  HadithCollectionId,
  HadithItem,
  HadithSectionRef,
} from "@/types";

const API_BASE = process.env.HADITH_API_URL ?? rawSources.hadith.api;

export const HADITH_SOURCES = rawSources.hadith;

type IndexFile = {
  collections: Array<{
    id: string;
    name: string;
    sectionCount: number;
    sections: Array<{ number: number; title: string }>;
  }>;
  categories: Array<{
    categoryId: string;
    categoryLabel: string;
    collection: string;
    collectionName: string;
    section: number;
    sectionTitle: string;
  }>;
};

const index = hadithIndex as unknown as IndexFile;

export type HadithCollection = { id: string; name: string; sectionCount: number };

export function getCollections(): HadithCollection[] {
  return index.collections;
}

export function getCollectionName(collection: string) {
  return index.collections.find((c) => c.id === collection)?.name ?? collection;
}

export function getCategories(): Array<{ id: string; label: string; sections: number }> {
  const map = new Map<string, { id: string; label: string; sections: Set<string> }>();
  for (const row of index.categories) {
    const key = `${row.collection}:${row.section}`;
    if (!map.has(row.categoryId)) {
      map.set(row.categoryId, { id: row.categoryId, label: row.categoryLabel, sections: new Set() });
    }
    map.get(row.categoryId)!.sections.add(key);
  }
  return [...map.values()].map((c) => ({ id: c.id, label: c.label, sections: c.sections.size }));
}

export function getCategorySections(categoryId: string): HadithSectionRef[] {
  return index.categories
    .filter((row) => row.categoryId === categoryId)
    .map((row) => ({
      id: `${row.collection}-${row.section}`,
      collection: row.collection as HadithCollectionId,
      collectionName: row.collectionName,
      section: row.section,
      sectionTitle: row.sectionTitle,
      categoryId: row.categoryId,
    }));
}

export function findSection(
  collection: string,
  section: number,
): HadithSectionRef | null {
  const row = index.categories.find(
    (item) => item.collection === collection && item.section === section,
  );
  if (row) {
    return {
      id: `${row.collection}-${row.section}`,
      collection: row.collection as HadithCollectionId,
      collectionName: row.collectionName,
      section: row.section,
      sectionTitle: row.sectionTitle,
      categoryId: row.categoryId,
    };
  }
  return null;
}

export function isValidCollection(collection: string): collection is HadithCollectionId {
  return index.collections.some((c) => c.id === collection);
}

type UpstreamHadith = {
  hadithnumber: number | string;
  arabicnumber: number | string | null;
  text: string;
  grades?: Array<{ name?: string; grade?: string }>;
  reference?: { book?: number | string; hadith?: number | string };
};

type UpstreamSection = {
  metadata: {
    name: string;
    section?: Record<string, string>;
    section_detail?: Record<string, Record<string, number>>;
  };
  hadiths: UpstreamHadith[];
};

async function fetchSection(
  collection: string,
  section: number,
  language: "eng" | "ara" | "urd",
) {
  const url = `${API_BASE}/editions/${language}-${collection}/sections/${section}.json`;
  const response = await fetch(url, { next: { revalidate: 604800 } });
  if (!response.ok) throw new Error(`Hadith source responded with ${response.status}`);
  const payload = (await response.json()) as UpstreamSection;
  return payload;
}

/**
 * Book (section) titles for one collection. These are stored locally, taken
 * from the upstream collection metadata, so browsing a collection never
 * requires downloading the source's multi-megabyte metadata file.
 */
export function getCollectionSections(collection: string) {
  const record = index.collections.find((entry) => entry.id === collection);
  if (!record) throw new Error("Collection metadata unavailable");
  return record.sections;
}

export async function getSectionHadiths(
  collection: HadithCollectionId,
  section: number,
): Promise<HadithItem[]> {
  const [english, arabic, urdu] = await Promise.all([
    fetchSection(collection, section, "eng"),
    fetchSection(collection, section, "ara").catch(() => null),
    fetchSection(collection, section, "urd").catch(() => null),
  ]);

  const sectionTitle =
    Object.values(english.metadata.section ?? {})[0] ?? `Section ${section}`;
  const collectionName = english.metadata.name ?? getCollectionName(collection);

  const arabicByNumber = new Map<string, string>();
  for (const hadith of arabic?.hadiths ?? []) {
    arabicByNumber.set(String(hadith.hadithnumber), hadith.text);
  }

  const urduByNumber = new Map<string, string>();
  for (const hadith of urdu?.hadiths ?? []) {
    urduByNumber.set(String(hadith.hadithnumber), hadith.text);
  }

  return (english.hadiths ?? []).map((hadith) => ({
    id: `${collection}-${section}-${hadith.hadithnumber}`,
    collection,
    collectionName,
    section,
    sectionTitle,
    hadithNumber: hadith.hadithnumber,
    arabicNumber: hadith.arabicnumber ?? null,
    arabic: arabicByNumber.get(String(hadith.hadithnumber)) ?? null,
    urdu: urduByNumber.get(String(hadith.hadithnumber)) ?? null,
    english: hadith.text ?? "",
    grades: (hadith.grades ?? [])
      .filter((g) => g?.name && g?.grade)
      .map((g) => ({ name: String(g.name), grade: String(g.grade) })),
    book: hadith.reference?.book != null ? Number(hadith.reference.book) : null,
    reference: `${collectionName}, Book ${hadith.reference?.book ?? section}, Hadith ${hadith.reference?.hadith ?? hadith.hadithnumber}`,
  }));
}

export function hadithHref(item: Pick<HadithItem, "collection" | "section" | "hadithNumber">) {
  return `/hadith/${item.collection}/${item.section}#hadith-${item.hadithNumber}`;
}
