"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { usePreferences } from "@/components/providers/preferences-provider";
import { SaveBookmarkButton } from "@/components/duas/dua-card";
import { useLocalQuranProgress } from "@/hooks/use-local-data";
import { Button, IconButton } from "@/components/ui/button";
import {
  BookmarkIcon,
  CheckIcon,
  CopyIcon,
  MinusIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  ShareIcon,
} from "@/components/ui/icons";
import { RECITERS, TRANSLATIONS, editionName } from "@/lib/quran/service";
import { ARABIC_FONT_MAX, ARABIC_FONT_MIN } from "@/lib/preferences";
import type { SurahContent } from "@/types";
import { cn } from "@/lib/utils/cn";

const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

export function QuranReader({
  content,
  surahAudioUrl,
  lastReadAyah,
  previous,
  next,
}: {
  content: SurahContent;
  surahAudioUrl: string;
  signedIn?: boolean;
  bookmarkedAyahs?: string[];
  lastReadAyah: number | null;
  previous: { number: number; englishName: string } | null;
  next: { number: number; englishName: string } | null;
}) {
  const { preferences, update } = usePreferences();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const localProgress = useLocalQuranProgress();
  const savedForSurah = localProgress.progress.find(
    (item) => item.surahNumber === content.surah.number,
  );
  const [playing, setPlaying] = useState<number | "surah" | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(
    savedForSurah?.lastAyah ?? lastReadAyah,
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (savedForSurah?.lastAyah) setSavedAt(savedForSurah.lastAyah);
  }, [savedForSurah?.lastAyah]);

  useEffect(
    () => () => {
      if (audioRef.current) audioRef.current.pause();
    },
    [],
  );

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlaying(null);
  };

  const play = (src: string, key: number | "surah") => {
    if (audioRef.current) audioRef.current.pause();
    const element = new Audio(src);
    audioRef.current = element;
    setPlaying(key);
    element.onended = () => setPlaying(null);
    element.onerror = () => setPlaying(null);
    element.play().catch(() => setPlaying(null));
  };

  const setTranslation = (edition: string) => {
    update({ translationEdition: edition });
    const params = new URLSearchParams(searchParams.toString());
    params.set("translation", edition);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const saveProgress = (ayahNumber: number) => {
    localProgress.saveProgress({
      surahNumber: content.surah.number,
      surahEnglishName: content.surah.englishName,
      surahName: content.surah.name,
      lastAyah: ayahNumber,
      totalAyahs: content.surah.numberOfAyahs,
    });
    setSavedAt(ayahNumber);
  };

  const copyAyah = async (ayahNumber: number, arabic: string, translation: string | null) => {
    const reference = `${content.surah.englishName} ${content.surah.number}:${ayahNumber}`;
    const text = [arabic, translation, reference, content.sourceNote]
      .filter((part): part is string => Boolean(part))
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(String(ayahNumber));
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const shareAyah = async (ayahNumber: number) => {
    const url = `${window.location.origin}/quran/${content.surah.number}#ayah-${ayahNumber}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `${content.surah.englishName} ${content.surah.number}:${ayahNumber}`,
          url,
        });
        return;
      } catch {
        /* fall through */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      {/* Reading controls */}
      <div className="sticky top-16 z-20 -mx-4 mb-8 border-b border-[color:var(--line)] bg-[color:var(--surface)]/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-[color:var(--line)] p-0.5">
            <IconButton
              label="Decrease Arabic text size"
              className="size-8"
              onClick={() =>
                update({ arabicFontSize: Math.max(ARABIC_FONT_MIN, preferences.arabicFontSize - 2) })
              }
            >
              <MinusIcon width={16} height={16} />
            </IconButton>
            <span className="w-10 text-center text-[0.75rem] tabular-nums text-mute">
              {preferences.arabicFontSize}px
            </span>
            <IconButton
              label="Increase Arabic text size"
              className="size-8"
              onClick={() =>
                update({ arabicFontSize: Math.min(ARABIC_FONT_MAX, preferences.arabicFontSize + 2) })
              }
            >
              <PlusIcon width={16} height={16} />
            </IconButton>
          </div>

          <label className="sr-only" htmlFor="translation-select">
            Translation
          </label>
          <select
            id="translation-select"
            value={preferences.translationEdition}
            onChange={(event) => setTranslation(event.target.value)}
            className="h-9 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-raised)] px-3 text-[0.8125rem]"
          >
            {TRANSLATIONS.map((translation) => (
              <option key={translation.id} value={translation.id}>
                {translation.name}
              </option>
            ))}
            <option value="">Arabic only</option>
          </select>

          <label className="sr-only" htmlFor="reciter-select">
            Reciter
          </label>
          <select
            id="reciter-select"
            value={preferences.reciter}
            onChange={(event) => update({ reciter: event.target.value })}
            className="h-9 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-raised)] px-3 text-[0.8125rem]"
          >
            {RECITERS.map((reciter) => (
              <option key={reciter.id} value={reciter.id}>
                {reciter.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() =>
              update({ showTranslation: !preferences.showTranslation })
            }
            aria-pressed={preferences.showTranslation}
            className={cn(
              "h-9 rounded-full border px-3.5 text-[0.8125rem] transition-colors",
              preferences.showTranslation
                ? "border-emerald/40 text-emerald-ink dark:text-sage-soft"
                : "border-[color:var(--line)] text-mute",
            )}
          >
            Translation
          </button>

          <Link
            href={`/quran/${content.surah.number}/tafsir?ayah=1`}
            className="ms-auto inline-flex h-9 items-center rounded-full border border-gold/40 px-3.5 text-[0.8125rem] text-gold transition-colors hover:bg-gold-pale/20"
          >
            Full Tafseer · مکمل تفسیر
          </Link>
          <button
            type="button"
            onClick={() =>
              playing === "surah" ? stopAudio() : play(surahAudioUrl, "surah")
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[color:var(--line)] px-3.5 text-[0.8125rem] text-mute transition-colors hover:border-emerald/40 hover:text-[color:var(--fg)]"
          >
            {playing === "surah" ? (
              <PauseIcon width={14} height={14} />
            ) : (
              <PlayIcon width={14} height={14} />
            )}
            Listen to surah
          </button>
        </div>
      </div>

      <article className="mx-auto max-w-4xl">
        <header className="text-center">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">
            Surah {content.surah.number}
          </p>
          <h1
            className="mt-3 font-arabic text-[2.25rem] leading-[1.5] text-emerald-ink dark:text-sage-soft sm:text-[2.75rem]"
            lang="ar"
          >
            {content.surah.name.replace(/^سُورَةُ\s*/, "")}
          </h1>
          <p className="mt-2 font-display text-xl">{content.surah.englishName}</p>
          <p className="mt-1 text-[0.8125rem] text-mute">
            {content.surah.englishNameTranslation} · {content.surah.revelationType} ·{" "}
            {content.surah.numberOfAyahs} ayahs
          </p>
          {savedAt ? (
            <p className="mt-3 text-[0.75rem] text-mute">
              You last read up to ayah {savedAt}.
            </p>
          ) : null}
        </header>

        {content.bismillahPrefix ? (
          <p
            className="mt-10 text-center font-arabic text-[1.375rem] leading-[2] text-emerald-ink dark:text-sage-soft"
            lang="ar"
          >
            {BISMILLAH}
          </p>
        ) : null}

        <div className="mt-10 space-y-10">
          {content.ayahs.map((ayah) => (
            <section key={ayah.key} id={`ayah-${ayah.numberInSurah}`} className="group scroll-mt-40">
              <div className="flex items-start justify-between gap-4">
                <p
                  className="font-arabic min-w-0 flex-1"
                  style={{ fontSize: `${preferences.arabicFontSize}px` }}
                  lang="ar"
                >
                  {ayah.arabic}
                  <span className="ayah-number ms-2 inline-flex items-center justify-center rounded-full border border-gold/40 px-2 py-0.5 align-middle text-[0.6875rem]">
                    {ayah.numberInSurah}
                  </span>
                </p>
              </div>

              {preferences.showTranslation ? (
                ayah.translation ? (
                  <p className="mt-4 max-w-[62ch] text-[1rem] leading-[1.85] text-[color:var(--fg)]/90">
                    {ayah.translation}
                  </p>
                ) : (
                  <p className="mt-4 text-[0.875rem] italic text-mute">Translation unavailable.</p>
                )
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 motion-reduce:opacity-100">
                <IconButton
                  label={`Play ayah ${ayah.numberInSurah}`}
                  className="size-8 text-mute"
                  onClick={() =>
                    playing === ayah.numberInSurah
                      ? stopAudio()
                      : ayah.audioUrl
                        ? play(ayah.audioUrl, ayah.numberInSurah)
                        : undefined
                  }
                >
                  {playing === ayah.numberInSurah ? (
                    <PauseIcon width={15} height={15} />
                  ) : (
                    <PlayIcon width={15} height={15} />
                  )}
                </IconButton>
                <IconButton
                  label={`Copy ayah ${ayah.numberInSurah}`}
                  className="size-8 text-mute"
                  onClick={() => copyAyah(ayah.numberInSurah, ayah.arabic, ayah.translation)}
                >
                  {copied === String(ayah.numberInSurah) ? (
                    <CheckIcon width={15} height={15} />
                  ) : (
                    <CopyIcon width={15} height={15} />
                  )}
                </IconButton>
                <IconButton
                  label={`Share ayah ${ayah.numberInSurah}`}
                  className="size-8 text-mute"
                  onClick={() => shareAyah(ayah.numberInSurah)}
                >
                  <ShareIcon width={15} height={15} />
                </IconButton>
                <button
                  type="button"
                  onClick={() => saveProgress(ayah.numberInSurah)}
                  className="inline-flex h-8 items-center rounded-full border border-[color:var(--line)] px-2.5 text-[0.6875rem] text-mute transition-colors hover:border-emerald/40 hover:text-[color:var(--fg)]"
                >
                  <BookmarkIcon width={14} height={14} />
                  Set as last read
                </button>
                <SaveBookmarkButton
                  itemType="quran"
                  itemId={ayah.key}
                  title={`${content.surah.englishName} ${ayah.key}`}
                  subtitle={`${content.surah.englishNameTranslation} · ${content.surah.revelationType}`}
                  reference={`${content.surah.name} · ${ayah.key} · ${editionName(content.edition)}`}
                  href={`/quran/${content.surah.number}#ayah-${ayah.numberInSurah}`}
                  snippet={ayah.translation ?? ayah.arabic}
                  labels={{ save: "Bookmark", saved: "Bookmarked" }}
                />
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-14 border-t border-[color:var(--line)] pt-6">
          <p className="text-[0.75rem] leading-relaxed text-mute">{content.sourceNote}</p>
          <div className="mt-6 flex items-center justify-between gap-4">
            {previous ? (
              <Link
                href={`/quran/${previous.number}`}
                className="text-[0.875rem] text-emerald-ink underline-offset-4 hover:underline dark:text-sage-soft"
              >
                ← {previous.englishName}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/quran/${next.number}`}
                className="text-[0.875rem] text-emerald-ink underline-offset-4 hover:underline dark:text-sage-soft"
              >
                {next.englishName} →
              </Link>
            ) : (
              <span />
            )}
          </div>
          <div className="mt-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => saveProgress(content.surah.numberOfAyahs)}
            >
              Mark surah as read
            </Button>
          </div>
        </footer>
      </article>
    </div>
  );
}
