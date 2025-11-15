import { useState, useEffect, useCallback } from 'react';
import { Location } from '@/types';
import { getUserLocation, watchUserLocation, stopWatchingLocation } from '@/lib/utils';
import { useStore } from '@/store/useStore';

interface UseGeolocationOptions {
  watch?: boolean;
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

interface UseGeolocationReturn {
  location: Location | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export function useGeolocation(
  options: UseGeolocationOptions = {}
): UseGeolocationReturn {
  const { watch = false, enableHighAccuracy = true, timeout = 10000, maximumAge = 0 } = options;
  
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const { setUserLocation, setLocationPermission } = useStore();

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const loc = await getUserLocation();
      setLocation(loc);
      setUserLocation(loc);
      setLocationPermission('granted');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get location';
      setError(errorMessage);
      setLocationPermission('denied');
    } finally {
      setLoading(false);
    }
  }, [setUserLocation, setLocationPermission]);

  useEffect(() => {
    if (!watch) {
      fetchLocation();
      return;
    }

    // Watch location for continuous updates
    let watchId: number;
    
    try {
      watchId = watchUserLocation(
        (loc) => {
          setLocation(loc);
          setUserLocation(loc);
          setError(null);
          setLoading(false);
          setLocationPermission('granted');
        },
        (err) => {
          setError(err.message);
          setLoading(false);
          setLocationPermission('denied');
        }
      );
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }

    return () => {
      if (watchId !== undefined) {
        stopWatchingLocation(watchId);
      }
    };
  }, [watch, fetchLocation, setUserLocation, setLocationPermission]);

  return {
    location,
    error,
    loading,
    refetch: fetchLocation,
  };
}
