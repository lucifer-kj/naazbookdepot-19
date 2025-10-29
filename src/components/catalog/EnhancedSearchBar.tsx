import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAdvancedSearch } from '@/lib/hooks/useAdvancedSearch';
import { LoadingDots } from '@/components/ui/progress-indicator';

interface EnhancedSearchBarProps {
  placeholder?: string;
  className?: string;
  onFiltersToggle?: () => void;
  showFiltersButton?: boolean;
  autoFocus?: boolean;
}

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  placeholder = "Search products...",
  className,
  onFiltersToggle,
  showFiltersButton = true,
  autoFocus = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const {
    query,
    suggestions,
    showSuggestions,
    isLoadingSuggestions,
    popularSearches,
    hasActiveFilters,
    updateQuery,
    selectSuggestion,
    hideSuggestions,
    clearSearch
  } = useAdvancedSearch({
    enableAutoComplete: true,
    enableAnalytics: true
  });

  // Handle click outside to hide suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        hideSuggestions();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hideSuggestions]);

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateQuery(e.target.value);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (query.length >= 2 || popularSearches.length > 0) {
      // Show suggestions when focused
      updateQuery(query); // This will trigger suggestions
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.matches(':hover')) {
        hideSuggestions();
      }
    }, 150);
  };

  const handleSuggestionClick = (suggestion: string) => {
    selectSuggestion(suggestion);
    inputRef.current?.blur();
  };

  const handleClearSearch = () => {
    clearSearch();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      hideSuggestions();
      inputRef.current?.blur();
    }
  };

  const showSuggestionsDropdown = showSuggestions && (suggestions.length > 0 || popularSearches.length > 0);

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      <div className="relative">
        <div className={cn(
          "relative flex items-center border rounded-lg transition-all duration-200",
          isFocused ? "border-naaz-green shadow-md" : "border-gray-300",
          "bg-white"
        )}>
          <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-10 pr-20 border-0 focus:ring-0 focus:border-0 bg-transparent"
          />

          <div className="absolute right-2 flex items-center space-x-1">
            {isLoadingSuggestions && (
              <LoadingDots size="sm" className="mr-2" />
            )}
            
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </Button>
            )}

            {showFiltersButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onFiltersToggle}
                className={cn(
                  "h-8 px-2 text-xs",
                  hasActiveFilters && "bg-naaz-green text-white hover:bg-naaz-green/90"
                )}
              >
                <Filter className="h-3 w-3 mr-1" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                    !
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Search Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestionsDropdown && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
            >
              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2 px-2">
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors flex items-center space-x-2"
                    >
                      <Search className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular Searches */}
              {popularSearches.length > 0 && suggestions.length === 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2 px-2 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Popular Searches
                  </div>
                  {popularSearches.slice(0, 5).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors flex items-center space-x-2"
                    >
                      <TrendingUp className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Searches (if we want to add this feature) */}
              {query.length === 0 && (
                <div className="p-2 border-t border-gray-100">
                  <div className="text-xs font-medium text-gray-500 mb-2 px-2 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Recent Searches
                  </div>
                  <div className="text-xs text-gray-400 px-2">
                    Start typing to see suggestions
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Tips */}
      {isFocused && !showSuggestionsDropdown && query.length < 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-full left-0 right-0 mt-1 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700"
        >
          💡 Tip: Type at least 2 characters to see search suggestions
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;