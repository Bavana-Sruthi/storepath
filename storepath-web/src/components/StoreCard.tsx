'use client';

import React from 'react';
import { MapPin, Clock, Star, Navigation, Heart } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { StoreWithDistance } from '@/types';
import { formatDistance, formatPrice, calculateAccuracyScore } from '@/lib/utils';
import { useStore } from '@/store/useStore';

interface StoreCardProps {
  store: StoreWithDistance;
  onClick?: () => void;
  onNavigate?: () => void;
  showInventory?: boolean;
  productId?: string;
}

export function StoreCard({
  store,
  onClick,
  onNavigate,
  showInventory = false,
  productId,
}: StoreCardProps) {
  const { isFavoriteStore, addFavoriteStore, removeFavoriteStore } = useStore();
  const isFavorite = isFavoriteStore(store.id);

  const inventoryItem = productId
    ? store.inventory.find((item) => item.productId === productId)
    : null;

  const accuracyScore = calculateAccuracyScore(store.lastInventoryUpdate);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      removeFavoriteStore(store.id);
    } else {
      addFavoriteStore(store.id);
    }
  };

  const handleNavigateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate?.();
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{store.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{formatDistance(store.distance)}</span>
              <span>•</span>
              <Clock className="h-4 w-4" />
              <span>{store.duration} min</span>
            </div>
          </div>

          <button
            onClick={handleFavoriteClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{store.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({store.reviewCount})</span>
          </div>

          <Badge
            variant={store.isOpen ? 'success' : 'destructive'}
            className="text-xs"
          >
            {store.isOpen ? 'Open' : 'Closed'}
          </Badge>

          <Badge variant="outline" className="text-xs">
            {accuracyScore}% accurate
          </Badge>
        </div>

        {showInventory && inventoryItem && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-blue-900">In Stock</p>
                <p className="text-xs text-blue-700">{inventoryItem.quantity} available</p>
              </div>
              <p className="text-lg font-semibold text-blue-900">
                {formatPrice(inventoryItem.price)}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleNavigateClick} className="flex-1" size="sm">
            <Navigation className="h-4 w-4 mr-2" />
            Navigate
          </Button>
          <Button variant="outline" className="flex-1" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
