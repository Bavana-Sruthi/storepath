'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Phone, Mail, Clock, Star, Heart, Navigation, Share2 } from 'lucide-react';
import { storesApi, reviewsApi } from '@/lib/api';
import { Store, Review } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { MapView } from '@/components/MapView';
import { formatPrice, isStoreOpen } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

export default function StoreDetailPage() {
  const params = useParams();
  const storeId = params.id as string;
  
  const [store, setStore] = useState<Store | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { userLocation, isFavoriteStore, addFavoriteStore, removeFavoriteStore } = useStore();
  const isFavorite = isFavoriteStore(storeId);

  useEffect(() => {
    async function loadStore() {
      try {
        const storeData = await storesApi.getById(storeId);
        setStore(storeData);
        
        const reviewsData = await reviewsApi.getByStore(storeId);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error loading store:', error);
        toast.error('Failed to load store details');
      } finally {
        setLoading(false);
      }
    }

    loadStore();
  }, [storeId]);

  const handleFavorite = () => {
    if (isFavorite) {
      removeFavoriteStore(storeId);
      toast.success('Removed from favorites');
    } else {
      addFavoriteStore(storeId);
      toast.success('Added to favorites');
    }
  };

  const handleNavigate = () => {
    if (store && userLocation) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${store.location.lat},${store.location.lng}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: store?.name,
          text: `Check out ${store?.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Store not found</h2>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const isOpen = isStoreOpen(store.hours);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => window.history.back()}>
              ← Back
            </Button>
            
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant={isFavorite ? 'default' : 'ghost'}
                size="icon"
                onClick={handleFavorite}
              >
                <Heart className={isFavorite ? 'fill-current' : ''} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Store Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
                <p className="text-gray-600 mb-3">{store.description}</p>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{store.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-500">({store.reviewCount} reviews)</span>
                </div>

                <Badge variant={isOpen ? 'success' : 'destructive'}>
                  {isOpen ? 'Open Now' : 'Closed'}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-gray-600">{store.address}</p>
                </div>
              </div>

              {store.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <a href={`tel:${store.phone}`} className="text-blue-600 hover:underline">
                    {store.phone}
                  </a>
                </div>
              )}

              {store.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <a href={`mailto:${store.email}`} className="text-blue-600 hover:underline">
                    {store.email}
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-2">
              <Button onClick={handleNavigate} className="flex-1">
                <Navigation className="h-4 w-4 mr-2" />
                Navigate
              </Button>
              <Button variant="outline" className="flex-1">
                Call Store
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        {userLocation && (
          <Card>
            <CardContent className="p-0">
              <MapView
                center={store.location}
                stores={[{ ...store, distance: 0, duration: 0, isOpen, accuracyScore: 100 }]}
                className="h-64 rounded-lg"
              />
            </CardContent>
          </Card>
        )}

        {/* Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Opening Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {store.hours.map((hour) => (
                <div key={hour.day} className="flex justify-between">
                  <span className="font-medium">{hour.day}</span>
                  <span className="text-gray-600">
                    {hour.open} - {hour.close}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {store.categories.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Sample */}
        <Card>
          <CardHeader>
            <CardTitle>Available Products ({store.inventory.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {store.inventory.slice(0, 5).map((item) => (
                <div key={item.productId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Product</p>
                    <p className="text-sm text-gray-600">{item.quantity} in stock</p>
                  </div>
                  <p className="text-lg font-bold">{formatPrice(item.price)}</p>
                </div>
              ))}
              {store.inventory.length > 5 && (
                <Button variant="outline" className="w-full">
                  View All Products
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{review.userName}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Reviews
                </Button>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No reviews yet</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
