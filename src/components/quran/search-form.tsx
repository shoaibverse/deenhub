"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/primitives";
import { SearchIcon } from "@/components/ui/icons";
import { TRANSLATIONS } from "@/lib/quran/service";
import { cn } from "@/lib/utils/cn";

export function QuranSearchForm({
  initialQuery,
  edition,
  scope,
}: {
  initialQuery: string;
  edition: string;
  scope: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [editionValue, setEditionValue] = useState(edition);
  const [scopeValue, setScopeValue] = useState(scope);
  const router = useRouter();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        params.set("edition", editionValue);
        params.set("scope", scopeValue);
        router.push(`/quran/search?${params.toString()}`);
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
      role="search"
    >
      <div className="relative flex-1">
        <label htmlFor="quran-search" className="sr-only">
          Search the Quran
        </label>
        <SearchIcon
          width={18}
          height={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute"
        />
        <input
          id="quran-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. mercy, Maryam, 18"
          className={cn(inputClass, "h-12 pl-11")}
        />
      </div>

      <div>
        <label htmlFor="search-edition" className="sr-only">
          Translation edition
        </label>
        <select
          id="search-edition"
          value={editionValue}
          onChange={(event) => setEditionValue(event.target.value)}
          className="h-12 rounded-[10px] border border-[color:var(--line)] bg-[color:var(--surface-raised)] px-3 text-sm"
        >
          {TRANSLATIONS.map((translation) => (
            <option key={translation.id} value={translation.id}>
              {translation.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="search-scope" className="sr-only">
          Search scope
        </label>
        <select
          id="search-scope"
          value={scopeValue}
          onChange={(event) => setScopeValue(event.target.value)}
          className="h-12 rounded-[10px] border border-[color:var(--line)] bg-[color:var(--surface-raised)] px-3 text-sm"
        >
          <option value="translation">Translation + surahs</option>
          <option value="surah">Surah names only</option>
        </select>
      </div>

      <Button type="submit" size="lg">
        Search
      </Button>
    </form>
  );
}
