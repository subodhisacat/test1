

'use client';
import React, { useEffect } from 'react';


import { useState } from 'react';

function LocationRequest() {
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (navigator.geolocation && !tried) {
      // Try watchPosition for more reliable permission prompt
      const watchId = navigator.geolocation.watchPosition(
        () => {},
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      setTried(true);
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [tried]);

  // Fallback button for manual request
  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {}, () => {});
    }
  };

  return (
    <button
      style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, opacity: 0 }}
      aria-label="Request location"
      onClick={requestLocation}
      tabIndex={-1}
    >
      Request Location
    </button>
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
