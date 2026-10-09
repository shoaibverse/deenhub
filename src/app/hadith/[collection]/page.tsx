import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorState, Note, SectionHeading } from "@/components/ui/primitives";
import {
  getCategories,
  getCategorySections,
  getCollectionName,
  getCollectionSections,
  getCollections,
  HADITH_SOURCES,
  isValidCollection,
} from "@/lib/hadith/service";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ collection: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { collection } = await params;
  if (!isValidCollection(collection)) return { title: "Hadith" };
  return {
    title: getCollectionName(collection),
    description: `Browse the book sections of ${getCollectionName(collection)}.`,
    alternates: { canonical: `/hadith/${collection}` },
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { collection } = await params;
  if (!isValidCollection(collection)) notFound();

  let sections: Awaited<ReturnType<typeof getCollectionSections>> | null = null;
  let failed = false;
  try {
    sections = await getCollectionSections(collection);
  } catch {
    failed = true;
  }

  const categories = getCategories();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-[0.75rem] text-mute">
        <Link href="/hadith" className="link-quiet">
          Hadith library
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{getCollectionName(collection)}</span>
      </nav>

      <div className="mt-4">
        <SectionHeading
          eyebrow="Collection"
          title={getCollectionName(collection)}
          description="Choose a book to read its hadith. Sections are listed exactly as they appear in the source."
        />
      </div>

      {failed || !sections ? (
        <div className="mt-8">
          <ErrorState
            title="We couldn't load the sections right now."
            description="The hadith source did not respond. Please try again in a moment."
          />
        </div>
      ) : (
        <ol className="mt-8 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
          {sections.map((section) => {
            const theme = categories.find((category) =>
              getCategorySections(category.id).some(
                (row) => row.collection === collection && row.section === section.number,
              ),
            );
            return (
              <li key={section.number}>
                <Link
                  href={`/hadith/${collection}/${section.number}`}
                  className="flex items-baseline gap-4 py-3.5 hover:bg-sand/50 dark:hover:bg-night-soft/60"
                >
                  <span className="ayah-number w-10 shrink-0 text-center text-[0.8125rem] tabular-nums">
                    {section.number}
                  </span>
                  <span className="flex-1 text-[0.9375rem]">{section.title}</span>
                  {theme ? (
                    <span className="hidden shrink-0 text-[0.6875rem] uppercase tracking-[0.12em] text-mute sm:block">
                      {theme.label}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-10">
        <Note>
          Text from {HADITH_SOURCES.name}. Arabic text and Urdu and English translations are matched
          by hadith number. Where an edition has no text for an entry, NoorHub says it is unavailable
          rather than substituting anything. The upstream Urdu edition metadata does not name its
          translator.
        </Note>
      </div>
    </div>
  );
}


