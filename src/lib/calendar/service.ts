import rawSources from "@/data/sources.json";
import type { HijriDate, IslamicOccasion } from "@/types";

export const CALENDAR_SOURCES = rawSources.hijriCalendar;

const HIJRI_FORMATTER = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const HIJRI_LONG = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const GREGORIAN_LONG = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export const HIJRI_MONTH_NAMES = [
  "Muharram",
  "Safar",
  "Rabiʻ I",
  "Rabiʻ II",
  "Jumada I",
  "Jumada II",
  "Rajab",
  "Shaʻban",
  "Ramadan",
  "Shawwal",
  "Dhuʻal-Qiʻdah",
  "Dhuʻal-Hijjah",
];

/** 1 Muharram 1 AH — 19 July 622 CE in the proleptic Gregorian calendar. */
const HIJRI_EPOCH_UTC = Date.UTC(622, 6, 19);
const MEAN_HIJRI_MONTH_DAYS = 29.530556;
const MEAN_HIJRI_YEAR_DAYS = 354.36707;

function partsFor(date: Date) {
  const parts = HIJRI_FORMATTER.formatToParts(date);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    day: Number(get("day")),
    month: Number(get("month")),
    year: Number(get("year")),
  };
}

export function toHijri(date: Date): HijriDate {
  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12),
  );
  const parts = partsFor(utc);
  const monthName = HIJRI_MONTH_NAMES[parts.month - 1] ?? String(parts.month);
  return {
    ...parts,
    monthName,
    formatted: HIJRI_LONG.format(utc),
  };
}

export function formatGregorian(date: Date) {
  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12),
  );
  return GREGORIAN_LONG.format(utc);
}

/**
 * Converts a Hijri date to its Gregorian date using the Intl conversion as the
 * source of truth. A coarse estimate is refined until the conversion matches.
 */
export function fromHijri(year: number, month: number, day: number): Date {
  const estimateDays =
    (year - 1) * MEAN_HIJRI_YEAR_DAYS +
    (month - 1) * MEAN_HIJRI_MONTH_DAYS +
    (day - 1);
  let candidate = new Date(HIJRI_EPOCH_UTC + estimateDays * 86_400_000);

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const parts = partsFor(candidate);
    const delta =
      (parts.year - year) * MEAN_HIJRI_YEAR_DAYS +
      (parts.month - month) * MEAN_HIJRI_MONTH_DAYS +
      (parts.day - day);
    if (Math.abs(delta) < 0.5) break;
    candidate = new Date(candidate.getTime() - delta * 86_400_000);
  }

  const parts = partsFor(candidate);
  const offsetDays =
    (year - parts.year) * 354 +
    (month - parts.month) * 30 +
    (day - parts.day);
  const finalDate = new Date(candidate.getTime() + offsetDays * 86_400_000);
  return new Date(
    finalDate.getUTCFullYear(),
    finalDate.getUTCMonth(),
    finalDate.getUTCDate(),
  );
}

export function daysInHijriMonth(year: number, month: number) {
  const start = fromHijri(year, month, 1);
  const nextMonth = month === 12 ? fromHijri(year + 1, 1, 1) : fromHijri(year, month + 1, 1);
  return Math.round((nextMonth.getTime() - start.getTime()) / 86_400_000);
}

export type CalendarCell = {
  gregorianDate: Date;
  gregorianDay: number;
  gregorianMonth: number;
  gregorianYear: number;
  weekday: number;
  hijri: HijriDate;
  isFirstOfHijriMonth: boolean;
};

function calendarCell(date: Date, previous: HijriDate | null): CalendarCell {
  const hijri = toHijri(date);
  return {
    gregorianDate: date,
    gregorianDay: date.getDate(),
    gregorianMonth: date.getMonth() + 1,
    gregorianYear: date.getFullYear(),
    weekday: date.getDay(),
    hijri,
    isFirstOfHijriMonth: previous ? previous.month !== hijri.month : true,
  };
}

export function buildGregorianMonth(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month - 1, 1);
  const days = new Date(year, month, 0).getDate();
  const cells: CalendarCell[] = [];
  let previous: HijriDate | null = null;
  for (let day = 1; day <= days; day += 1) {
    const date = new Date(year, month - 1, day);
    cells.push(calendarCell(date, previous));
    previous = cells[cells.length - 1].hijri;
  }
  void first;
  return cells;
}

export function buildHijriMonth(year: number, month: number): CalendarCell[] {
  const days = daysInHijriMonth(year, month);
  const cells: CalendarCell[] = [];
  let previous: HijriDate | null = null;
  for (let day = 1; day <= days; day += 1) {
    const date = fromHijri(year, month, day);
    cells.push(calendarCell(date, previous));
    previous = cells[cells.length - 1].hijri;
  }
  return cells;
}

/**
 * Occasions are derived from the calendar conversion for the requested Hijri
 * year — no Gregorian dates are hard-coded.
 */
export const ISLAMIC_OCCASIONS: IslamicOccasion[] = [
  {
    id: "islamic-new-year",
    name: "Islamic New Year",
    hijri: { month: 1, day: 1 },
    note: "First day of Muharram.",
  },
  {
    id: "ashura",
    name: "Day of Ashura",
    hijri: { month: 1, day: 10 },
    note: "10 Muharram. Observed with fasting by many.",
  },
  {
    id: "mawlid",
    name: "Mawlid an-Nabi",
    hijri: { month: 3, day: 12 },
    note: "12 Rabiʻ al-Awwal. Observed differently across communities.",
  },
  {
    id: "isra-miraj",
    name: "Isra and Miʻraj",
    hijri: { month: 7, day: 27 },
    note: "27 Rajab by the common convention; dating is debated.",
  },
  {
    id: "ramadan-start",
    name: "First of Ramadan",
    hijri: { month: 9, day: 1 },
    note: "The month of fasting begins; confirmed by local moon sighting.",
  },
  {
    id: "laylat-al-qadr",
    name: "Laylat al-Qadr (sought)",
    hijri: { month: 9, day: 27 },
    note: "Its exact night is not established; many seek it in the last ten nights.",
  },
  {
    id: "eid-al-fitr",
    name: "Eid al-Fitr",
    hijri: { month: 10, day: 1 },
    note: "1 Shawwal, confirmed by local moon sighting.",
  },
  {
    id: "day-of-arafah",
    name: "Day of Arafah",
    hijri: { month: 12, day: 9 },
    note: "9 Dhuʻal-Hijjah, the main day of Hajj.",
  },
  {
    id: "eid-al-adha",
    name: "Eid al-Adha",
    hijri: { month: 12, day: 10 },
    note: "10 Dhuʻal-Hijjah.",
  },
];

export function occasionsForHijriYear(year: number) {
  return ISLAMIC_OCCASIONS.map((occasion) => {
    const date = fromHijri(year, occasion.hijri.month, occasion.hijri.day);
    return { ...occasion, gregorianDate: date };
  }).sort((a, b) => a.gregorianDate.getTime() - b.gregorianDate.getTime());
}

export function findOccasion(hijri: HijriDate) {
  return ISLAMIC_OCCASIONS.find(
    (occasion) =>
      occasion.hijri.month === hijri.month && occasion.hijri.day === hijri.day,
  );
}
