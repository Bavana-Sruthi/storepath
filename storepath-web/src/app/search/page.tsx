'use client';

import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { ProductCard } from '@/components/ProductCard';
import { StoreCard } from '@/components/StoreCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useProductSearch } from '@/hooks/useProductSearch';
import { SlidersHorizontal, X } from 'lucide-react';

const categories = [
  'All',
  'Groceries',
  'Electronics',
  'Dairy',
  'Personal Care',
  'Home & Kitchen',
  'Snacks',
  'Beverages',
];

const sortOptions = [
  { value: 'distance', label: 'Distance' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
  { value: 'availability', label: 'Availability' },
];

export default function SearchPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  
  const { results, filters, updateFilters, isLoading } = useProductSearch();

  const handleSearch = (query: string) => {
    updateFilters({ query });
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    updateFilters({ category: category === 'All' ? undefined : category });
  };

  const handleSortChange = (sortBy: string) => {
    updateFilters({ sortBy: sortBy as any });
  };

  const handlePriceFilter = () => {
    updateFilters({
      minPrice: priceRange.min || undefined,
      maxPrice: priceRange.max || undefined,
    });
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Search Products</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
          
          <SearchBar onSearch={handleSearch} />

          {/* Categories */}
          <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Sort Options */}
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant={filters.sortBy === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSortChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center">
          <Card className="w-full md:max-w-md rounded-t-3xl md:rounded-xl animate-slide-up">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min || ''}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max || ''}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, max: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handlePriceFilter} className="flex-1">
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPriceRange({ min: 0, max: 10000 });
                      updateFilters({ minPrice: undefined, maxPrice: undefined });
                      setShowFilters(false);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results */}
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            {results.map((result) => (
              <div key={result.product.id}>
                <ProductCard
                  product={result.product}
                  nearbyStoresCount={result.stores.length}
                  lowestPrice={
                    result.stores.length > 0
                      ? Math.min(
                          ...result.stores.map(
                            (s: any) =>
                              s.inventory.find(
                                (i: any) => i.productId === result.product.id
                              )?.price || result.product.basePrice
                          )
                        )
                      : result.product.basePrice
                  }
                  onClick={() => (window.location.href = `/products/${result.product.id}`)}
                />
                
                {result.stores.length > 0 && (
                  <div className="mt-3 ml-4 space-y-2">
                    <p className="text-sm font-medium text-gray-600">
                      Available at {result.stores.length} nearby store(s)
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              {filters.query
                ? 'No products found. Try adjusting your search.'
                : 'Start searching for products'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
