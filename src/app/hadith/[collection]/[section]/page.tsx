import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HadithCard } from "@/components/hadith/hadith-card";
import { EmptyState, ErrorState, Note } from "@/components/ui/primitives";
import {
  getCollectionName,
  getCollectionSections,
  getSectionHadiths,
  isValidCollection,
} from "@/lib/hadith/service";
import type { HadithCollectionId } from "@/types";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ collection: string; section: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { collection, section } = await params;
  if (!isValidCollection(collection)) return { title: "Hadith" };
  let title = `Book ${section}`;
  try {
    const sections = await getCollectionSections(collection);
    title = sections.find((entry) => entry.number === Number(section))?.title ?? title;
  } catch {
    /* metadata is best effort */
  }
  return {
    title: `${title} · ${getCollectionName(collection)}`,
    description: `Read the hadith of ${getCollectionName(collection)}, ${title}.`,
    alternates: { canonical: `/hadith/${collection}/${section}` },
  };
}

export default async function HadithSectionPage({ params }: PageProps) {
  const { collection, section } = await params;
  const sectionNumber = Number(section);
  if (!isValidCollection(collection) || !Number.isInteger(sectionNumber) || sectionNumber < 1) {
    notFound();
  }

  let hadiths: Awaited<ReturnType<typeof getSectionHadiths>> | null = null;
  let failed = false;
  try {
    hadiths = await getSectionHadiths(collection as HadithCollectionId, sectionNumber);
  } catch {
    failed = true;
  }

  let title = `Book ${sectionNumber}`;
  let neighbour: { previous: number | null; next: number | null } = {
    previous: null,
    next: null,
  };
  try {
    const sections = await getCollectionSections(collection);
    title = sections.find((entry) => entry.number === sectionNumber)?.title ?? title;
    const index = sections.findIndex((entry) => entry.number === sectionNumber);
    neighbour = {
      previous: index > 0 ? sections[index - 1].number : null,
      next: index >= 0 && index < sections.length - 1 ? sections[index + 1].number : null,
    };
  } catch {
    /* optional */
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-[0.75rem] text-mute">
        <Link href="/hadith" className="link-quiet">
          Hadith library
        </Link>
        <span aria-hidden="true"> / </span>
        <Link href={`/hadith/${collection}`} className="link-quiet">
          {getCollectionName(collection)}
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Book {sectionNumber}</span>
      </nav>

      <header className="mt-4">
        <h1 className="font-display text-2xl leading-snug sm:text-[1.75rem]">{title}</h1>
        <p className="mt-2 text-[0.875rem] text-mute">
          {getCollectionName(collection)} · Book {sectionNumber}
          {hadiths ? ` · ${hadiths.length} hadith` : ""}
        </p>
      </header>

      <div className="mt-8">
        {failed || !hadiths ? (
          <ErrorState
            title="We couldn't load the hadith right now."
            description="The hadith source did not respond. Please try again in a moment."
          />
        ) : hadiths.length === 0 ? (
          <EmptyState
            title="No hadith in this book"
            description="The source returned no entries for this section. Nothing is shown in its place."
            action={
              <Link href={`/hadith/${collection}`} className="link-quiet text-sm">
                Back to the collection
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {hadiths.map((hadith) => (
              <HadithCard key={hadith.id} hadith={hadith} signedIn bookmarked={false} />
            ))}
          </div>
        )}
      </div>

      <nav
        aria-label="Section navigation"
        className="mt-12 flex items-center justify-between border-t border-[color:var(--line)] pt-6"
      >
        {neighbour.previous ? (
          <Link
            href={`/hadith/${collection}/${neighbour.previous}`}
            className="text-[0.875rem] text-emerald-ink underline-offset-4 hover:underline dark:text-sage-soft"
          >
            ← Book {neighbour.previous}
          </Link>
        ) : (
          <span />
        )}
        {neighbour.next ? (
          <Link
            href={`/hadith/${collection}/${neighbour.next}`}
            className="text-[0.875rem] text-emerald-ink underline-offset-4 hover:underline dark:text-sage-soft"
          >
            Book {neighbour.next} →
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <div className="mt-10">
        <Note>
          Hadith are shown as they appear in the upstream collection. Numbering follows that
          collection, so the same narration may carry a different number in another collection.
        </Note>
      </div>
    </div>
  );
}
