"use client";

import { useState } from "react";
import {
  BookmarkIcon,
  CheckIcon,
  CopyIcon,
  HeartIcon,
  PauseIcon,
  PlayIcon,
  ShareIcon,
} from "@/components/ui/icons";
import { IconButton } from "@/components/ui/button";
import { usePreferences } from "@/components/providers/preferences-provider";
import { useLocalBookmarks, useLocalFavoriteDuas } from "@/hooks/use-local-data";
import type { DuaEntry } from "@/types";
import { duaReference } from "@/lib/dua/service";
import { cn } from "@/lib/utils/cn";

export function DuaCard({
  entry,
  defaultOpen = true,
  className,
}: {
  entry: DuaEntry;
  signedIn?: boolean;
  favorited?: boolean;
  defaultOpen?: boolean;
  className?: string;
}) {
  const { preferences } = usePreferences();
  const favorites = useLocalFavoriteDuas();
  const saved = favorites.has(entry.id);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(defaultOpen);
  const [audio, setAudio] = useState<{ element: HTMLAudioElement; lineIndex: number } | null>(null);

  const notify = (text: string | null) => {
    setMessage(text);
    if (text) window.setTimeout(() => setMessage(null), 2600);
  };

  const onFavorite = () => {
    const nowSaved = favorites.toggle(entry.id);
    notify(nowSaved ? "Saved on this device." : "Removed from favorites.");
  };

  const onCopy = async () => {
    const text = entry.lines
      .map((line) =>
        [
          line.arabic,
          preferences.showTransliteration && line.transliteration ? line.transliteration : null,
          line.translation ?? null,
        ]
          .filter((part): part is string => typeof part === "string" && part.length > 0)
          .join("\n"),
      )
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(`${text}\n\n${duaReference(entry)}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      notify("Copying is not available in this browser.");
    }
  };

  const onShare = async () => {
    const url = `${window.location.origin}/duas?entry=${entry.id}`;
    const shareData = { title: entry.title, text: entry.lines[0]?.translation ?? entry.title, url };
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      notify("Link copied.");
    } catch {
      notify("Sharing is not available in this browser.");
    }
  };

  const toggleAudio = (url: string, lineIndex: number) => {
    if (audio) {
      audio.element.pause();
      if (audio.lineIndex === lineIndex) {
        setAudio(null);
        return;
      }
    }
    const element = new Audio(url);
    element.play().catch(() => notify("Audio could not be played."));
    setAudio({ element, lineIndex });
    element.onended = () => setAudio(null);
  };

  return (
    <article
      id={entry.id}
      className={cn("surface scroll-mt-24 rounded-[14px] p-5 sm:p-6", className)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-[1.0625rem] leading-snug">{entry.title}</h3>
          <p className="mt-1 text-[0.75rem] text-mute">
            {entry.chapter ? `Hisn al-Muslim · Chapter ${entry.chapter.number}` : "Hisn al-Muslim"}
            {entry.sourceReference ? ` · Entry ${entry.sourceReference}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            label={saved ? "Remove from favorite duas" : "Save to favorite duas"}
            onClick={onFavorite}
            className={cn("text-mute hover:text-gold", saved && "text-gold")}
          >
            <HeartIcon filled={saved} width={18} height={18} />
          </IconButton>
          <IconButton label="Copy dua" onClick={onCopy} className="text-mute hover:text-emerald">
            {copied ? <CheckIcon width={18} height={18} /> : <CopyIcon width={18} height={18} />}
          </IconButton>
          <IconButton label="Share dua" onClick={onShare} className="text-mute hover:text-emerald">
            <ShareIcon width={18} height={18} />
          </IconButton>
        </div>
      </div>

      <div className="mt-4 space-y-5">
        {entry.lines.map((line, index) => (
          <div key={`${entry.id}-${index}`} className="space-y-2">
            <p
              className="font-arabic text-right leading-[2.15]"
              style={{ fontSize: `${Math.round(preferences.arabicFontSize * 0.86)}px` }}
              lang="ar"
              dir="rtl"
            >
              {line.arabic}
            </p>
            {line.audio ? (
              <button
                type="button"
                onClick={() => toggleAudio(line.audio as string, index)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--line)] px-3 py-1 text-[0.75rem] text-mute transition-colors hover:border-emerald/40 hover:text-[color:var(--fg)]"
              >
                {audio?.lineIndex === index ? (
                  <PauseIcon width={14} height={14} />
                ) : (
                  <PlayIcon width={14} height={14} />
                )}
                {audio?.lineIndex === index ? "Pause recitation" : "Listen"}
              </button>
            ) : null}
            {preferences.showTransliteration && line.transliteration ? (
              <p className="text-[0.8125rem] italic leading-relaxed text-mute">
                {line.transliteration}
              </p>
            ) : null}
            {line.translation ? (
              <p className="text-[0.9375rem] leading-relaxed">{line.translation}</p>
            ) : (
              <p className="text-[0.8125rem] text-mute">Translation unavailable.</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--line)] pt-3">
        <p className="text-[0.75rem] text-mute">{duaReference(entry)}</p>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="text-[0.75rem] text-mute underline-offset-4 hover:underline"
          aria-expanded={open}
        >
          {open ? "Hide details" : "Show details"}
        </button>
      </div>

      {open ? (
        <p className="mt-3 text-[0.75rem] leading-relaxed text-mute">
          Text from the OpenDua edition of Hisn al-Muslim. Where the source records a hadith
          reference it is shown above; otherwise refer to the printed book.
        </p>
      ) : null}

      {message ? (
        <p role="status" className="mt-3 text-[0.75rem] text-gold">
          {message}
        </p>
      ) : null}
    </article>
  );
}

export function SaveBookmarkButton({
  itemType,
  itemId,
  title,
  subtitle,
  reference,
  href,
  snippet,
  labels = { save: "Save", saved: "Saved" },
}: {
  itemType: "quran" | "hadith" | "dua";
  itemId: string;
  title: string;
  subtitle?: string | null;
  reference?: string | null;
  href: string;
  snippet?: string | null;
  saved?: boolean;
  signedIn?: boolean;
  labels?: { save: string; saved: string };
}) {
  const local = useLocalBookmarks();
  const saved = local.has(itemType, itemId);
  const [message, setMessage] = useState<string | null>(null);

  const onClick = () => {
    const nowSaved = local.toggle({
      itemType,
      itemId,
      title,
      subtitle: subtitle ?? null,
      reference: reference ?? null,
      href,
      snippet: snippet ?? null,
    });
    setMessage(nowSaved ? "Saved on this device." : "Bookmark removed.");
    window.setTimeout(() => setMessage(null), 2200);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.75rem] transition-colors",
          saved
            ? "border-gold/50 text-gold"
            : "border-[color:var(--line)] text-mute hover:border-emerald/40 hover:text-[color:var(--fg)]",
        )}
        aria-pressed={saved}
      >
        <BookmarkIcon filled={saved} width={15} height={15} />
        {saved ? labels.saved : labels.save}
      </button>
      {message ? (
        <span role="status" className="text-[0.75rem] text-mute">
          {message}
        </span>
      ) : null}
    </div>
  );
}
