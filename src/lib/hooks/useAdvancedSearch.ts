import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { searchService, type SearchFilters, type SearchResult } from '@/lib/services/searchService';

export interface UseAdvancedSearchOptions {
  debounceMs?: number;
  enableAutoComplete?: boolean;
  enableAnalytics?: boolean;
  defaultFilters?: SearchFilters;
}

export const useAdvancedSearch = (options: UseAdvancedSearchOptions = {}) => {
  const {
    debounceMs = 300,
    enableAutoComplete = true,
    enableAnalytics = true,
    defaultFilters = {}
  } = options;

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debouncedQuery = useDebounce(query, debounceMs);
  const debouncedAutoComplete = useDebounce(query, 150); // Faster for autocomplete

  // Main search query
  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
    refetch: refetchSearch
  } = useQuery({
    queryKey: ['advanced-search', debouncedQuery, filters],
    queryFn: () => searchService.search(debouncedQuery, filters),
    enabled: debouncedQuery.length >= 2 || Object.keys(filters).length > 0,
    staleTime: 30000, // 30 seconds
    keepPreviousData: true
  });

  // Autocomplete suggestions query
  const {
    data: autocompleteSuggestions,
    isLoading: isLoadingSuggestions
  } = useQuery({
    queryKey: ['autocomplete', debouncedAutoComplete],
    queryFn: () => searchService.getAutocompleteSuggestions(debouncedAutoComplete),
    enabled: enableAutoComplete && debouncedAutoComplete.length >= 2,
    staleTime: 60000 // 1 minute
  });

  // Update suggestions when autocomplete data changes
  useEffect(() => {
    if (autocompleteSuggestions) {
      setSuggestions(autocompleteSuggestions);
    }
  }, [autocompleteSuggestions]);

  // Search methods
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    if (newQuery.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters(defaultFilters);
    setSuggestions([]);
    setShowSuggestions(false);
  }, [defaultFilters]);

  const selectSuggestion = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  }, []);

  const hideSuggestions = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  // Filter helpers
  const setPriceRange = useCallback((min: number, max: number) => {
    updateFilters({ priceRange: { min, max } });
  }, [updateFilters]);

  const setCategory = useCallback((category: string | undefined) => {
    updateFilters({ category });
  }, [updateFilters]);

  const setSortBy = useCallback((sortBy: SearchFilters['sortBy']) => {
    updateFilters({ sortBy });
  }, [updateFilters]);

  const toggleInStock = useCallback(() => {
    updateFilters({ inStock: !filters.inStock });
  }, [filters.inStock, updateFilters]);

  const addTag = useCallback((tag: string) => {
    const currentTags = filters.tags || [];
    if (!currentTags.includes(tag)) {
      updateFilters({ tags: [...currentTags, tag] });
    }
  }, [filters.tags, updateFilters]);

  const removeTag = useCallback((tag: string) => {
    const currentTags = filters.tags || [];
    updateFilters({ tags: currentTags.filter(t => t !== tag) });
  }, [filters.tags, updateFilters]);

  // Pagination helpers
  const setPage = useCallback((page: number, pageSize: number = 20) => {
    const offset = (page - 1) * pageSize;
    updateFilters({ offset, limit: pageSize });
  }, [updateFilters]);

  // Analytics
  const popularSearches = useMemo(() => {
    return enableAnalytics ? searchService.getPopularSearches() : [];
  }, [enableAnalytics]);

  const searchAnalytics = useMemo(() => {
    return enableAnalytics ? searchService.getSearchAnalyticsSummary() : null;
  }, [enableAnalytics]);

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(key => {
      const value = filters[key as keyof SearchFilters];
      if (key === 'tags') return Array.isArray(value) && value.length > 0;
      if (key === 'priceRange') return value && (value.min > 0 || value.max < Infinity);
      return value !== undefined && value !== null && value !== '';
    });
  }, [filters]);

  const totalResults = searchResults?.total || 0;
  const products = searchResults?.products || [];
  const facets = searchResults?.facets;

  const currentPage = useMemo(() => {
    const offset = filters.offset || 0;
    const limit = filters.limit || 20;
    return Math.floor(offset / limit) + 1;
  }, [filters.offset, filters.limit]);

  const totalPages = useMemo(() => {
    const limit = filters.limit || 20;
    return Math.ceil(totalResults / limit);
  }, [totalResults, filters.limit]);

  return {
    // Search state
    query,
    filters,
    suggestions,
    showSuggestions,
    isSearching,
    isLoadingSuggestions,
    searchError,

    // Search results
    products,
    totalResults,
    facets,
    currentPage,
    totalPages,

    // Search methods
    updateQuery,
    updateFilters,
    clearFilters,
    clearSearch,
    selectSuggestion,
    hideSuggestions,
    refetchSearch,

    // Filter helpers
    setPriceRange,
    setCategory,
    setSortBy,
    toggleInStock,
    addTag,
    removeTag,
    setPage,

    // Computed values
    hasActiveFilters,

    // Analytics
    popularSearches,
    searchAnalytics
  };
};