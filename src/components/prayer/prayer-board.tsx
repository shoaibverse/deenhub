"use client";

import { usePrayerTimes, useStoredLocation } from "@/hooks/use-prayer-location";
import { Button, IconButton } from "@/components/ui/button";
import { ErrorState, Note, Segmented, inputClass } from "@/components/ui/primitives";
import { LocationIcon, RefreshIcon } from "@/components/ui/icons";
import { PRAYER_METHODS, REFERENCE_CITIES } from "@/lib/prayer/service";
import { formatCountdown, formatTime } from "@/lib/utils/cn";
import { cn } from "@/lib/utils/cn";

export function PrayerBoard() {
  const { location, loaded, status, requestDeviceLocation, setManualLocation, clearLocation } =
    useStoredLocation();
  const { computation, next, now } = usePrayerTimes();

  return (
    <div className="space-y-8">
      {/* Location ---------------------------------------------------------- */}
      <section className="surface rounded-[14px] p-5 sm:p-6">
        <h2 className="font-display text-lg">Location</h2>
        <p className="mt-1.5 text-[0.875rem] leading-relaxed text-mute">
          NoorHub does not guess where you are. Allow location access, or pick a place manually.
          Coordinates and your calculation method stay only in this browser.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button onClick={requestDeviceLocation} size="sm">
            <LocationIcon width={16} height={16} />
            {status === "requesting" ? "Requesting…" : "Use my location"}
          </Button>
          <div className="min-w-[14rem] flex-1">
            <label htmlFor="city" className="sr-only">
              Choose a city
            </label>
            <select
              id="city"
              value=""
              onChange={(event) => {
                const city = REFERENCE_CITIES.find((item) => item.label === event.target.value);
                if (!city) return;
                setManualLocation({
                  label: city.label,
                  latitude: city.latitude,
                  longitude: city.longitude,
                  source: "manual",
                  method: location?.method ?? "MuslimWorldLeague",
                  asrJuristic: location?.asrJuristic ?? "standard",
                });
              }}
              className={cn(inputClass, "h-10")}
            >
              <option value="">Choose a city…</option>
              {REFERENCE_CITIES.map((city) => (
                <option key={city.label} value={city.label}>
                  {city.label}
                </option>
              ))}
            </select>
          </div>
          {location ? (
            <Button variant="ghost" size="sm" onClick={clearLocation}>
              Clear
            </Button>
          ) : null}
        </div>

        {status === "denied" ? (
          <p role="alert" className="mt-4 text-[0.8125rem] text-red-700 dark:text-red-300">
            Location permission was declined. You can still choose a city from the list.
          </p>
        ) : null}
        {status === "unavailable" ? (
          <p role="alert" className="mt-4 text-[0.8125rem] text-red-700 dark:text-red-300">
            This browser does not provide location. Choose a city from the list instead.
          </p>
        ) : null}

        {loaded && location ? (
          <p className="mt-4 text-[0.8125rem] text-mute">
            {location.label} · {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="method" className="mb-1.5 block text-[0.8125rem] font-medium">
              Calculation method
            </label>
            <select
              id="method"
              value={location?.method ?? "MuslimWorldLeague"}
              onChange={(event) =>
                location &&
                setManualLocation({ ...location, method: event.target.value })
              }
              disabled={!location}
              className={cn(inputClass, "h-10")}
            >
              {PRAYER_METHODS.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="mb-1.5 block text-[0.8125rem] font-medium">Asr calculation</span>
            <Segmented
              label="Asr calculation"
              value={location?.asrJuristic ?? "standard"}
              onChange={(value) =>
                location &&
                setManualLocation({
                  ...location,
                  asrJuristic: value as "standard" | "hanafi",
                })
              }
              options={[
                { value: "standard", label: "Standard" },
                { value: "hanafi", label: "Hanafi" },
              ]}
            />
          </div>
        </div>

        {location ? (
          <p className="mt-5 text-[0.8125rem] leading-relaxed text-mute">
            This location and calculation method are saved automatically in this browser only. No
            account or database is used.
          </p>
        ) : null}
      </section>

      {/* Times ------------------------------------------------------------- */}
      {!loaded ? (
        <div className="grid gap-4 sm:grid-cols-3" aria-busy="true">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="skeleton h-24 rounded-[14px]" />
          ))}
        </div>
      ) : !location ? (
        <ErrorState
          title="No location selected"
          description="Prayer times are calculated from your coordinates. Choose a city above or allow location access."
          onRetry={requestDeviceLocation}
          retryLabel="Try again"
        />
      ) : !computation ? (
        <ErrorState
          title="We couldn't calculate prayer times"
          description="The calculation did not complete for these coordinates and method. Try a different method or a nearby city."
        />
      ) : (
        <>
          <section className="surface rounded-[14px] p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold">
                  Next prayer
                </p>
                <p className="mt-2 font-display text-[2rem] leading-none">{next?.label ?? "—"}</p>
                <p className="mt-2 text-[0.9375rem] text-mute">
                  {next ? `${formatTime(next.at)} · in ${formatCountdown(next.msRemaining)}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[0.8125rem] text-mute">
                  {now
                    ? new Intl.DateTimeFormat("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(now)
                    : ""}
                </p>
                <p className="mt-1 text-[0.75rem] text-mute">{computation.methodLabel}</p>
                <p className="mt-1 text-[0.75rem] text-mute">
                  {computation.asrJuristic === "hanafi" ? "Asr: Hanafi" : "Asr: Standard"}
                </p>
              </div>
            </div>
          </section>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {computation.times.map((time) => {
              const isNext = next?.name === time.name;
              return (
                <li
                  key={time.name}
                  className={cn(
                    "rounded-[14px] border p-4 transition-colors",
                    isNext
                      ? "border-emerald/50 bg-emerald-ink text-ivory dark:border-sage/50 dark:bg-emerald-soft"
                      : "border-[color:var(--line)] bg-[color:var(--surface-raised)]",
                  )}
                >
                  <p
                    className={cn(
                      "text-[0.6875rem] font-semibold uppercase tracking-[0.14em]",
                      isNext ? "text-gold-pale" : "text-gold",
                    )}
                  >
                    {time.label}
                    {time.name === "sunrise" ? " (not a prayer)" : ""}
                  </p>
                  <p
                    className={cn(
                      "mt-2 font-display text-[1.5rem] leading-none tabular-nums",
                      isNext ? "" : "",
                    )}
                  >
                    {formatTime(time.at)}
                  </p>
                </li>
              );
            })}
          </ul>

          <section className="surface rounded-[14px] p-5">
            <h2 className="font-display text-lg">Night portions</h2>
            <p className="mt-1.5 text-[0.875rem] text-mute">
              Calculated by the adhan-js library from the same method.
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-baseline justify-between border-b border-[color:var(--line)] pb-2">
                <dt className="text-[0.875rem]">Middle of the night</dt>
                <dd className="text-[0.875rem] tabular-nums">
                  {formatTime(computation.middleOfTheNight)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-b border-[color:var(--line)] pb-2">
                <dt className="text-[0.875rem]">Last third of the night</dt>
                <dd className="text-[0.875rem] tabular-nums">
                  {formatTime(computation.lastThirdOfTheNight)}
                </dd>
              </div>
            </dl>
          </section>

          <Note>
            Times are calculated on your device with the{" "}
            <a
              href="https://github.com/batoulapps/adhan-js"
              className="link-quiet"
              rel="noreferrer noopener"
              target="_blank"
            >
              adhan-js
            </a>{" "}
            library. They can differ by a minute or two from your local mosque, which may follow a
            different method or observation.
          </Note>
        </>
      )}
    </div>
  );
}

export function RefreshButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <IconButton label={label} onClick={onClick} variant="secondary">
      <RefreshIcon width={16} height={16} />
    </IconButton>
  );
}
