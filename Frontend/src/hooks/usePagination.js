import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';

export function usePagination(endpoint, initialFilters = {}) {
  const [page, setPage] = useState(initialFilters.page || 1);
  const [limit, setLimit] = useState(initialFilters.limit || 10);
  const [search, setSearch] = useState(initialFilters.search || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [filters, setFilters] = useState(initialFilters.filters || {});

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const constructUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (debouncedSearch) params.append('search', debouncedSearch);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.append(key, value);
      }
    });

    const separator = endpoint.includes('?') ? '&' : '?';
    return `${endpoint}${separator}${params.toString()}`;
  }, [endpoint, page, limit, debouncedSearch, filters]);

  const { data, loading, error, refetch } = useApi(constructUrl());

  const items = data?.items || [];
  const pagination = data?.pagination || {
    totalItems: 0,
    totalPages: 1,
    currentPage: page,
    limit
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  return {
    items,
    pagination,
    loading,
    error,
    page,
    setPage,
    search,
    setSearch,
    filters,
    updateFilters,
    refetch
  };
}
