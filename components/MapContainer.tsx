import React, { useEffect, useRef, useState } from 'react';
import { GeoLocation } from '../types';

interface MapContainerProps {
  location?: GeoLocation;
  onLocationSelect?: (loc: GeoLocation) => void;
  interactive?: boolean;
}

const MapContainer: React.FC<MapContainerProps> = ({ 
  location, 
  onLocationSelect, 
  interactive = true 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    // Basic check if Google Maps script is loaded
    if (!(window as any).google || !(window as any).google.maps) {
      setMapError(true);
      return;
    }

    if (!mapRef.current) return;

    // Default center (e.g., a generic university campus location)
    const center = location || { lat: 37.7749, lng: -122.4194 };

    const map = new (window as any).google.maps.Map(mapRef.current, {
      center: center,
      zoom: 16,
      disableDefaultUI: true,
      styles: [
        {
          featureType: "poi.school",
          elementType: "all",
          stylers: [{ visibility: "on" }, { color: "#e0f2fe" }]
        }
      ]
    });

    const marker = new (window as any).google.maps.Marker({
      position: center,
      map: map,
      title: "Item Location",
      draggable: interactive
    });

    if (interactive && onLocationSelect) {
      map.addListener("click", (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        marker.setPosition({ lat, lng });
        onLocationSelect({ lat, lng });
      });

      marker.addListener("dragend", (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        onLocationSelect({ lat, lng });
      });
    }

  }, [location, interactive, onLocationSelect]);

  if (mapError) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-center p-4">
          <p className="font-medium">Map Unavailable</p>
          <p className="text-sm">API Key required for Google Maps.</p>
          {location && <p className="text-xs mt-2">Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-gray-200 relative group">
      <div ref={mapRef} className="w-full h-full" />
      {interactive && (
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-3 py-1 rounded-md shadow-sm text-xs font-medium text-gray-600 pointer-events-none">
          Click map to pin location
        </div>
      )}
    </div>
  );
};

export default MapContainer;
