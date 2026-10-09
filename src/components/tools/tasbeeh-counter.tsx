"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Note, Segmented } from "@/components/ui/primitives";
import { MinusIcon, PlusIcon, RefreshIcon } from "@/components/ui/icons";
import { saveTasbeehSession } from "@/lib/actions/library";
import { TASBEEH_KEY } from "@/lib/preferences";
import { cn } from "@/lib/utils/cn";

const DHIKR = [
  { id: "subhanallah", arabic: "سُبْحَانَ اللَّهِ", transliteration: "SubhanAllah", meaning: "Glory be to Allah" },
  { id: "alhamdulillah", arabic: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", meaning: "All praise is for Allah" },
  { id: "allahuakbar", arabic: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", meaning: "Allah is the Greatest" },
  { id: "lailahaillallah", arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ", transliteration: "La ilaha illa Allah", meaning: "There is no god but Allah" },
  { id: "astaghfirullah", arabic: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah", meaning: "I seek Allah's forgiveness" },
];

const TARGETS = [33, 99, 100];

type Stored = { dhikr: string; target: number; count: number };

export function TasbeehCounter({
  signedIn,
  history,
}: {
  signedIn: boolean;
  history: Array<{ id: string; dhikr: string; target: number; count: number; updatedAt: string }>;
}) {
  const [dhikrId, setDhikrId] = useState(DHIKR[0].id);
  const [target, setTarget] = useState(33);
  const [customTarget, setCustomTarget] = useState("");
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(TASBEEH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Stored;
        if (parsed.dhikr) setDhikrId(parsed.dhikr);
        if (parsed.target) setTarget(parsed.target);
        setCount(parsed.count ?? 0);
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(
        TASBEEH_KEY,
        JSON.stringify({ dhikr: dhikrId, target, count } satisfies Stored),
      );
    } catch {
      /* ignore */
    }
  }, [dhikrId, target, count, loaded]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [message]);

  const dhikr = DHIKR.find((item) => item.id === dhikrId) ?? DHIKR[0];
  const effectiveTarget = customTarget ? Math.max(1, Number(customTarget) || 1) : target;
  const progress = Math.min(100, (count / effectiveTarget) * 100);

  const increment = useCallback(() => {
    setCount((value) => {
      const next = value + 1;
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(next >= effectiveTarget ? [40, 60, 40] : 12);
      }
      return next;
    });
  }, [effectiveTarget]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === " " || event.code === "Space") {
        const active = document.activeElement?.tagName;
        if (active === "BUTTON" || active === "INPUT") return;
        event.preventDefault();
        increment();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [increment]);

  const saveSession = () => {
    if (!signedIn) {
      setMessage("Sign in to keep a record of your dhikr.");
      return;
    }
    if (count === 0) return;
    startTransition(async () => {
      const result = await saveTasbeehSession({
        dhikr: dhikr.transliteration,
        target: effectiveTarget,
        count,
      });
      setMessage(result.error ?? "Session saved.");
    });
  };

  return (
    <div className="space-y-8">
      <div className="surface rounded-[14px] p-6 sm:p-8">
        <div className="text-center">
          <p className="font-arabic text-[1.75rem] leading-[2] text-emerald-ink dark:text-sage-soft" lang="ar">
            {dhikr.arabic}
          </p>
          <p className="mt-1 text-[0.875rem] text-mute">
            {dhikr.transliteration} · {dhikr.meaning}
          </p>
        </div>

        <div
          className="mt-8 flex flex-col items-center"
          role="group"
          aria-label="Tasbeeh counter"
        >
          <p
            className="font-display text-[4rem] leading-none tabular-nums"
            aria-live="polite"
            aria-atomic="true"
          >
            {count}
          </p>
          <p className="mt-2 text-[0.8125rem] text-mute">
            of {effectiveTarget} · {Math.max(0, effectiveTarget - count)} remaining
          </p>
          <div className="mt-4 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-sand dark:bg-night-soft">
            <div
              className="h-full rounded-full bg-emerald-ink transition-[width] duration-300 dark:bg-sage"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-8 flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCount((value) => Math.max(0, value - 1))}
              aria-label="Subtract one"
            >
              <MinusIcon width={18} height={18} />
            </Button>
            <button
              type="button"
              onClick={increment}
              className="h-20 w-32 rounded-[18px] bg-emerald-ink text-ivory transition-transform duration-150 active:scale-[0.98] dark:bg-emerald-soft"
            >
              <span className="flex flex-col items-center gap-1">
                <PlusIcon width={22} height={22} />
                <span className="text-[0.8125rem] font-medium">Count</span>
              </span>
            </button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setCount(0);
                setMessage("Counter reset.");
              }}
              aria-label="Reset counter"
            >
              <RefreshIcon width={18} height={18} />
            </Button>
          </div>
          <p className="mt-4 text-[0.75rem] text-mute">
            Press the space bar to count without using the mouse.
          </p>
        </div>
      </div>

      <div className="surface rounded-[14px] p-5 sm:p-6">
        <h2 className="font-display text-lg">Phrase</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {DHIKR.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setDhikrId(item.id)}
              aria-pressed={dhikrId === item.id}
              className={cn(
                "rounded-full border px-3.5 py-2 text-[0.8125rem] transition-colors",
                dhikrId === item.id
                  ? "border-emerald/60 bg-emerald-ink text-ivory dark:border-sage/50 dark:bg-emerald-soft"
                  : "border-[color:var(--line)] text-mute hover:border-emerald/40 hover:text-[color:var(--fg)]",
              )}
            >
              {item.transliteration}
            </button>
          ))}
        </div>

        <h2 className="mt-8 font-display text-lg">Target</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Segmented
            label="Target"
            value={customTarget ? "custom" : String(target)}
            onChange={(value) => {
              if (value === "custom") return;
              setCustomTarget("");
              setTarget(Number(value));
            }}
            options={[
              ...TARGETS.map((value) => ({ value: String(value), label: String(value) })),
            ]}
          />
          <label className="flex items-center gap-2 text-[0.8125rem] text-mute">
            Custom
            <input
              type="number"
              min={1}
              value={customTarget}
              onChange={(event) => setCustomTarget(event.target.value)}
              placeholder="e.g. 500"
              aria-label="Custom target"
              className="h-10 w-28 rounded-[10px] border border-[color:var(--line)] bg-[color:var(--surface-raised)] px-3 text-sm"
            />
          </label>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button onClick={saveSession} disabled={pending || count === 0} size="sm">
            Save this session
          </Button>
          {message ? (
            <span role="status" className="text-[0.8125rem] text-mute">
              {message}
            </span>
          ) : null}
        </div>
        {!signedIn ? (
          <p className="mt-3 text-[0.8125rem] text-mute">
            <Link href="/login?next=/tasbeeh" className="link-quiet">
              Sign in
            </Link>{" "}
            to keep a history of your sessions. Your current count is already saved on this device.
          </p>
        ) : null}
      </div>

      {signedIn ? (
        <div className="surface rounded-[14px] p-5 sm:p-6">
          <h2 className="font-display text-lg">Your recent sessions</h2>
          {history.length === 0 ? (
            <p className="mt-3 text-[0.875rem] text-mute">
              No sessions saved yet. Your counted dhikr will appear here once you save one.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[color:var(--line)]">
              {history.map((session) => (
                <li key={session.id} className="flex items-baseline justify-between gap-3 py-3">
                  <span className="text-[0.875rem]">{session.dhikr}</span>
                  <span className="text-[0.75rem] text-mute">
                    {session.count} of {session.target} ·{" "}
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(session.updatedAt))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <Note>
        These are the phrases most often counted on a tasbeeh. Their wording and reported rewards
        come from the hadith literature — you can read the source collections in the{" "}
        <Link href="/hadith" className="link-quiet">
          hadith library
        </Link>
        . NoorHub only shows your own count and never an aggregate figure.
      </Note>
    </div>
  );
}
