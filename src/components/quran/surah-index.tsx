"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { JuzMeta, SurahMeta } from "@/types";
import { cn } from "@/lib/utils/cn";
import { Segmented } from "@/components/ui/primitives";
import { inputClass } from "@/components/ui/primitives";
import { useLocalQuranProgress } from "@/hooks/use-local-data";

type Filter = "all" | "meccan" | "medinan";

export function SurahIndex({
  surahs,
  juz,
  lastRead,
}: {
  surahs: SurahMeta[];
  juz: JuzMeta[];
  lastRead: { surahNumber: number; lastAyah: number } | null;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<"surah" | "juz">("surah");
  const localProgress = useLocalQuranProgress();
  const effectiveLastRead = localProgress.progress[0]
    ? {
        surahNumber: localProgress.progress[0].surahNumber,
        lastAyah: localProgress.progress[0].lastAyah,
      }
    : lastRead;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return surahs.filter((surah) => {
      if (filter !== "all" && surah.revelationType.toLowerCase() !== filter) return false;
      if (!needle) return true;
      return (
        surah.englishName.toLowerCase().includes(needle) ||
        surah.englishNameTranslation.toLowerCase().includes(needle) ||
        surah.name.includes(query.trim()) ||
        String(surah.number) === needle
      );
    });
  }, [surahs, query, filter]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="surah-filter" className="sr-only">
            Filter surahs
          </label>
          <input
            id="surah-filter"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by name or number"
            className={cn(inputClass, "h-11")}
            type="search"
          />
        </div>
        <Segmented
          label="Revelation type"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "meccan", label: "Meccan" },
            { value: "medinan", label: "Medinan" },
          ]}
        />
        <Segmented
          label="Index view"
          value={view}
          onChange={setView}
          options={[
            { value: "surah", label: "Surah" },
            { value: "juz", label: "Juz" },
          ]}
        />
      </div>

      {view === "surah" ? (
        <p className="mt-4 text-[0.8125rem] text-mute" aria-live="polite">
          {filtered.length} of {surahs.length} surahs
        </p>
      ) : null}

      {view === "surah" ? (
        filtered.length === 0 ? (
          <p className="mt-8 text-[0.9375rem] text-mute">
            No surah matches “{query}”. Try a name such as Yasin, Maryam or 18.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
            {filtered.map((surah) => (
              <li key={surah.number}>
                <Link
                  href={`/quran/${surah.number}`}
                  className="group flex items-center gap-4 py-3.5 transition-colors hover:bg-sand/50 dark:hover:bg-night-soft/60"
                >
                  <span className="ayah-number w-8 shrink-0 text-center text-[0.8125rem] tabular-nums">
                    {surah.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-display text-[1.0625rem]">{surah.englishName}</span>
                      <span className="text-[0.75rem] text-mute">
                        {surah.englishNameTranslation}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[0.75rem] text-mute">
                      {surah.numberOfAyahs} ayahs · {surah.revelationType}
                      {effectiveLastRead?.surahNumber === surah.number
                        ? ` · you stopped at ayah ${effectiveLastRead.lastAyah}`
                        : ""}
                    </span>
                  </span>
                  <span
                    className="font-arabic shrink-0 text-[1.25rem] text-emerald-ink dark:text-sage-soft"
                    lang="ar"
                  >
                    {surah.name.replace(/^سُورَةُ\s*/, "")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {juz.map((item) => {
            const surah = surahs.find((entry) => entry.number === item.surah);
            return (
              <li key={item.number}>
                <Link
                  href={`/quran/${item.surah}#ayah-${item.ayah}`}
                  className="surface flex h-full flex-col rounded-[12px] p-4 transition-colors hover:border-emerald/40"
                >
                  <span className="ayah-number text-[0.8125rem]">Juz {item.number}</span>
                  <span className="mt-1.5 font-display text-[0.9375rem]">
                    {surah?.englishName ?? "—"} {item.surah}:{item.ayah}
                  </span>
                  <span className="font-arabic mt-1 text-[1.0625rem] text-mute" lang="ar">
                    {surah?.name.replace(/^سُورَةُ\s*/, "") ?? ""}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
