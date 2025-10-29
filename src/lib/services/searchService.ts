import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface SearchFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  tags?: string[];
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'popular';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  products: Tables<'products'>[];
  total: number;
  suggestions?: string[];
  facets?: {
    categories: { name: string; count: number }[];
    priceRanges: { range: string; count: number }[];
    tags: { name: string; count: number }[];
  };
}

export interface SearchAnalytics {
  query: string;
  resultsCount: number;
  timestamp: number;
  userId?: string;
  filters?: SearchFilters;
}

class SearchService {
  private readonly SEARCH_ANALYTICS_KEY = 'naaz-search-analytics';
  private readonly POPULAR_SEARCHES_KEY = 'naaz-popular-searches';
  private readonly SEARCH_SUGGESTIONS_KEY = 'naaz-search-suggestions';

  /**
   * Perform fuzzy search with Supabase full-text search
   */
  async search(query: string, filters: SearchFilters = {}): Promise<SearchResult> {
    try {
      // Track search analytics
      this.trackSearch(query, filters);

      let searchQuery = supabase
        .from('products')
        .select(`
          *,
          categories(id, name, slug),
          product_tags(tags(name))
        `);

      // Apply full-text search if query is provided
      if (query.trim()) {
        // Use Supabase's full-text search with fuzzy matching
        const searchTerms = query.trim().split(' ').map(term => `${term}:*`).join(' | ');
        searchQuery = searchQuery.textSearch('search_vector', searchTerms);
      }

      // Apply filters
      if (filters.category) {
        searchQuery = searchQuery.eq('categories.slug', filters.category);
      }

      if (filters.priceRange) {
        searchQuery = searchQuery
          .gte('price', filters.priceRange.min)
          .lte('price', filters.priceRange.max);
      }

      if (filters.inStock) {
        searchQuery = searchQuery.gt('stock_quantity', 0);
      }

      if (filters.tags && filters.tags.length > 0) {
        // Filter by tags using array overlap
        searchQuery = searchQuery.overlaps('product_tags.tags.name', filters.tags);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price_asc':
          searchQuery = searchQuery.order('price', { ascending: true });
          break;
        case 'price_desc':
          searchQuery = searchQuery.order('price', { ascending: false });
          break;
        case 'name_asc':
          searchQuery = searchQuery.order('name', { ascending: true });
          break;
        case 'name_desc':
          searchQuery = searchQuery.order('name', { ascending: false });
          break;
        case 'newest':
          searchQuery = searchQuery.order('created_at', { ascending: false });
          break;
        case 'popular':
          // Assuming we have a popularity score or view count
          searchQuery = searchQuery.order('view_count', { ascending: false });
          break;
        default:
          // Default to relevance (Supabase handles this with text search ranking)
          if (query.trim()) {
            searchQuery = searchQuery.order('ts_rank_cd(search_vector, plainto_tsquery($1))', { ascending: false });
          } else {
            searchQuery = searchQuery.order('created_at', { ascending: false });
          }
      }

      // Apply pagination
      if (filters.limit) {
        searchQuery = searchQuery.limit(filters.limit);
      }
      if (filters.offset) {
        searchQuery = searchQuery.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);
      }

      const { data: products, error, count } = await searchQuery;

      if (error) throw error;

      // Get search suggestions if query provided
      const suggestions = query.trim() ? await this.getSearchSuggestions(query) : [];

      // Get facets for filtering
      const facets = await this.getFacets(query, filters);

      const result: SearchResult = {
        products: products || [],
        total: count || 0,
        suggestions,
        facets
      };

      // Track search results
      this.trackSearchResults(query, result.total);

      return result;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      const suggestions: string[] = [];

      // Get suggestions from product names
      const { data: productSuggestions } = await supabase
        .from('products')
        .select('name')
        .ilike('name', `%${query}%`)
        .limit(limit);

      if (productSuggestions) {
        suggestions.push(...productSuggestions.map(p => p.name));
      }

      // Get suggestions from categories
      const { data: categorySuggestions } = await supabase
        .from('categories')
        .select('name')
        .ilike('name', `%${query}%`)
        .limit(3);

      if (categorySuggestions) {
        suggestions.push(...categorySuggestions.map(c => c.name));
      }

      // Get suggestions from popular searches
      const popularSearches = this.getPopularSearches();
      const matchingPopular = popularSearches
        .filter(search => search.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 2);

      suggestions.push(...matchingPopular);

      // Remove duplicates and limit results
      return [...new Set(suggestions)].slice(0, limit);
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  /**
   * Get autocomplete suggestions
   */
  async getAutocompleteSuggestions(query: string, limit: number = 8): Promise<string[]> {
    if (query.length < 2) return [];

    try {
      const suggestions: string[] = [];

      // Get product name suggestions
      const { data: products } = await supabase
        .from('products')
        .select('name')
        .textSearch('name', `${query}:*`)
        .limit(limit);

      if (products) {
        suggestions.push(...products.map(p => p.name));
      }

      return suggestions;
    } catch (error) {
      console.error('Failed to get autocomplete suggestions:', error);
      return [];
    }
  }

  /**
   * Get facets for filtering
   */
  private async getFacets(query: string, filters: SearchFilters) {
    try {
      // Get category facets
      const { data: categoryFacets } = await supabase
        .rpc('get_category_facets', { search_query: query || '' });

      // Get price range facets
      const { data: priceFacets } = await supabase
        .rpc('get_price_range_facets', { search_query: query || '' });

      // Get tag facets
      const { data: tagFacets } = await supabase
        .rpc('get_tag_facets', { search_query: query || '' });

      return {
        categories: categoryFacets || [],
        priceRanges: priceFacets || [],
        tags: tagFacets || []
      };
    } catch (error) {
      console.error('Failed to get facets:', error);
      return {
        categories: [],
        priceRanges: [],
        tags: []
      };
    }
  }

  /**
   * Track search analytics
   */
  private trackSearch(query: string, filters: SearchFilters, userId?: string) {
    try {
      const analytics: SearchAnalytics = {
        query: query.trim(),
        resultsCount: 0, // Will be updated after search
        timestamp: Date.now(),
        userId,
        filters
      };

      const existingAnalytics = this.getSearchAnalytics();
      existingAnalytics.push(analytics);

      // Keep only last 1000 searches
      const limitedAnalytics = existingAnalytics.slice(-1000);
      localStorage.setItem(this.SEARCH_ANALYTICS_KEY, JSON.stringify(limitedAnalytics));

      // Update popular searches
      this.updatePopularSearches(query.trim());
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  }

  /**
   * Track search results count
   */
  private trackSearchResults(query: string, resultsCount: number) {
    try {
      const analytics = this.getSearchAnalytics();
      const lastSearch = analytics[analytics.length - 1];
      
      if (lastSearch && lastSearch.query === query.trim()) {
        lastSearch.resultsCount = resultsCount;
        localStorage.setItem(this.SEARCH_ANALYTICS_KEY, JSON.stringify(analytics));
      }
    } catch (error) {
      console.error('Failed to track search results:', error);
    }
  }

  /**
   * Get search analytics
   */
  private getSearchAnalytics(): SearchAnalytics[] {
    try {
      const analytics = localStorage.getItem(this.SEARCH_ANALYTICS_KEY);
      return analytics ? JSON.parse(analytics) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Update popular searches
   */
  private updatePopularSearches(query: string) {
    if (!query.trim()) return;

    try {
      const popularSearches = this.getPopularSearches();
      const searchCounts: Record<string, number> = {};

      // Count existing searches
      popularSearches.forEach(search => {
        searchCounts[search] = (searchCounts[search] || 0) + 1;
      });

      // Add current search
      searchCounts[query] = (searchCounts[query] || 0) + 1;

      // Sort by count and take top 20
      const sortedSearches = Object.entries(searchCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([search]) => search);

      localStorage.setItem(this.POPULAR_SEARCHES_KEY, JSON.stringify(sortedSearches));
    } catch (error) {
      console.error('Failed to update popular searches:', error);
    }
  }

  /**
   * Get popular searches
   */
  getPopularSearches(): string[] {
    try {
      const searches = localStorage.getItem(this.POPULAR_SEARCHES_KEY);
      return searches ? JSON.parse(searches) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get search analytics summary
   */
  getSearchAnalyticsSummary() {
    const analytics = this.getSearchAnalytics();
    const last30Days = analytics.filter(
      search => Date.now() - search.timestamp < 30 * 24 * 60 * 60 * 1000
    );

    const totalSearches = last30Days.length;
    const uniqueQueries = new Set(last30Days.map(search => search.query)).size;
    const avgResultsCount = last30Days.reduce((sum, search) => sum + search.resultsCount, 0) / totalSearches || 0;
    const zeroResultsCount = last30Days.filter(search => search.resultsCount === 0).length;

    return {
      totalSearches,
      uniqueQueries,
      avgResultsCount: Math.round(avgResultsCount),
      zeroResultsPercentage: totalSearches > 0 ? Math.round((zeroResultsCount / totalSearches) * 100) : 0,
      popularSearches: this.getPopularSearches().slice(0, 10)
    };
  }

  /**
   * Clear search data
   */
  clearSearchData() {
    localStorage.removeItem(this.SEARCH_ANALYTICS_KEY);
    localStorage.removeItem(this.POPULAR_SEARCHES_KEY);
    localStorage.removeItem(this.SEARCH_SUGGESTIONS_KEY);
  }
}

export const searchService = new SearchService();