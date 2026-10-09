"use client";

import { useEffect, useState } from "react";
import { useStoredLocation } from "@/hooks/use-prayer-location";
import { Button } from "@/components/ui/button";
import { ErrorState, Note, inputClass } from "@/components/ui/primitives";
import { LocationIcon } from "@/components/ui/icons";
import { REFERENCE_CITIES, distanceToMakkah, qiblaDirection } from "@/lib/prayer/service";
import { distanceKm, toBearing } from "@/lib/utils/cn";
import { cn } from "@/lib/utils/cn";

type OrientationPermissionState = "idle" | "granted" | "denied" | "unsupported";

type DeviceOrientationEventStatic = {
  requestPermission?: () => Promise<"granted" | "denied">;
};

type CompassOrientationEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

export function QiblaFinder() {
  const { location, loaded, status, requestDeviceLocation, setManualLocation } = useStoredLocation();
  const [heading, setHeading] = useState<number | null>(null);
  const [orientationStatus, setOrientationStatus] = useState<OrientationPermissionState>("idle");
  const [absolute, setAbsolute] = useState(false);

  const bearing = location ? qiblaDirection(location.latitude, location.longitude) : null;
  const distance = location ? distanceToMakkah(location.latitude, location.longitude) : null;
  const rotation = heading !== null && absolute && bearing !== null ? bearing - heading : null;

  useEffect(() => {
    const handler = (rawEvent: DeviceOrientationEvent) => {
      const event = rawEvent as CompassOrientationEvent;
      if (typeof event.webkitCompassHeading === "number") {
        setHeading(event.webkitCompassHeading);
        setAbsolute(true);
        setOrientationStatus("granted");
        return;
      }
      if (event.alpha !== null) {
        setHeading(360 - event.alpha);
        setAbsolute(Boolean(event.absolute));
        setOrientationStatus("granted");
      }
    };
    window.addEventListener("deviceorientationabsolute", handler as EventListener);
    window.addEventListener("deviceorientation", handler as EventListener);
    return () => {
      window.removeEventListener("deviceorientationabsolute", handler as EventListener);
      window.removeEventListener("deviceorientation", handler as EventListener);
    };
  }, []);

  const enableCompass = async () => {
    const constructor = (window as unknown as {
      DeviceOrientationEvent?: DeviceOrientationEventStatic;
    }).DeviceOrientationEvent;
    if (!constructor) {
      setOrientationStatus("unsupported");
      return;
    }
    if (typeof constructor.requestPermission === "function") {
      try {
        const result = await constructor.requestPermission();
        setOrientationStatus(result === "granted" ? "granted" : "denied");
      } catch {
        setOrientationStatus("denied");
      }
      return;
    }
    setOrientationStatus("granted");
  };

  return (
    <div className="space-y-8">
      <section className="surface rounded-[14px] p-5 sm:p-6">
        <h2 className="font-display text-lg">Your location</h2>
        <p className="mt-1.5 text-[0.875rem] leading-relaxed text-mute">
          The qibla bearing is calculated from your coordinates. NoorHub does not assume where you
          are.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button onClick={requestDeviceLocation} size="sm">
            <LocationIcon width={16} height={16} />
            {status === "requesting" ? "Requesting…" : "Use my location"}
          </Button>
          <div className="min-w-[14rem] flex-1">
            <label htmlFor="qibla-city" className="sr-only">
              Choose a city
            </label>
            <select
              id="qibla-city"
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
        </div>
        {status === "denied" ? (
          <p role="alert" className="mt-4 text-[0.8125rem] text-red-700 dark:text-red-300">
            Location permission was declined. Choose a city from the list instead.
          </p>
        ) : null}
        {loaded && location ? (
          <p className="mt-4 text-[0.8125rem] text-mute">
            {location.label} · {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}
          </p>
        ) : null}
      </section>

      {!loaded ? (
        <div className="skeleton mx-auto h-72 w-72 rounded-full" aria-busy="true" />
      ) : !location ? (
        <ErrorState
          title="No location selected"
          description="Choose a city or allow location access to calculate the qibla direction."
          onRetry={requestDeviceLocation}
        />
      ) : (
        <>
          <section className="surface flex flex-col items-center gap-6 rounded-[14px] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="relative mx-auto size-64 shrink-0">
              <div className="absolute inset-0 rounded-full border border-[color:var(--line)]" />
              <div className="absolute inset-6 rounded-full border border-dashed border-[color:var(--line)]" />
              <div
                className="absolute inset-0 transition-transform duration-300 ease-out"
                style={{ transform: rotation !== null ? `rotate(${rotation}deg)` : "none" }}
              >
                <div className="absolute left-1/2 top-2 -translate-x-1/2 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-mute">
                  N
                </div>
                <div className="absolute left-1/2 top-6 h-1/2 w-px -translate-x-1/2 bg-[color:var(--line)]" />
                <div className="absolute left-1/2 top-8 flex -translate-x-1/2 flex-col items-center">
                  <svg viewBox="0 0 24 24" className="size-7 text-gold" aria-hidden="true">
                    <path d="M12 2 14 12H10Z" fill="currentColor" />
                    <rect x="10.5" y="12" width="3" height="8" fill="currentColor" opacity="0.5" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="font-display text-[1.75rem] leading-none tabular-nums">
                  {bearing !== null ? `${bearing.toFixed(1)}°` : "—"}
                </p>
                <p className="mt-1 text-[0.75rem] text-mute">
                  {bearing !== null ? toBearing(bearing) : ""} of true north
                </p>
              </div>
            </div>

            <dl className="grid w-full gap-3 text-[0.875rem] sm:max-w-xs">
              <div className="flex items-baseline justify-between border-b border-[color:var(--line)] pb-2">
                <dt className="text-mute">Qibla bearing</dt>
                <dd className="tabular-nums">{bearing !== null ? `${bearing.toFixed(2)}°` : "—"}</dd>
              </div>
              <div className="flex items-baseline justify-between border-b border-[color:var(--line)] pb-2">
                <dt className="text-mute">Compass heading</dt>
                <dd className="tabular-nums">
                  {heading !== null ? `${heading.toFixed(0)}°` : "Not available"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-b border-[color:var(--line)] pb-2">
                <dt className="text-mute">Distance to the Kaaba</dt>
                <dd className="tabular-nums">{distance !== null ? distanceKm(distance) : "—"}</dd>
              </div>
            </dl>
          </section>

          {orientationStatus === "unsupported" ? (
            <ErrorState
              title="Your device does not provide compass orientation."
              description="You can still find the qibla: face the bearing shown above, measured clockwise from true north. A phone compass app, a map, or the sun's position at a known time can help you orient yourself."
            />
          ) : orientationStatus === "denied" ? (
            <ErrorState
              title="Compass permission declined"
              description="Enable motion and orientation access for this site in your browser settings, or use the bearing above with a separate compass."
              onRetry={enableCompass}
            />
          ) : orientationStatus === "idle" ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" size="sm" onClick={enableCompass}>
                Enable compass
              </Button>
              <p className="text-[0.8125rem] text-mute">
                The dial turns with your device once orientation access is granted.
              </p>
            </div>
          ) : (
            <p className="text-[0.8125rem] text-mute" role="status">
              {absolute
                ? "Compass active. Hold the device flat and rotate until the marker points to the top."
                : "Orientation is being reported relative to your device, not true north. The dial is therefore kept still — use the bearing above."}
            </p>
          )}
        </>
      )}

      <Note>
        The bearing is the great-circle direction to the Kaaba (21.4225° N, 39.8262° E), calculated
        with the same astronomical library as the prayer times. Phone compasses are affected by
        nearby metal, so treat the reading as a guide.
      </Note>
    </div>
  );
}
