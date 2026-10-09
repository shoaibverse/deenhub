import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading, Note } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { getCategories, getCollections, HADITH_SOURCES } from "@/lib/hadith/service";

export const metadata: Metadata = {
  title: "Hadith library",
  description:
    "Browse the six canonical hadith collections by their own book sections, with Arabic text and Urdu and English translations where the source provides them.",
  alternates: { canonical: "/hadith" },
};

export default function HadithLibraryPage() {
  const collections = getCollections();
  const categories = getCategories();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Hadith library"
        title="Teachings, in the order the scholars arranged them"
        description="Browse the collections by their own book sections. Every hadith keeps its collection, book and hadith number so you can check the reference."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection, index) => (
          <Reveal key={collection.id} delay={index * 0.04}>
            <Link
              href={`/hadith/${collection.id}`}
              className="surface flex h-full flex-col rounded-[14px] p-5 transition-colors hover:border-emerald/40"
            >
              <h2 className="font-display text-[1.0625rem]">{collection.name}</h2>
              <p className="mt-1.5 text-[0.8125rem] text-mute">
                {collection.sectionCount} books of sections
              </p>
            </Link>
          </Reveal>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="font-display text-xl">Browse by theme</h2>
        <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-mute">
          These themes map onto real book sections in the source collections. Where a theme is not a
          section in a collection, it is simply not listed.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <span
              key={category.id}
              className="inline-flex flex-col rounded-full border border-[color:var(--line)] px-3.5 py-2"
            >
              <span className="text-[0.875rem]">{category.label}</span>
              <span className="text-[0.6875rem] text-mute">
                {category.sections} section{category.sections === 1 ? "" : "s"}
              </span>
            </span>
          ))}
        </div>
        <p className="mt-4 text-[0.8125rem] text-mute">
          Open a collection to browse its sections, or start with{" "}
          <Link href="/hadith/bukhari" className="link-quiet">
            Sahih al-Bukhari
          </Link>
          .
        </p>
      </section>

      <div className="mt-14">
        <Note tone="gold">
          Hadith text is provided by {HADITH_SOURCES.name}. Grading is shown only where the source
          records it. {HADITH_SOURCES.note}
        </Note>
      </div>
    </div>
  );
}
