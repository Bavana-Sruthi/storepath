import { useQuery } from '@tanstack/react-query';
import { storesApi } from '@/lib/api';
import { Location, StoreWithDistance } from '@/types';
import { useStore } from '@/store/useStore';

interface UseNearbyStoresOptions {
  location: Location | null;
  radius?: number;
  enabled?: boolean;
}

export function useNearbyStores({
  location,
  radius = 10,
  enabled = true,
}: UseNearbyStoresOptions) {
  const { setNearbyStores } = useStore();

  return useQuery({
    queryKey: ['stores', 'nearby', location?.lat, location?.lng, radius],
    queryFn: async () => {
      if (!location) throw new Error('Location not available');
      const stores = await storesApi.getNearby(location, radius);
      setNearbyStores(stores);
      return stores;
    },
    enabled: enabled && location !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
}
