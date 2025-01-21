'use client';

import { GoogleMap, Marker } from '@react-google-maps/api';
import { useCallback, useEffect, useState } from 'react';

interface HomeMapProps {
  address: string;
  className?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

export function HomeMap({ address, className = '' }: HomeMapProps) {
  const [coordinates, setCoordinates] = useState<google.maps.LatLngLiteral | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getCoordinates() {
      try {
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({ address });

        if (result.results[0]?.geometry?.location) {
          const location = result.results[0].geometry.location;
          setCoordinates({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          setError('Location not found');
        }
      } catch {
        setError('Failed to load map location');
      }
    }

    if (address) {
      void getCoordinates();
    }
  }, [address]);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      if (coordinates) {
        map.setZoom(15);
        map.setCenter(coordinates);
      }
    },
    [coordinates]
  );

  if (error) {
    return (
      <div
        className={`flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
      >
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (!coordinates) {
    return (
      <div
        className={`flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
      >
        <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
      </div>
    );
  }

  return (
    <div className={`h-64 rounded-lg overflow-hidden ${className}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={coordinates}
        zoom={15}
        onLoad={onLoad}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
        }}
      >
        <Marker position={coordinates} />
      </GoogleMap>
    </div>
  );
}
