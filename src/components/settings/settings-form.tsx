"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePreferences } from "@/components/providers/preferences-provider";
import { ThemeSegmented } from "@/components/navigation/theme-toggle";
import { Button } from "@/components/ui/button";
import { Field, Note, Segmented, inputClass } from "@/components/ui/primitives";
import { ARABIC_FONT_MAX, ARABIC_FONT_MIN } from "@/lib/preferences";
import { RECITERS, TRANSLATIONS } from "@/lib/quran/service";
import { PRAYER_METHODS, REFERENCE_CITIES } from "@/lib/prayer/service";
import { updatePreferencesAction } from "@/lib/actions/library";
import { updateAccountAction, signOutAction, type AuthState } from "@/lib/actions/auth";
import { cn } from "@/lib/utils/cn";

export function SettingsForm({
  account,
  saved,
}: {
  account: { email: string; displayName: string };
  saved: {
    prayerMethod: string;
    asrJuristic: "standard" | "hanafi";
    latitude: number | null;
    longitude: number | null;
    locationLabel: string | null;
    notifyPrayer: boolean;
  };
}) {
  const { preferences, update } = usePreferences();
  const [method, setMethod] = useState(saved.prayerMethod);
  const [asr, setAsr] = useState<"standard" | "hanafi">(saved.asrJuristic);
  const [location, setLocation] = useState({
    label: saved.locationLabel ?? "",
    latitude: saved.latitude,
    longitude: saved.longitude,
  });
  const [notify, setNotify] = useState(saved.notifyPrayer);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [nameState, nameAction, namePending] = useActionState<AuthState, FormData>(
    updateAccountAction,
    { error: null },
  );
  const router = useRouter();

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const save = () => {
    startTransition(async () => {
      const result = await updatePreferencesAction({
        theme: preferences.theme,
        arabicFontSize: preferences.arabicFontSize,
        translationEdition: preferences.translationEdition,
        showTranslation: preferences.showTranslation,
        showTransliteration: preferences.showTransliteration,
        reciter: preferences.reciter,
        prayerMethod: method,
        asrJuristic: asr,
        latitude: location.latitude,
        longitude: location.longitude,
        locationLabel: location.label || null,
        notifyPrayer: notify,
      });
      setMessage(result.error ?? "Settings saved.");
      router.refresh();
    });
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setMessage("This browser does not provide location.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          label: `Device location (${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)})`,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setMessage("Location captured. Save to keep it with your account.");
      },
      () => setMessage("Location permission was declined."),
      { timeout: 10000 },
    );
  };

  return (
    <div className="space-y-8">
      {/* Appearance ------------------------------------------------------ */}
      <section className="surface rounded-[14px] p-5 sm:p-6">
        <h2 className="font-display text-lg">Appearance</h2>
        <div className="mt-5 space-y-6">
          <div>
            <p className="text-[0.8125rem] font-medium">Theme</p>
            <p className="mt-1 text-[0.75rem] text-mute">
              System follows your device setting. Motion respects your reduced-motion preference.
            </p>
            <div className="mt-3">
              <ThemeSegmented />
            </div>
          </div>

          <div>
            <label
              htmlFor="arabic-size"
              className="text-[0.8125rem] font-medium"
            >
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
              style={{ fontSize: `${preferences.arabicFontSize}px` }}
            >
              ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ
            </p>
          </div>

          <div>
            <p className="text-[0.8125rem] font-medium">Language</p>
            <p className="mt-1 text-[0.75rem] text-mute">
              NoorHub’s interface is available in English. The Quran and duas include Arabic with a
              choice of translation.
            </p>
          </div>
        </div>
      </section>

      {/* Reading --------------------------------------------------------- */}
      <section className="surface rounded-[14px] p-5 sm:p-6">
        <h2 className="font-display text-lg">Reading</h2>
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

      {/* Prayer ---------------------------------------------------------- */}
      <section className="surface rounded-[14px] p-5 sm:p-6">
        <h2 className="font-display text-lg">Prayer</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Calculation method" htmlFor="settings-method">
            <select
              id="settings-method"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
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
                value={asr}
                onChange={setAsr}
                options={[
                  { value: "standard", label: "Standard" },
                  { value: "hanafi", label: "Hanafi" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Location" htmlFor="settings-location" hint="Stored with your account">
            <select
              id="settings-location"
              value=""
              onChange={(event) => {
                const city = REFERENCE_CITIES.find((item) => item.label === event.target.value);
                if (!city) return;
                setLocation({
                  label: city.label,
                  latitude: city.latitude,
                  longitude: city.longitude,
                });
              }}
              className={cn(inputClass, "h-11")}
            >
              <option value="">{location.label || "Choose a city…"}</option>
              {REFERENCE_CITIES.map((city) => (
                <option key={city.label} value={city.label}>
                  {city.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex items-end">
            <Button variant="secondary" size="sm" onClick={requestLocation}>
              Use my current location
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <label className="flex items-center gap-3 text-[0.875rem]">
            <input
              type="checkbox"
              checked={notify}
              onChange={(event) => setNotify(event.target.checked)}
              className="size-4 accent-emerald"
            />
            Save prayer notification preference
          </label>
          <p className="mt-2 text-[0.75rem] leading-relaxed text-mute">
            This stores your choice with your account. NoorHub does not currently send any
            notifications, and it does not ask your browser for notification permission.
          </p>
        </div>
      </section>

      {/* Account --------------------------------------------------------- */}
      <section className="surface rounded-[14px] p-5 sm:p-6">
        <h2 className="font-display text-lg">Account</h2>
        <form action={nameAction} className="mt-5 space-y-5">
          <Field label="Display name" htmlFor="displayName">
            <input
              id="displayName"
              name="displayName"
              defaultValue={account.displayName}
              className={inputClass}
              placeholder="Your name"
            />
          </Field>
          <Field label="Email" htmlFor="email-static" hint="Used only to sign in">
            <input
              id="email-static"
              value={account.email}
              readOnly
              className={cn(inputClass, "text-mute")}
            />
          </Field>
          {nameState.error ? (
            <p role="alert" className="text-[0.8125rem] text-red-700 dark:text-red-300">
              {nameState.error}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" variant="secondary" size="sm" disabled={namePending}>
              {namePending ? "Saving…" : "Update name"}
            </Button>
          </div>
        </form>
        <form action={signOutAction} className="mt-5">
          <button
            type="submit"
            className="rounded-full border border-[color:var(--line)] px-4 py-2 text-[0.8125rem] text-mute hover:border-red-300 hover:text-red-700 dark:hover:border-red-900 dark:hover:text-red-300"
          >
            Sign out
          </button>
        </form>
      </section>

      {/* Privacy --------------------------------------------------------- */}
      <section className="surface rounded-[14px] p-5 sm:p-6">
        <h2 className="font-display text-lg">Privacy</h2>
        <p className="mt-2 text-[0.875rem] leading-relaxed text-mute">
          Reading preferences, your tasbeeh count and your location choice are kept in this browser’s
          local storage so they survive a page reload. Clearing them does not affect your account.
        </p>
        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              try {
                window.localStorage.removeItem("noorhub.preferences.v1");
                window.localStorage.removeItem("noorhub.tasbeeh.v1");
                window.localStorage.removeItem("noorhub.location.v1");
                window.localStorage.removeItem("noorhub.recent-searches.v1");
                setMessage("Local data cleared. Reload the page to see the defaults.");
              } catch {
                setMessage("Local storage is not available in this browser.");
              }
            }}
          >
            Clear local data
          </Button>
        </div>
        <p className="mt-4 text-[0.75rem] text-mute">
          <Link href="/privacy" className="link-quiet">
            Read the privacy page
          </Link>{" "}
          for what is stored on the server.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
        {message ? (
          <span role="status" className="text-[0.875rem] text-mute">
            {message}
          </span>
        ) : null}
      </div>

      <Note>
        Settings are kept in this browser immediately. Choosing “Save settings” also stores them with
        your account so they follow you to another device.
      </Note>
    </div>
  );
}
