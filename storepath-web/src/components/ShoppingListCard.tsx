'use client';

import React from 'react';
import { Check, Trash2, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingList } from '@/types';
import { formatDate } from '@/lib/utils';
import { useStore } from '@/store/useStore';

interface ShoppingListCardProps {
  list: ShoppingList;
  onClick?: () => void;
  onOptimizeRoute?: () => void;
  onDelete?: () => void;
}

export function ShoppingListCard({
  list,
  onClick,
  onOptimizeRoute,
  onDelete,
}: ShoppingListCardProps) {
  const { toggleShoppingItem, removeFromShoppingList } = useStore();

  const totalItems = list.items.length;
  const checkedItems = list.items.filter((item) => item.checked).length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  const handleToggleItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleShoppingItem(list.id, itemId);
  };

  const handleDeleteItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromShoppingList(list.id, itemId);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg mb-1">{list.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(list.updatedAt)}</span>
            </div>
          </div>
          
          {list.sharedWith && list.sharedWith.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              Shared with {list.sharedWith.length}
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">
              {checkedItems} / {totalItems} items
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Items Preview */}
        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
          {list.items.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
            >
              <button
                onClick={(e) => handleToggleItem(item.id, e)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  item.checked
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300 hover:border-green-500'
                }`}
              >
                {item.checked && <Check className="h-3 w-3 text-white" />}
              </button>
              
              <span
                className={`flex-1 text-sm ${
                  item.checked ? 'line-through text-gray-500' : 'text-gray-900'
                }`}
              >
                {item.productName} {item.quantity > 1 && `(${item.quantity})`}
              </span>
              
              <button
                onClick={(e) => handleDeleteItem(item.id, e)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          {list.items.length > 5 && (
            <p className="text-xs text-gray-500 text-center">
              +{list.items.length - 5} more items
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onOptimizeRoute?.();
            }}
            size="sm"
            className="flex-1"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Optimize Route
          </Button>
          
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            variant="outline"
            size="sm"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
