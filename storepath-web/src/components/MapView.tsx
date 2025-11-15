'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Location, StoreWithDistance } from '@/types';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { Spinner } from './ui/spinner';

interface MapViewProps {
  center: Location;
  stores: StoreWithDistance[];
  selectedStoreId?: string;
  onStoreClick?: (storeId: string) => void;
  showRoute?: boolean;
  destination?: Location;
  className?: string;
}

export function MapView({
  center,
  stores,
  selectedStoreId,
  onStoreClick,
  showRoute = false,
  destination,
  className = 'h-96',
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);
  const { isLoaded, loadError } = useGoogleMaps();

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    const newMap = new google.maps.Map(mapRef.current, {
      center: { lat: center.lat, lng: center.lng },
      zoom: 13,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    setMap(newMap);

    // Add user location marker
    new google.maps.Marker({
      position: { lat: center.lat, lng: center.lng },
      map: newMap,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      title: 'Your Location',
    });
  }, [isLoaded, map, center]);

  // Update store markers
  useEffect(() => {
    if (!map || !isLoaded) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));

    // Create new markers for stores
    const newMarkers = stores.map((store) => {
      const marker = new google.maps.Marker({
        position: { lat: store.location.lat, lng: store.location.lng },
        map: map,
        title: store.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${
              selectedStoreId === store.id ? '#10B981' : '#3B82F6'
            }">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
        },
        animation:
          selectedStoreId === store.id
            ? google.maps.Animation.BOUNCE
            : undefined,
      });

      // Add click listener
      marker.addListener('click', () => {
        onStoreClick?.(store.id);
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${store.name}</h3>
            <p style="font-size: 14px; color: #666;">
              ${store.distance}km away • ${store.duration} min
            </p>
            <p style="font-size: 14px; color: ${store.isOpen ? '#10B981' : '#EF4444'};">
              ${store.isOpen ? 'Open Now' : 'Closed'}
            </p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: center.lat, lng: center.lng });
      newMarkers.forEach((marker) => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      map.fitBounds(bounds);
    }
  }, [map, stores, selectedStoreId, onStoreClick, isLoaded, center]);

  // Show route if needed
  useEffect(() => {
    if (!map || !showRoute || !destination || !isLoaded) return;

    // Clear existing route
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }

    const renderer = new google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#4285F4',
        strokeWeight: 5,
      },
    });

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: { lat: center.lat, lng: center.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          renderer.setDirections(result);
        }
      }
    );

    setDirectionsRenderer(renderer);
  }, [map, showRoute, destination, center, isLoaded, directionsRenderer]);

  if (loadError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <p className="text-red-600">Error loading map</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <Spinner size="lg" />
      </div>
    );
  }

  return <div ref={mapRef} className={`${className} rounded-lg shadow-lg`} />;
}
