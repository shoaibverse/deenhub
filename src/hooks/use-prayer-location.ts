"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LOCATION_KEY,
  type StoredLocation,
} from "@/lib/preferences";
import {
  computePrayers,
  nextPrayer as nextPrayerFromTimes,
  OBLIGATORY_PRAYERS,
  type ComputedPrayers,
} from "@/lib/prayer/service";
import type { NextPrayerInfo } from "@/types";

export function useStoredLocation() {
  const [location, setLocation] = useState<StoredLocation | null>(null);
  const [status, setStatus] = useState<"idle" | "requesting" | "denied" | "unavailable">("idle");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LOCATION_KEY);
      if (raw) setLocation(JSON.parse(raw) as StoredLocation);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((next: StoredLocation | null) => {
    setLocation(next);
    try {
      if (next) window.localStorage.setItem(LOCATION_KEY, JSON.stringify(next));
      else window.localStorage.removeItem(LOCATION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const requestDeviceLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      return;
    }
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        persist({
          label: `Device location (${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)})`,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          source: "device",
          method: location?.method ?? "MuslimWorldLeague",
          asrJuristic: location?.asrJuristic ?? "standard",
        });
        setStatus("idle");
      },
      () => setStatus("denied"),
      { timeout: 10000, maximumAge: 600000 },
    );
  }, [location?.asrJuristic, location?.method, persist]);

  const setManualLocation = useCallback(
    (value: StoredLocation) => {
      persist(value);
      setStatus("idle");
    },
    [persist],
  );

  const clearLocation = useCallback(() => persist(null), [persist]);

  return { location, loaded, status, requestDeviceLocation, setManualLocation, clearLocation };
}

export function usePrayerTimes(options?: {
  latitude?: number | null;
  longitude?: number | null;
  method?: string;
  asrJuristic?: "standard" | "hanafi";
}) {
  const { location } = useStoredLocation();
  const latitude = options?.latitude ?? location?.latitude ?? null;
  const longitude = options?.longitude ?? location?.longitude ?? null;
  const method = options?.method ?? location?.method ?? "MuslimWorldLeague";
  const asrJuristic = options?.asrJuristic ?? location?.asrJuristic ?? "standard";

  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const computation = useMemo<ComputedPrayers | null>(() => {
    if (latitude === null || longitude === null) return null;
    try {
      return computePrayers({ latitude, longitude, method, asrJuristic });
    } catch {
      return null;
    }
  }, [latitude, longitude, method, asrJuristic]);

  const next = useMemo<NextPrayerInfo | null>(() => {
    if (!computation || !now) return null;
    return nextPrayerFromTimes(computation.times, now);
  }, [computation, now]);

  const upcoming = useMemo(
    () => (next ? OBLIGATORY_PRAYERS.filter((name) => name === next.name) : []),
    [next],
  );
  void upcoming;

  return { computation, next, now, hasLocation: latitude !== null && longitude !== null };
}
