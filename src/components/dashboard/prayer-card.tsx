"use client";

import Link from "next/link";
import { usePrayerTimes } from "@/hooks/use-prayer-location";
import { formatCountdown, formatTime } from "@/lib/utils/cn";

export function DashboardPrayerCard() {
  const { computation, next, hasLocation } = usePrayerTimes();

  if (!hasLocation || !next || !computation) {
    return (
      <div className="surface flex h-full flex-col rounded-[14px] p-5">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold">
          Today’s prayer
        </p>
        <p className="mt-3 flex-1 text-[0.875rem] leading-relaxed text-mute">
          Set your location to see today’s prayer times and a countdown to the next prayer.
        </p>
        <Link href="/prayer" className="link-quiet mt-4 text-[0.8125rem]">
          Set your location
        </Link>
      </div>
    );
  }

  return (
    <div className="surface flex h-full flex-col rounded-[14px] p-5">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold">
        Today’s prayer
      </p>
      <p className="mt-3 font-display text-[1.75rem] leading-none">{next.label}</p>
      <p className="mt-1.5 text-[0.875rem] text-mute">
        {formatTime(next.at)} · in {formatCountdown(next.msRemaining)}
      </p>
      <ul className="mt-4 space-y-1.5">
        {computation.times.map((time) => (
          <li
            key={time.name}
            className={
              next.name === time.name
                ? "flex items-baseline justify-between text-[0.8125rem] text-emerald-ink dark:text-sage-soft"
                : "flex items-baseline justify-between text-[0.8125rem] text-mute"
            }
          >
            <span>{time.label}</span>
            <span className="tabular-nums">{formatTime(time.at)}</span>
          </li>
        ))}
      </ul>
      <Link href="/prayer" className="link-quiet mt-4 text-[0.8125rem]">
        Open prayer times
      </Link>
    </div>
  );
}
