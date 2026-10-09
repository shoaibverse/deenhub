"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { IconButton } from "@/components/ui/button";
import { RECENT_SEARCHES_KEY } from "@/lib/preferences";
import { cn } from "@/lib/utils/cn";

type Result = {
  kind: "surah" | "ayah" | "dua";
  title: string;
  subtitle?: string | null;
  snippet?: string | null;
  href: string;
};

type Scope = "all" | "quran" | "duas";

const SCOPES: Array<{ value: Scope; label: string }> = [
  { value: "all", label: "All" },
  { value: "quran", label: "Quran" },
  { value: "duas", label: "Duas" },
];

export function SearchDialog({ label = "Search" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (event.key === "/" && !typing) {
        event.preventDefault();
        setOpen(true);
      }
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      try {
        const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) setRecent(JSON.parse(stored) as string[]);
      } catch {
        setRecent([]);
      }
      const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(timer);
    }
    setResults(null);
    setQuery("");
    setFailed(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&scope=${scope}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("failed");
        const payload = (await response.json()) as { results: Result[] };
        setResults(payload.results ?? []);
        setFailed(false);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([]);
          setFailed(true);
        }
      } finally {
        setLoading(false);
      }
    }, 260);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, scope, open]);

  const remember = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) return;
    const next = [trimmed, ...recent.filter((item) => item !== trimmed)].slice(0, 5);
    setRecent(next);
    try {
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const go = (result: Result) => {
    remember(query);
    setOpen(false);
    router.push(result.href);
  };

  const submit = () => {
    if (results && results[activeIndex]) {
      go(results[activeIndex]);
    } else if (query.trim().length >= 2) {
      remember(query);
      setOpen(false);
      router.push(`/quran/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        className="hidden items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-raised)] px-3.5 py-2 text-[0.8125rem] text-mute transition-colors hover:border-emerald/40 hover:text-[color:var(--fg)] md:inline-flex"
      >
        <SearchIcon width={16} height={16} />
        <span>Search</span>
        <kbd className="ml-2 rounded border border-[color:var(--line)] px-1.5 py-0.5 text-[0.625rem] font-sans">
          /
        </kbd>
      </button>
      <IconButton label="Search" className="md:hidden" onClick={() => setOpen(true)}>
        <SearchIcon width={18} height={18} />
      </IconButton>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div
              className="absolute inset-0 bg-ink/35 backdrop-blur-[2px] dark:bg-black/60"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Search NoorHub"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="relative flex max-h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-[16px] border border-[color:var(--line)] bg-[color:var(--surface-raised)] shadow-xl"
            >
              <div className="flex items-center gap-3 border-b border-[color:var(--line)] px-4 py-3">
                <SearchIcon width={18} height={18} className="text-mute" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      setActiveIndex((index) => Math.min(index + 1, (results?.length ?? 1) - 1));
                    }
                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      setActiveIndex((index) => Math.max(index - 1, 0));
                    }
                    if (event.key === "Enter") {
                      event.preventDefault();
                      submit();
                    }
                  }}
                  placeholder="Search surahs, ayahs and duas"
                  aria-label="Search query"
                  className="min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-mute/70"
                />
                <IconButton label="Close search" onClick={() => setOpen(false)} className="size-8">
                  <CloseIcon width={16} height={16} />
                </IconButton>
              </div>

              <div className="flex items-center gap-2 border-b border-[color:var(--line)] px-4 py-2">
                {SCOPES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setScope(item.value);
                      setActiveIndex(0);
                    }}
                    aria-pressed={scope === item.value}
                    className={cn(
                      "rounded-full px-3 py-1 text-[0.75rem] font-medium transition-colors",
                      scope === item.value
                        ? "bg-emerald-ink text-ivory dark:bg-emerald-soft"
                        : "text-mute hover:text-[color:var(--fg)]",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
                <span className="ml-auto hidden text-[0.6875rem] text-mute sm:block">
                  ↑↓ to move · Enter to open
                </span>
              </div>

              <div className="flex-1 overflow-y-auto px-2 py-2">
                {loading ? (
                  <div className="space-y-2 p-2" aria-live="polite">
                    <p className="px-2 text-[0.8125rem] text-mute">Searching…</p>
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="skeleton h-14 rounded-[10px]" />
                    ))}
                  </div>
                ) : failed ? (
                  <p className="px-4 py-6 text-center text-sm text-mute">
                    We couldn’t complete the search right now. Please try again.
                  </p>
                ) : results === null ? (
                  <div className="px-4 py-5">
                    <p className="text-[0.8125rem] font-medium">Search across NoorHub</p>
                    <p className="mt-1 text-[0.8125rem] text-mute">
                      Surah names, Quran translation and the dua collection.
                    </p>
                    {recent.length > 0 ? (
                      <div className="mt-4">
                        <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-mute">
                          Recent searches
                        </p>
                        <ul className="mt-2 space-y-1">
                          {recent.map((item) => (
                            <li key={item}>
                              <button
                                type="button"
                                onClick={() => setQuery(item)}
                                className="w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-sand/60 dark:hover:bg-night-soft"
                              >
                                {item}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : results.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-mute">
                    No matches found for “{query}”.
                  </p>
                ) : (
                  <ul>
                    {results.map((result, index) => (
                      <li key={`${result.kind}-${result.href}-${index}`}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => go(result)}
                          className={cn(
                            "flex w-full flex-col items-start gap-1 rounded-[10px] px-3 py-2.5 text-left transition-colors",
                            index === activeIndex ? "bg-sand/70 dark:bg-night-soft" : "",
                          )}
                        >
                          <span className="flex w-full items-baseline justify-between gap-3">
                            <span className="text-sm font-medium">{result.title}</span>
                            <span className="shrink-0 text-[0.625rem] uppercase tracking-[0.12em] text-gold">
                              {result.kind}
                            </span>
                          </span>
                          {result.snippet ? (
                            <span className="line-clamp-2 text-[0.8125rem] leading-relaxed text-mute">
                              {result.snippet}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t border-[color:var(--line)] px-4 py-2 text-[0.6875rem] text-mute">
                Quran text and translation are fetched from the configured source.{" "}
                <Link href="/about#sources" className="link-quiet" onClick={() => setOpen(false)}>
                  See sources
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
