"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePrayerTimes } from "@/hooks/use-prayer-location";
import { toHijri } from "@/lib/calendar/service";
import { formatCountdown, formatTime } from "@/lib/utils/cn";
import { Skeleton } from "@/components/ui/primitives";
import { ClockIcon, LocationIcon } from "@/components/ui/icons";
import { ur } from "@/lib/i18n";

const HIJRI_MONTHS_UR = [
  "Muharram / محرم",
  "Safar / صفر",
  "Rabiʻ I / ربیع الاول",
  "Rabiʻ II / ربیع الثانی",
  "Jumada I / جمادی الاول",
  "Jumada II / جمادی الثانی",
  "Rajab / رجب",
  "Shaʻban / شعبان",
  "Ramadan / رمضان",
  "Shawwal / شوال",
  "Dhuʻal-Qiʻdah / ذوالقعدہ",
  "Dhuʻal-Hijjah / ذوالحجہ",
];

const PRAYER_BILINGUAL: Record<string, string> = {
  fajr: "Fajr · فجر",
  sunrise: "Sunrise · طلوع",
  dhuhr: "Dhuhr · ظہر",
  asr: "Asr · عصر",
  maghrib: "Maghrib · مغرب",
  isha: "Isha · عشاء",
};

export function DailyOverview() {
  const { computation, next, now, hasLocation } = usePrayerTimes();

  const hijri = useMemo(() => (now ? toHijri(now) : null), [now]);
  const hijriLabel = hijri
    ? `${hijri.day} ${HIJRI_MONTHS_UR[hijri.month - 1] ?? ""} ${hijri.year} AH / ہجری`
    : null;

  return (
    <section aria-labelledby="today-heading" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <h2 id="today-heading" className="sr-only">
        {ur.home.todayHeading}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface rounded-[14px] p-5">
          <p className="text-[0.75rem] font-semibold text-gold">{ur.home.todaysDate}</p>
          {hijriLabel ? (
            <>
              <p className="mt-2 font-display text-[1.0625rem] leading-loose">{hijriLabel}</p>
              <p className="mt-1 text-[0.875rem] text-mute">
                {now
                  ? new Intl.DateTimeFormat("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(now)
                  : ""}
              </p>
            </>
          ) : (
            <Skeleton className="mt-3 h-6 w-40" />
          )}
          <p className="mt-3 text-[0.75rem] leading-loose text-mute">
            Umm al-Qura calculation. Local moon sighting may differ by a day.
          </p>
        </div>

        <div className="surface rounded-[14px] p-5">
          <p className="text-[0.75rem] font-semibold text-gold">{ur.home.nextPrayer}</p>
          {hasLocation && next && computation ? (
            <>
              <p className="mt-2 font-display text-[1.25rem] leading-loose">
                {PRAYER_BILINGUAL[next.name] ?? next.label}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-[0.875rem] text-mute">
                <ClockIcon width={15} height={15} />
                {formatTime(next.at)} · in {formatCountdown(next.msRemaining)}
              </p>
              <p className="mt-3 flex items-start gap-1.5 text-[0.75rem] leading-loose text-mute">
                <LocationIcon width={14} height={14} className="mt-1 shrink-0" />
                {computation.methodLabel}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-[0.9375rem] leading-loose text-mute">
                {ur.prayer.noLocationHelp}
              </p>
              <Link href="/prayer" className="link-quiet mt-3 inline-flex text-[0.875rem]">
                {ur.prayer.setLocation}
              </Link>
            </>
          )}
        </div>

        <div className="surface rounded-[14px] p-5">
          <p className="text-[0.75rem] font-semibold text-gold">{ur.home.quranProgress}</p>
          <p className="mt-2 text-[0.9375rem] leading-loose text-mute">
            Open the Quran and your reading position is remembered on this device.
          </p>
          <Link href="/quran/1" className="link-quiet mt-3 inline-flex text-[0.875rem]">
            Surah Al-Fatiha · سورۃ الفاتحہ
          </Link>
        </div>

        <div className="surface rounded-[14px] p-5">
          <p className="text-[0.75rem] font-semibold text-gold">{ur.home.prayerTimes}</p>
          {computation ? (
            <ul className="mt-2 space-y-1.5">
              {computation.times
                .filter((time) => time.name !== "sunrise")
                .map((time) => (
                  <li
                    key={time.name}
                    className={
                      next?.name === time.name
                        ? "flex items-baseline justify-between text-[0.875rem] text-emerald-ink dark:text-sage-soft"
                        : "flex items-baseline justify-between text-[0.875rem] text-mute"
                    }
                  >
                    <span>{PRAYER_BILINGUAL[time.name] ?? time.label}</span>
                    <span className="tabular-nums">{formatTime(time.at)}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <ul className="mt-2 space-y-2">
              {[0, 1, 2, 3, 4].map((index) => (
                <Skeleton key={index} className="h-4 w-full" />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
