/**
 * Builds the hadith browse index from the upstream collection metadata.
 *
 * Categories in the NoorHub hadith library are *derived from real book
 * sections* in the source collections. Nothing is invented: every entry keeps
 * the collection name, section number and section title from the source.
 *
 * Run with: node scripts/build-hadith-index.mjs
 */
import { writeFile } from "node:fs/promises";

const API = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";

const info = await fetch(`${API}/info.json`).then((r) => r.json());

const categoryDefs = [
  { id: "faith", label: "Faith", patterns: [/faith/i, /belief/i] },
  { id: "prayer", label: "Prayer", patterns: [/prayer/i, /salat/i, /mosque/i] },
  { id: "knowledge", label: "Knowledge", patterns: [/knowledge/i, /virtues of the qur/i] },
  { id: "character", label: "Character", patterns: [/character/i, /conduct/i, /virtues/i] },
  { id: "charity", label: "Charity", patterns: [/zakat/i, /charity/i, /al-ms/i] },
  { id: "fasting", label: "Fasting", patterns: [/fasting/i, /ramadan/i] },
  { id: "patience", label: "Patience", patterns: [/patience/i, /steadfast/i, /tender/i] },
  { id: "gratitude", label: "Gratitude", patterns: [/gratitude/i, /thank/i, /praise/i] },
  { id: "family", label: "Family", patterns: [/marriage/i, /family/i, /kinship/i, /divorce/i] },
  { id: "manners", label: "Good manners", patterns: [/manners/i, /etiquette/i, /adab/i] },
];

const collectionOrder = ["bukhari", "muslim", "tirmidhi", "abudawud", "nasai", "ibnmajah"];
const collectionNames = Object.fromEntries(
  Object.entries(info).map(([key, value]) => [key, value.metadata.name]),
);

const index = [];

for (const def of categoryDefs) {
  const matches = [];
  for (const collection of collectionOrder) {
    const meta = info[collection]?.metadata;
    if (!meta?.sections) continue;
    for (const [sectionNumber, title] of Object.entries(meta.sections)) {
      if (typeof title !== "string" || title.trim() === "") continue;
      if (!def.patterns.some((pattern) => pattern.test(title))) continue;
      matches.push({
        collection,
        collectionName: collectionNames[collection],
        section: Number(sectionNumber),
        sectionTitle: title.trim(),
      });
    }
  }
  // Prefer the two most authoritative collections, then the first sections.
  const ranked = matches
    .sort((a, b) => {
      const rank = (c) => collectionOrder.indexOf(c);
      return rank(a.collection) - rank(b.collection) || a.section - b.section;
    })
    .slice(0, 6);

  for (const match of ranked) {
    index.push({ categoryId: def.id, categoryLabel: def.label, ...match });
  }
}

const hadithCollections = collectionOrder
  .filter((c) => Boolean(info[c]))
  .map((c) => ({
    id: c,
    name: collectionNames[c],
    sectionCount: Object.values(info[c].metadata.sections ?? {}).filter(
      (t) => typeof t === "string" && t.trim() !== "",
    ).length,
    sections: Object.entries(info[c].metadata.sections ?? {})
      .map(([number, title]) => ({ number: Number(number), title: String(title).trim() }))
      .filter((section) => section.title.length > 0 && section.number > 0)
      .sort((a, b) => a.number - b.number),
  }));

await writeFile(
  "src/data/hadith-index.json",
  JSON.stringify(
    { collections: hadithCollections, categories: index },
    null,
    0,
  ),
  "utf8",
);

const grouped = index.reduce((acc, item) => {
  acc[item.categoryId] = (acc[item.categoryId] ?? 0) + 1;
  return acc;
}, {});
console.log("Hadith sections indexed per category:", grouped);
console.log("Collections:", hadithCollections.map((c) => `${c.id}(${c.sectionCount})`).join(", "));
