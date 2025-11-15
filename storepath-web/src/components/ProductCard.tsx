'use client';

import React from 'react';
import { Heart, ShoppingCart, MapPin } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useStore } from '@/store/useStore';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  nearbyStoresCount?: number;
  lowestPrice?: number;
}

export function ProductCard({
  product,
  onClick,
  nearbyStoresCount = 0,
  lowestPrice,
}: ProductCardProps) {
  const { isFavoriteProduct, addFavoriteProduct, removeFavoriteProduct } =
    useStore();
  const isFavorite = isFavoriteProduct(product.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      removeFavoriteProduct(product.id);
    } else {
      addFavoriteProduct(product.id);
    }
  };

  const handleAddToList = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Will be handled by parent component or shopping list modal
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
      onClick={onClick}
    >
      {product.imageUrl && (
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
            />
          </button>
        </div>
      )}

      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
          
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
            {nearbyStoresCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <MapPin className="h-3 w-3" />
                <span>{nearbyStoresCount} stores nearby</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">Starting from</p>
            <p className="text-xl font-bold text-blue-600">
              {formatPrice(lowestPrice || product.basePrice)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleAddToList} variant="outline" size="sm" className="flex-1">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to List
          </Button>
          <Button size="sm" className="flex-1">
            Check Stores
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
