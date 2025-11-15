import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { productsApi } from '@/lib/api';
import { SearchFilters, SearchResult } from '@/types';

export function useProductSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'distance',
    sortOrder: 'asc',
  });

  const [debouncedFilters, setDebouncedFilters] = useState<SearchFilters>(filters);

  const debouncedUpdate = useDebouncedCallback((newFilters: SearchFilters) => {
    setDebouncedFilters(newFilters);
  }, 500);

  useEffect(() => {
    debouncedUpdate(filters);
  }, [filters, debouncedUpdate]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', 'search', debouncedFilters],
    queryFn: () => productsApi.search(debouncedFilters),
    enabled: !!debouncedFilters.query && debouncedFilters.query.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const updateFilters = useCallback((updates: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setFilters({
      query: '',
      sortBy: 'distance',
      sortOrder: 'asc',
    });
  }, []);

  return {
    results: data || [],
    filters,
    updateFilters,
    reset,
    isLoading,
    error,
    refetch,
  };
}
