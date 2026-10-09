import type { Preferences } from "@/types";

export const DEFAULT_PREFERENCES: Preferences = {
  language: "en",
  theme: "dark",
  arabicFontSize: 30,
  translationEdition: "ur.jalandhry",
  showTranslation: true,
  showTransliteration: true,
  reciter: "ar.alafasy",
  prayerMethod: "MuslimWorldLeague",
  asrJuristic: "standard",
  latitude: null,
  longitude: null,
  locationLabel: null,
  notifyPrayer: false,
};

export const ARABIC_FONT_MIN = 22;
export const ARABIC_FONT_MAX = 46;

export const LOCAL_PREFERENCES_KEY = "noorhub.preferences.v1";
export const RECENT_SEARCHES_KEY = "noorhub.recent-searches.v1";
export const TASBEEH_KEY = "noorhub.tasbeeh.v1";
export const LOCATION_KEY = "noorhub.location.v1";
export const READING_HISTORY_KEY = "noorhub.reading-history.v1";

export type StoredLocation = {
  label: string;
  latitude: number;
  longitude: number;
  source: "device" | "manual";
  method: string;
  asrJuristic: "standard" | "hanafi";
};

/** Reading preferences that are useful without an account. */
export type LocalPreferences = Pick<
  Preferences,
  | "theme"
  | "arabicFontSize"
  | "translationEdition"
  | "showTranslation"
  | "showTransliteration"
  | "reciter"
  | "prayerMethod"
  | "asrJuristic"
>;
