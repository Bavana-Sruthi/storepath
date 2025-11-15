'use client';

import { useEffect, useState } from 'react';
import { MapPin, List, Grid3X3, Search as SearchIcon } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { StoreCard } from '@/components/StoreCard';
import { ProductCard } from '@/components/ProductCard';
import { MapView } from '@/components/MapView';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNearbyStores } from '@/hooks/useNearbyStores';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

export default function HomePage() {
  const [view, setView] = useState<'list' | 'grid' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  
  const { location, error: locationError, loading: locationLoading } = useGeolocation({
    watch: true,
  });
  
  const { data: stores, isLoading: storesLoading } = useNearbyStores({
    location,
    radius: 10,
    enabled: !!location,
  });

  const { nearbyStores, setSelectedStore } = useStore();

  useEffect(() => {
    if (locationError) {
      toast.error('Location access denied', {
        description: 'Please enable location to find nearby stores',
      });
    }
  }, [locationError]);

  const handleStoreClick = (storeId: string) => {
    const store = nearbyStores.find((s) => s.id === storeId);
    if (store) {
      setSelectedStore(store);
      // Navigate to store details
      window.location.href = `/stores/${storeId}`;
    }
  };

  const handleNavigate = (storeId: string) => {
    const store = nearbyStores.find((s) => s.id === storeId);
    if (store && location) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${store.location.lat},${store.location.lng}`;
      window.open(mapsUrl, '_blank');
    }
  };

  if (locationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">StorePath</h1>
                <p className="text-xs text-gray-600">Find products nearby</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setView('list')}
              >
                <List className="h-5 w-5" />
              </Button>
              <Button
                variant={view === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setView('grid')}
              >
                <Grid3X3 className="h-5 w-5" />
              </Button>
              <Button
                variant={view === 'map' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setView('map')}
              >
                <MapPin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <SearchBar onFilterClick={() => setShowFilters(!showFilters)} />

          {location && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>
                Showing stores near your location •{' '}
                {nearbyStores.length} stores found
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {storesLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : view === 'map' && location ? (
          <div className="rounded-xl overflow-hidden shadow-lg">
            <MapView
              center={location}
              stores={nearbyStores}
              onStoreClick={handleStoreClick}
              className="h-[calc(100vh-200px)]"
            />
          </div>
        ) : (
          <div
            className={
              view === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-4'
            }
          >
            {nearbyStores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onClick={() => handleStoreClick(store.id)}
                onNavigate={() => handleNavigate(store.id)}
              />
            ))}

            {nearbyStores.length === 0 && !storesLoading && (
              <div className="text-center py-12">
                <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No stores found nearby
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or check your location settings
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-40">
        <div className="container mx-auto flex justify-around items-center">
          <Button variant="ghost" className="flex-col h-auto py-2">
            <SearchIcon className="h-6 w-6 mb-1" />
            <span className="text-xs">Search</span>
          </Button>
          <Button variant="ghost" className="flex-col h-auto py-2">
            <MapPin className="h-6 w-6 mb-1" />
            <span className="text-xs">Nearby</span>
          </Button>
          <Button variant="ghost" className="flex-col h-auto py-2">
            <List className="h-6 w-6 mb-1" />
            <span className="text-xs">Lists</span>
          </Button>
          <Button variant="ghost" className="flex-col h-auto py-2">
            <Grid3X3 className="h-6 w-6 mb-1" />
            <span className="text-xs">More</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
