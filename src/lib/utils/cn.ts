import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TIME = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export function formatTime(date: Date | string | number) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return TIME.format(d).replace(/\s/g, " ").toUpperCase();
}

export function formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions) {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  }).format(d);
}

export function formatCountdown(ms: number) {
  if (ms <= 0) return "0m";
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function distanceKm(km: number) {
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString("en-GB")} km`;
}

export function toBearing(deg: number) {
  const normalized = ((deg % 360) + 360) % 360;
  const points = [
    "North",
    "North-East",
    "East",
    "South-East",
    "South",
    "South-West",
    "West",
    "North-West",
  ];
  return points[Math.round(normalized / 45) % 8];
}

export function titleCase(value: string) {
  return value.replace(/(^|\s|-)([a-z])/g, (_, prefix: string, letter: string) => prefix + letter.toUpperCase());
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}
