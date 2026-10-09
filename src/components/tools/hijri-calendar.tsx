"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Segmented } from "@/components/ui/primitives";
import {
  buildGregorianMonth,
  buildHijriMonth,
  findOccasion,
  formatGregorian,
  occasionsForHijriYear,
  toHijri,
} from "@/lib/calendar/service";
import { cn } from "@/lib/utils/cn";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HijriCalendar({ today = new Date() }: { today?: Date }) {
  const todayHijri = useMemo(() => toHijri(today), [today]);
  const [view, setView] = useState<"gregorian" | "hijri">("gregorian");
  const [gregorianCursor, setGregorianCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  });
  const [hijriCursor, setHijriCursor] = useState({
    year: todayHijri.year,
    month: todayHijri.month,
  });

  const cells = useMemo(() => {
    if (view === "gregorian") {
      return buildGregorianMonth(gregorianCursor.year, gregorianCursor.month);
    }
    return buildHijriMonth(hijriCursor.year, hijriCursor.month);
  }, [view, gregorianCursor, hijriCursor]);

  const occasions = useMemo(() => occasionsForHijriYear(todayHijri.year), [todayHijri.year]);

  const leadingBlanks = cells[0]?.weekday ?? 0;
  const label =
    view === "gregorian"
      ? new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
          new Date(gregorianCursor.year, gregorianCursor.month - 1, 1),
        )
      : `${cells[0]?.hijri.monthName ?? ""} ${hijriCursor.year} AH`;

  const shift = (direction: 1 | -1) => {
    if (view === "gregorian") {
      const next = new Date(gregorianCursor.year, gregorianCursor.month - 1 + direction, 1);
      setGregorianCursor({ year: next.getFullYear(), month: next.getMonth() + 1 });
      return;
    }
    let year = hijriCursor.year;
    let month = hijriCursor.month + direction;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    setHijriCursor({ year, month });
  };

  const isToday = (cell: (typeof cells)[number]) =>
    cell.gregorianYear === today.getFullYear() &&
    cell.gregorianMonth === today.getMonth() + 1 &&
    cell.gregorianDay === today.getDate();

  return (
    <div className="space-y-8">
      <div className="surface rounded-[14px] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold">
              Today
            </p>
            <p className="mt-2 font-display text-[1.375rem] leading-snug">{todayHijri.formatted}</p>
            <p className="mt-1 text-[0.875rem] text-mute">{formatGregorian(today)}</p>
          </div>
          <Segmented
            label="Calendar view"
            value={view}
            onChange={setView}
            options={[
              { value: "gregorian", label: "Gregorian" },
              { value: "hijri", label: "Hijri" },
            ]}
          />
        </div>
      </div>

      <div className="surface rounded-[14px] p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Previous month"
            className="inline-flex size-10 items-center justify-center rounded-full border border-[color:var(--line)] text-mute hover:border-emerald/40"
          >
            ←
          </button>
          <p className="font-display text-[1.0625rem]">{label}</p>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Next month"
            className="inline-flex size-10 items-center justify-center rounded-full border border-[color:var(--line)] text-mute hover:border-emerald/40"
          >
            →
          </button>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((day) => (
            <div key={day} className="pb-2 text-[0.6875rem] uppercase tracking-[0.1em] text-mute">
              {day}
            </div>
          ))}
          {Array.from({ length: leadingBlanks }).map((_, index) => (
            <div key={`blank-${index}`} />
          ))}
          {cells.map((cell) => {
            const occasion = findOccasion(cell.hijri);
            return (
              <div
                key={cell.gregorianDate.toISOString()}
                className={cn(
                  "flex min-h-[3.75rem] flex-col items-center justify-start rounded-[10px] border p-1.5",
                  isToday(cell)
                    ? "border-emerald/60 bg-emerald-ink text-ivory dark:border-sage/50 dark:bg-emerald-soft"
                    : occasion
                      ? "border-gold/50"
                      : "border-transparent",
                )}
              >
                <span className="text-[0.9375rem] tabular-nums">{cell.gregorianDay}</span>
                <span
                  className={cn(
                    "text-[0.6875rem] tabular-nums",
                    isToday(cell) ? "text-gold-pale" : "text-mute",
                  )}
                >
                  {cell.hijri.day}
                </span>
                {occasion ? (
                  <span
                    className="mt-0.5 line-clamp-1 text-[0.5625rem] text-gold"
                    title={occasion.name}
                  >
                    {occasion.name}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[0.75rem] leading-relaxed text-mute">
          {view === "gregorian"
            ? "Each cell shows the Gregorian date with the Hijri day beside it."
            : "Each cell shows the Hijri day beside its Gregorian date."}
        </p>
      </div>

      <div className="surface rounded-[14px] p-5 sm:p-6">
        <h2 className="font-display text-lg">
          Notable dates in {todayHijri.year} AH
        </h2>
        <p className="mt-1.5 text-[0.875rem] leading-relaxed text-mute">
          Dates are computed from the calendar conversion, not copied from a list. Actual dates
          depend on local moon sighting and can differ by a day.
        </p>
        <ul className="mt-5 divide-y divide-[color:var(--line)]">
          {occasions.map((occasion) => (
            <li key={occasion.id} className="flex flex-wrap items-baseline gap-x-3 py-3">
              <span className="w-40 shrink-0 text-[0.875rem] tabular-nums">
                {formatGregorian(occasion.gregorianDate)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.9375rem]">{occasion.name}</span>
                <span className="block text-[0.75rem] text-mute">{occasion.note}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[0.75rem] text-mute">
          NoorHub does not list dates whose timing is not established, such as Laylat al-Qadr, as
          fixed calendar days.{" "}
          <Link href="/about#sources" className="link-quiet">
            See sources
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
