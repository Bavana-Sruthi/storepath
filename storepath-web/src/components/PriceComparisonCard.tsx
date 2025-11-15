'use client';

import React from 'react';
import { TrendingDown, TrendingUp, MapPin, Truck, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { PriceComparison } from '@/types';
import { formatPrice, formatDistance } from '@/lib/utils';

interface PriceComparisonCardProps {
  comparison: PriceComparison;
}

export function PriceComparisonCard({ comparison }: PriceComparisonCardProps) {
  const nearbyBest = comparison.nearbyStores[0];
  const onlineBest = comparison.onlinePrices.find((p) => p.inStock);

  const savingsAmount = onlineBest
    ? onlineBest.price - (nearbyBest?.price || 0)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Recommendation */}
        {comparison.recommendation && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900">
              💡 {comparison.recommendation}
            </p>
          </div>
        )}

        {/* Nearby Stores */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Nearby Stores
          </h4>
          <div className="space-y-3">
            {comparison.nearbyStores.slice(0, 3).map((item, index) => (
              <div
                key={item.store.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.store.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{formatDistance(item.store.distance)}</span>
                    <span>•</span>
                    <span>{item.store.duration} min</span>
                    {item.quantity < 5 && (
                      <>
                        <span>•</span>
                        <span className="text-orange-600">
                          Only {item.quantity} left
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(item.price)}
                  </p>
                  {index === 0 && savingsAmount > 0 && (
                    <Badge variant="success" className="text-xs">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Save {formatPrice(savingsAmount)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Online Prices */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Truck className="h-5 w-5 text-purple-600" />
            Online Options
          </h4>
          <div className="space-y-3">
            {comparison.onlinePrices.map((online) => (
              <div
                key={online.source}
                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium capitalize">{online.source}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Delivery in {online.deliveryDays} days</span>
                    {!online.inStock && (
                      <>
                        <span>•</span>
                        <span className="text-red-600">Out of stock</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(online.price)}
                    </p>
                    {nearbyBest && online.price > nearbyBest.price && (
                      <Badge variant="warning" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{formatPrice(online.price - nearbyBest.price)}
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(online.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
