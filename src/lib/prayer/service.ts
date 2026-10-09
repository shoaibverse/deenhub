import {
  CalculationMethod,
  Coordinates,
  Madhab,
  PrayerTimes,
  Qibla,
  SunnahTimes,
} from "adhan";
import rawSources from "@/data/sources.json";
import type { ComputedPrayerTime, NextPrayerInfo, PrayerName } from "@/types";

export const PRAYER_SOURCES = rawSources.prayerTimes;

export const PRAYER_METHODS = [
  { id: "MuslimWorldLeague", label: "Muslim World League" },
  { id: "Egyptian", label: "Egyptian General Authority of Survey" },
  { id: "Karachi", label: "University of Islamic Sciences, Karachi" },
  { id: "UmmAlQura", label: "Umm al-Qura, Makkah" },
  { id: "Dubai", label: "Dubai" },
  { id: "Qatar", label: "Qatar" },
  { id: "Kuwait", label: "Kuwait" },
  { id: "Singapore", label: "Singapore" },
  { id: "Turkey", label: "Diyanet, Turkey" },
  { id: "Tehran", label: "Institute of Geophysics, Tehran" },
  { id: "NorthAmerica", label: "Islamic Society of North America" },
  { id: "MoonsightingCommittee", label: "Moonsighting Committee" },
] as const;

export type PrayerMethodId = (typeof PRAYER_METHODS)[number]["id"];

export function methodLabel(id: string) {
  return PRAYER_METHODS.find((m) => m.id === id)?.label ?? id;
}

const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: "Fajr",
  sunrise: "Sunrise",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

export const PRAYER_ORDER: PrayerName[] = [
  "fajr",
  "sunrise",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

/** The five obligatory prayers (Sunrise is shown for information only). */
export const OBLIGATORY_PRAYERS: PrayerName[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

export type PrayerInput = {
  latitude: number;
  longitude: number;
  date?: Date;
  method?: string;
  asrJuristic?: "standard" | "hanafi";
};

function resolveMethod(method?: string) {
  const id = (PRAYER_METHODS.find((m) => m.id === method)?.id ??
    "MuslimWorldLeague") as PrayerMethodId;
  const factories: Record<
    PrayerMethodId,
    () => ReturnType<typeof CalculationMethod.MuslimWorldLeague>
  > = {
    MuslimWorldLeague: CalculationMethod.MuslimWorldLeague,
    Egyptian: CalculationMethod.Egyptian,
    Karachi: CalculationMethod.Karachi,
    UmmAlQura: CalculationMethod.UmmAlQura,
    Dubai: CalculationMethod.Dubai,
    Qatar: CalculationMethod.Qatar,
    Kuwait: CalculationMethod.Kuwait,
    Singapore: CalculationMethod.Singapore,
    Turkey: CalculationMethod.Turkey,
    Tehran: CalculationMethod.Tehran,
    NorthAmerica: CalculationMethod.NorthAmerica,
    MoonsightingCommittee: CalculationMethod.MoonsightingCommittee,
  };
  return { id, parameters: factories[id]() };
}

export type ComputedPrayers = {
  times: ComputedPrayerTime[];
  method: string;
  methodLabel: string;
  asrJuristic: "standard" | "hanafi";
  middleOfTheNight: string;
  lastThirdOfTheNight: string;
  timezoneOffsetMinutes: number;
};

export function computePrayers(input: PrayerInput): ComputedPrayers {
  const coordinates = new Coordinates(input.latitude, input.longitude);
  const { id, parameters } = resolveMethod(input.method);
  parameters.madhab =
    input.asrJuristic === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  const date = input.date ?? new Date();

  const prayerTimes = new PrayerTimes(coordinates, date, parameters);
  const sunnah = new SunnahTimes(prayerTimes);

  const times: ComputedPrayerTime[] = PRAYER_ORDER.map((name) => ({
    name,
    label: PRAYER_LABELS[name],
    at: (prayerTimes[name] as Date).toISOString(),
  }));

  return {
    times,
    method: id,
    methodLabel: methodLabel(id),
    asrJuristic: input.asrJuristic ?? "standard",
    middleOfTheNight: sunnah.middleOfTheNight.toISOString(),
    lastThirdOfTheNight: sunnah.lastThirdOfTheNight.toISOString(),
    timezoneOffsetMinutes: date.getTimezoneOffset(),
  };
}

export function nextPrayer(
  times: ComputedPrayerTime[],
  now: Date = new Date(),
): NextPrayerInfo {
  const upcoming = times
    .filter((time) => new Date(time.at).getTime() > now.getTime())
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  const upcomingPrayer = upcoming[0] ?? null;

  const currentIndex = times
    .map((time, index) => ({ time, index }))
    .filter(({ time }) => new Date(time.at).getTime() <= now.getTime())
    .pop();

  const rollover = !upcomingPrayer;
  const fallback = times[0];

  return {
    name: (upcomingPrayer ?? fallback).name,
    label: (upcomingPrayer ?? fallback).label,
    at: (upcomingPrayer ?? fallback).at,
    msRemaining: upcomingPrayer
      ? new Date(upcomingPrayer.at).getTime() - now.getTime()
      : 0,
    current: currentIndex && !rollover ? currentIndex.time.name : null,
  };
}

export function qiblaDirection(latitude: number, longitude: number) {
  return Qibla(new Coordinates(latitude, longitude));
}

const MAKKAH = { latitude: 21.4224779, longitude: 39.8251832 };

/** Great-circle distance to the Kaaba, in kilometres. */
export function distanceToMakkah(latitude: number, longitude: number) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(MAKKAH.latitude - latitude);
  const dLon = toRadians(MAKKAH.longitude - longitude);
  const lat1 = toRadians(latitude);
  const lat2 = toRadians(MAKKAH.latitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** A handful of reference cities for manual location selection. */
export const REFERENCE_CITIES: Array<{
  label: string;
  latitude: number;
  longitude: number;
}> = [
  { label: "Makkah, Saudi Arabia", latitude: 21.4225, longitude: 39.8262 },
  { label: "Madinah, Saudi Arabia", latitude: 24.4686, longitude: 39.6142 },
  { label: "Cairo, Egypt", latitude: 30.0444, longitude: 31.2357 },
  { label: "Istanbul, Türkiye", latitude: 41.0082, longitude: 28.9784 },
  { label: "London, United Kingdom", latitude: 51.5072, longitude: -0.1276 },
  { label: "Birmingham, United Kingdom", latitude: 52.4862, longitude: -1.8904 },
  { label: "New York, United States", latitude: 40.7128, longitude: -74.006 },
  { label: "Toronto, Canada", latitude: 43.6532, longitude: -79.3832 },
  { label: "Karachi, Pakistan", latitude: 24.8607, longitude: 67.0011 },
  { label: "Lahore, Pakistan", latitude: 31.5204, longitude: 74.3587 },
  { label: "Dhaka, Bangladesh", latitude: 23.8103, longitude: 90.4125 },
  { label: "Jakarta, Indonesia", latitude: -6.2088, longitude: 106.8456 },
  { label: "Kuala Lumpur, Malaysia", latitude: 3.139, longitude: 101.6869 },
  { label: "Lagos, Nigeria", latitude: 6.5244, longitude: 3.3792 },
  { label: "Nairobi, Kenya", latitude: -1.2921, longitude: 36.8219 },
  { label: "Dubai, UAE", latitude: 25.2048, longitude: 55.2708 },
  { label: "Amman, Jordan", latitude: 31.9454, longitude: 35.9284 },
  { label: "Casablanca, Morocco", latitude: 33.5731, longitude: -7.5898 },
  { label: "Sydney, Australia", latitude: -33.8688, longitude: 151.2093 },
];
