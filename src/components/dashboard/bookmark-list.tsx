"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocalBookmarks } from "@/hooks/use-local-data";
import { EmptyState, Segmented, inputClass } from "@/components/ui/primitives";
import { BookmarkIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

type TypeFilter = "all" | "quran" | "hadith" | "dua";
type Sort = "newest" | "oldest" | "title";

export function BookmarkList() {
  const local = useLocalBookmarks();
  const items = local.bookmarks;
  const [filter, setFilter] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = items.filter((item) => {
      if (filter !== "all" && item.itemType !== filter) return false;
      if (!needle) return true;
      return [item.title, item.subtitle, item.reference, item.snippet]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
    return filtered.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      const delta = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sort === "newest" ? delta : -delta;
    });
  }, [items, filter, query, sort]);

  if (!local.ready) {
    return (
      <div className="space-y-4" aria-busy="true">
        <p className="text-[0.8125rem] text-mute">Loading bookmarks saved on this device…</p>
        {[0, 1, 2].map((index) => (
          <div key={index} className="skeleton h-24 rounded-[12px]" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[12rem] flex-1">
          <label htmlFor="bookmark-search" className="sr-only">
            Search bookmarks
          </label>
          <input
            id="bookmark-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your bookmarks"
            className={cn(inputClass, "h-11")}
          />
        </div>
        <Segmented
          label="Filter by type"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "quran", label: "Quran" },
            { value: "hadith", label: "Hadith" },
            { value: "dua", label: "Duas" },
          ]}
        />
        <div>
          <label htmlFor="bookmark-sort" className="sr-only">
            Sort bookmarks
          </label>
          <select
            id="bookmark-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as Sort)}
            className="h-11 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-raised)] px-3 text-[0.8125rem]"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">By title</option>
          </select>
        </div>
      </div>

      <p className="mt-4 text-[0.8125rem] text-mute" aria-live="polite">
        {visible.length} of {items.length} saved on this device
      </p>

      {visible.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<BookmarkIcon />}
            title="No bookmarks yet."
            description="Save an Ayah or Hadith and it will appear here. Everything stays in this browser."
            action={
              <Link href="/quran" className="link-quiet text-sm">
                Open the Quran
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
          {visible.map((item) => (
            <li key={item.id} className="flex flex-wrap items-start gap-4 py-4">
              <span className="mt-0.5 w-16 shrink-0 text-[0.6875rem] uppercase tracking-[0.12em] text-gold">
                {item.itemType}
              </span>
              <div className="min-w-0 flex-1">
                <Link href={item.href} className="link-quiet font-display text-[1.0625rem]">
                  {item.title}
                </Link>
                {item.subtitle ? <p className="mt-0.5 text-[0.75rem] text-mute">{item.subtitle}</p> : null}
                {item.snippet ? (
                  <p className="mt-1.5 line-clamp-2 text-[0.875rem] leading-relaxed text-mute">
                    {item.snippet}
                  </p>
                ) : null}
                <p className="mt-1.5 text-[0.6875rem] text-mute">
                  Saved{" "}
                  {new Intl.DateTimeFormat("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(item.createdAt))}
                  {item.reference ? ` · ${item.reference}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href={item.href}
                  className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-[0.75rem] text-mute hover:border-emerald/40 hover:text-[color:var(--fg)]"
                >
                  Open
                </Link>
                <button
                  type="button"
                  onClick={() => local.remove(item.id)}
                  className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-[0.75rem] text-mute hover:border-red-300 hover:text-red-700 dark:hover:border-red-900 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
