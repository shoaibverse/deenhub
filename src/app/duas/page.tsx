import type { Metadata } from "next";
import Link from "next/link";
import { DuaCard } from "@/components/duas/dua-card";
import { EmptyState, Note, SectionHeading, inputClass } from "@/components/ui/primitives";
import {
  DUA_COLLECTION,
  DUA_SOURCES,
  MOMENT_FILTERS,
  getCategories,
  getDuaById,
  getDuas,
} from "@/lib/dua/service";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Duas",
  description:
    "Searchable supplications from Hisn al-Muslim with Arabic, transliteration, translation and recitation audio.",
  alternates: { canonical: "/duas" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DuasPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const tag = first(params.tag) ?? null;
  const query = (first(params.q) ?? "").trim();
  const entryId = first(params.entry) ?? null;
  const page = Math.max(1, Number(first(params.page) ?? "1") || 1);
  const perPage = 12;

  const focused = entryId ? getDuaById(entryId) : null;
  const { total, entries } = focused
    ? { total: 1, entries: [focused] }
    : getDuas({
        tag,
        search: query || null,
        limit: perPage,
        offset: (page - 1) * perPage,
      });

  const categories = getCategories();
  const buildHref = (nextTag: string | null, nextPage = 1) => {
    const search = new URLSearchParams();
    if (nextTag) search.set("tag", nextTag);
    if (query) search.set("q", query);
    if (nextPage > 1) search.set("page", String(nextPage));
    return `/duas${search.toString() ? `?${search.toString()}` : ""}`;
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Duas"
        title="Remembrance for the moments of the day"
        description={`${DUA_COLLECTION.entryCount} supplications from ${DUA_SOURCES.book}, with transliteration, translation and recitation.`}
      />

      <form role="search" action="/duas" className="mt-8 flex gap-3">
        <label htmlFor="dua-search" className="sr-only">
          Search duas
        </label>
        <input
          id="dua-search"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Search by meaning, e.g. forgiveness, travel, anxiety"
          className={cn(inputClass, "h-12")}
        />
        {tag ? <input type="hidden" name="tag" value={tag} /> : null}
        <button
          type="submit"
          className="h-12 shrink-0 rounded-full bg-emerald-ink px-5 text-sm font-medium text-ivory dark:bg-emerald-soft"
        >
          Search
        </button>
      </form>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <Link
          href={buildHref(null)}
          className={cn(
            "inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-[0.8125rem]",
            !tag
              ? "border-emerald/60 bg-emerald-ink text-ivory dark:border-sage/50 dark:bg-emerald-soft"
              : "border-[color:var(--line)] hover:border-emerald/40",
          )}
        >
          All
        </Link>
        {MOMENT_FILTERS.filter((moment) => moment.tag).map((moment) => (
          <Link
            key={moment.id}
            href={buildHref(moment.tag)}
            className={cn(
              "inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-[0.8125rem]",
              tag === moment.tag
                ? "border-emerald/60 bg-emerald-ink text-ivory dark:border-sage/50 dark:bg-emerald-soft"
                : "border-[color:var(--line)] hover:border-emerald/40",
            )}
          >
            {moment.label}
          </Link>
        ))}
      </div>

      <p className="mt-4 text-[0.8125rem] text-mute" aria-live="polite">
        {total === 0
          ? "No duas match this search."
          : `Showing ${entries.length} of ${total} ${total === 1 ? "entry" : "entries"}`}
      </p>

      <div className="mt-6 space-y-4">
        {entries.length === 0 ? (
          <EmptyState
            title="No duas found"
            description="Try a different word, or clear the filters to see the whole collection."
            action={
              <Link href="/duas" className="link-quiet text-sm">
                Clear filters
              </Link>
            }
          />
        ) : (
          entries.map((entry) => (
            <DuaCard key={entry.id} entry={entry} />
          ))
        )}
      </div>

      {totalPages > 1 ? (
        <nav
          aria-label="Pagination"
          className="mt-10 flex items-center justify-between border-t border-[color:var(--line)] pt-6"
        >
          {page > 1 ? (
            <Link href={buildHref(tag, page - 1)} className="link-quiet text-sm">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-[0.75rem] text-mute">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={buildHref(tag, page + 1)} className="link-quiet text-sm">
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}

      <div className="mt-12 space-y-4">
        <Note tone="gold">
          Text from {DUA_SOURCES.name}. Arabic, transliteration and translation are taken from that
          edition; where the source records a hadith reference it is shown with the dua.
        </Note>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={buildHref(category.id)}
              className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-[0.75rem] text-mute hover:border-emerald/40 hover:text-[color:var(--fg)]"
            >
              {category.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
