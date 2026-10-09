"use client";

import { useState } from "react";
import Link from "next/link";
import { usePreferences } from "@/components/providers/preferences-provider";
import { ThemeSegmented } from "@/components/navigation/theme-toggle";
import { Button } from "@/components/ui/button";
import { Field, Note, Segmented, inputClass } from "@/components/ui/primitives";
import { useStoredLocation } from "@/hooks/use-prayer-location";
import { ARABIC_FONT_MAX, ARABIC_FONT_MIN } from "@/lib/preferences";
import { RECITERS, TRANSLATIONS } from "@/lib/quran/service";
import { PRAYER_METHODS, REFERENCE_CITIES } from "@/lib/prayer/service";
import { clearAllNoorHubLocalData } from "@/lib/local-data";
import { cn } from "@/lib/utils/cn";

export function SettingsForm() {
  const { preferences, update, reset } = usePreferences();
  const { location, requestDeviceLocation, setManualLocation, clearLocation } = useStoredLocation();
  const [message, setMessage] = useState<string | null>(null);

  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-8">
      <section className="surface rounded-[14px] p-5 sm:p-6">
        <h2 className="font-display text-lg">Appearance</h2>
        <div className="mt-5 space-y-6">
          <div>
            <p className="text-[0.8125rem] font-medium">Theme</p>
            <p className="mt-1 text-[0.75rem] text-mute">
              Dark is the default. System follows your device setting.
            </p>
            <div className="mt-3">
              <ThemeSegmented />
            </div>
          </div>

          <div>
            <label htmlFor="arabic-size" className="text-[0.8125rem] font-medium">
              Arabic text size
            </label>
            <p className="mt-1 text-[0.75rem] text-mute">
              Applies to the Quran, hadith and duas. Currently {preferences.arabicFontSize}px.
            </p>
            <input
              id="arabic-size"
              type="range"
              min={ARABIC_FONT_MIN}
              max={ARABIC_FONT_MAX}
              step={2}
              value={preferences.arabicFontSize}
              onChange={(event) => update({ arabicFontSize: Number(event.target.value) })}
              className="mt-3 w-full accent-emerald"
            />
            <p
              className="font-arabic mt-3 text-right leading-[2]"
              lang="ar"
              dir="rtl"
              style={{ fontSize: `${preferences.arabicFontSize}px` }}
            >
              ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ
            </p>
          </div>
        </div>
      </section>

      <section className="surface rounded-[14px] p-5 sm:p-6">
        <h2 className="font-display text-lg">Quran reading</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Translation" htmlFor="settings-translation">
            <select
              id="settings-translation"
              value={preferences.translationEdition}
              onChange={(event) => update({ translationEdition: event.target.value })}
              className={cn(inputClass, "h-11")}
            >
              {TRANSLATIONS.map((translation) => (
                <option key={translation.id} value={translation.id}>
                  {translation.name}
                </option>
              ))}
              <option value="">Arabic only</option>
            </select>
          </Field>

          <Field label="Reciter" htmlFor="settings-reciter">
            <select
              id="settings-reciter"
              value={preferences.reciter}
              onChange={(event) => update({ reciter: event.target.value })}
              className={cn(inputClass, "h-11")}
            >
              {RECITERS.map((reciter) => (
                <option key={reciter.id} value={reciter.id}>
                  {reciter.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => update({ showTranslation: !preferences.showTranslation })}
            aria-pressed={preferences.showTranslation}
            className={cn(
              "rounded-full border px-3.5 py-2 text-[0.8125rem]",
              preferences.showTranslation
                ? "border-emerald/50 text-emerald-ink dark:text-sage-soft"
                : "border-[color:var(--line)] text-mute",
            )}
          >
            Show translation
          </button>
          <button
            type="button"
            onClick={() => update({ showTransliteration: !preferences.showTransliteration })}
            aria-pressed={preferences.showTransliteration}
            className={cn(
              "rounded-full border px-3.5 py-2 text-[0.8125rem]",
              preferences.showTransliteration
                ? "border-emerald/50 text-emerald-ink dark:text-sage-soft"
                : "border-[color:var(--line)] text-mute",
            )}
          >
            Show transliteration
          </button>
        </div>
      </section>

      <section className="surface rounded-[14px] p-5 sm:p-6">
        <h2 className="font-display text-lg">Prayer</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Calculation method" htmlFor="settings-method">
            <select
              id="settings-method"
              value={location?.method ?? preferences.prayerMethod}
              onChange={(event) => {
                update({ prayerMethod: event.target.value });
                if (location) setManualLocation({ ...location, method: event.target.value });
              }}
              className={cn(inputClass, "h-11")}
            >
              {PRAYER_METHODS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <div>
            <p className="text-[0.8125rem] font-medium">Asr calculation</p>
            <div className="mt-2">
              <Segmented
                label="Asr calculation"
                value={location?.asrJuristic ?? preferences.asrJuristic}
                onChange={(value) => {
                  update({ asrJuristic: value });
                  if (location) setManualLocation({ ...location, asrJuristic: value });
                }}
                options={[
                  { value: "standard", label: "Standard" },
                  { value: "hanafi", label: "Hanafi" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Location" htmlFor="settings-location" hint="Stored only in this browser">
            <select
              id="settings-location"
              value=""
              onChange={(event) => {
                const city = REFERENCE_CITIES.find((item) => item.label === event.target.value);
                if (!city) return;
                setManualLocation({
                  label: city.label,
                  latitude: city.latitude,
                  longitude: city.longitude,
                  source: "manual",
                  method: location?.method ?? preferences.prayerMethod,
                  asrJuristic: location?.asrJuristic ?? preferences.asrJuristic,
                });
                notify("Location saved in this browser.");
              }}
              className={cn(inputClass, "h-11")}
            >
              <option value="">{location?.label || "Choose a city…"}</option>
              {REFERENCE_CITIES.map((city) => (
                <option key={city.label} value={city.label}>
                  {city.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex flex-wrap items-end gap-2">
            <Button variant="secondary" size="sm" onClick={requestDeviceLocation}>
              Use current location
            </Button>
            {location ? (
              <Button variant="ghost" size="sm" onClick={clearLocation}>
                Clear location
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="surface rounded-[14px] p-5 sm:p-6">
        <h2 className="font-display text-lg">Privacy and local data</h2>
        <p className="mt-2 text-[0.875rem] leading-relaxed text-mute">
          NoorHub stores preferences, bookmarks, favorites, Quran progress, location and Tasbeeh
          history in this browser’s local storage. It does not send personal data to a NoorHub
          database because no database connection is used.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              reset();
              notify("Reading and appearance preferences reset.");
            }}
          >
            Reset preferences
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (!window.confirm("Clear all NoorHub data saved in this browser? This cannot be undone.")) {
                return;
              }
              clearAllNoorHubLocalData();
              notify("All local NoorHub data cleared.");
              window.setTimeout(() => window.location.reload(), 500);
            }}
          >
            Clear all local data
          </Button>
        </div>
        <p className="mt-4 text-[0.75rem] text-mute">
          <Link href="/privacy" className="link-quiet">
            Read the privacy page
          </Link>
          . Clearing browser site data has the same effect.
        </p>
      </section>

      {message ? (
        <p role="status" className="text-[0.875rem] text-gold">
          {message}
        </p>
      ) : null}

      <Note>
        Changes save automatically on this device. There is no sign-in, cloud sync or database.
      </Note>
    </div>
  );
}
