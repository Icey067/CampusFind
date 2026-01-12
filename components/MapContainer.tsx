import React, { useEffect, useRef, useState } from 'react';
import * as tt from '@tomtom-international/web-sdk-maps';
import { GeoLocation } from '../types';

// Import CSS for TomTom maps
import '@tomtom-international/web-sdk-maps/dist/maps.css';

interface MapContainerProps {
  location?: GeoLocation;
  onLocationSelect?: (loc: GeoLocation) => void;
  interactive?: boolean;
}

const TOMTOM_KEY = import.meta.env.VITE_TOMTOM_API_KEY;

const MapContainer: React.FC<MapContainerProps> = ({
  location,
  onLocationSelect,
  interactive = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);
  const mapInstance = useRef<tt.Map | null>(null);
  const markerInstance = useRef<tt.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Default center (e.g., a generic university campus location)
    const center: [number, number] = location ? [location.lng, location.lat] : [-122.4194, 37.7749];

    try {
      const map = tt.map({
        key: TOMTOM_KEY,
        container: mapRef.current,
        center: center,
        zoom: 15,
        dragPan: interactive,
        keyboard: interactive,
        doubleClickZoom: interactive
      });

      mapInstance.current = map;

      const marker = new tt.Marker({
        draggable: interactive
      }).setLngLat(center).addTo(map);

      markerInstance.current = marker;

      if (interactive && onLocationSelect) {
        map.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          marker.setLngLat([lng, lat]);
          onLocationSelect({ lat, lng });
        });

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          onLocationSelect({ lat: lngLat.lat, lng: lngLat.lng });
        });
      }

      return () => {
        map.remove();
      };
    } catch (error) {
      console.error('TomTom Map Error:', error);
      setMapError(true);
    }

  }, [location, interactive, onLocationSelect]);

  if (mapError) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-center p-4">
          <p className="font-medium">Map Unavailable</p>
          <p className="text-sm">API Key required for TomTom Maps.</p>
          {location && <p className="text-xs mt-2">Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-gray-200 relative group">
      <div ref={mapRef} className="w-full h-full" />
      {interactive && (
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-3 py-1 rounded-md shadow-sm text-xs font-medium text-gray-600 pointer-events-none z-10">
          Click map to pin location
        </div>
      )}
    </div>
  );
};

export default MapContainer;
