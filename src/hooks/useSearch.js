import { useState, useCallback, useRef } from 'react';
import { searchEntities, getUserGenome } from '../services/api';
import { formatUserData, debounce, validateSearchQuery } from '../utils/dataProcessing';

/**
 * Custom hook for managing search functionality
 * @returns {Object} Search state and functions
 */
export const useSearch = () => {
  const [searchState, setSearchState] = useState({
    query: '',
    results: [],
    loading: false,
    error: null,
    hasSearched: false,
    totalResults: 0,
    currentPage: 1,
    limit: 15, // Reduced from 20 to 15 for faster loading
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [userGenomeLoading, setUserGenomeLoading] = useState(false);
  const [userGenomeError, setUserGenomeError] = useState(null);

  const abortControllerRef = useRef(null);
  const searchCacheRef = useRef(new Map()); // Cache for search results

  /**
   * Perform search with debouncing and caching
   */
  const performSearch = useCallback(async (query, page = 1, limit = 20) => {
    // Validate query
    const validation = validateSearchQuery(query);
    if (!validation.isValid) {
      setSearchState(prev => ({
        ...prev,
        error: validation.error,
        loading: false,
      }));
      return;
    }

    const cacheKey = `${query.trim()}-${page}-${limit}`;
    
    // Check cache first
    if (searchCacheRef.current.has(cacheKey)) {
      const cachedResult = searchCacheRef.current.get(cacheKey);
      setSearchState(prev => ({
        ...prev,
        ...cachedResult,
        loading: false,
        query: query.trim(),
      }));
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setSearchState(prev => ({
      ...prev,
      loading: true,
      error: null,
      query: query.trim(),
      currentPage: page,
    }));

    try {
      const offset = (page - 1) * limit;
      const searchParams = {
        query: query.trim(),
        limit,
        offset,
        filters: [],
      };

      const response = await searchEntities(searchParams);

      if (response.success) {
        // Format the results
        const formattedResults = response.data
          .filter(item => item.person || item.name) // Filter out invalid entries
          .map(item => {
            // Handle different response formats
            if (item.person) {
              return formatUserData({
                ...item.person,
                id: item.person.publicId || item.person.id,
                username: item.person.publicId || item.person.username,
                skills: item.skills || [],
                strengths: item.strengths || [],
              });
            } else {
              return formatUserData(item);
            }
          })
          .filter(Boolean); // Remove null entries

        const newState = {
          results: page === 1 ? formattedResults : [...searchState.results, ...formattedResults],
          loading: false,
          hasSearched: true,
          totalResults: response.total || formattedResults.length,
        };

        // Cache the result
        searchCacheRef.current.set(cacheKey, {
          results: newState.results,
          hasSearched: true,
          totalResults: newState.totalResults,
        });

        // Limit cache size to prevent memory issues
        if (searchCacheRef.current.size > 50) {
          const firstKey = searchCacheRef.current.keys().next().value;
          searchCacheRef.current.delete(firstKey);
        }

        setSearchState(prev => ({
          ...prev,
          ...newState,
        }));
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
        setSearchState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'An error occurred while searching',
        }));
      }
    }
  }, []);

  /**
   * Debounced search function
   */
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.trim()) {
        performSearch(query);
      }
    }, 400), // Increased from 100ms to 400ms for better user experience
    [performSearch]
  );

  /**
   * Handle search input change
   */
  const handleSearchChange = useCallback((query) => {
    setSearchState(prev => ({
      ...prev,
      query,
      error: null,
    }));

    if (query.trim().length >= 3) {
      debouncedSearch(query);
    } else if (query.trim().length === 0) {
      setSearchState(prev => ({
        ...prev,
        results: [],
        hasSearched: false,
        totalResults: 0,
        currentPage: 1,
      }));
    }
  }, [debouncedSearch]);

  /**
   * Load more results (pagination)
   */
  const loadMore = useCallback(() => {
    if (!searchState.loading && searchState.query) {
      performSearch(searchState.query, searchState.currentPage + 1, searchState.limit);
    }
  }, [performSearch, searchState.loading, searchState.query, searchState.currentPage, searchState.limit]);

  /**
   * Clear search results
   */
  const clearSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setSearchState({
      query: '',
      results: [],
      loading: false,
      error: null,
      hasSearched: false,
      totalResults: 0,
      currentPage: 1,
      limit: 20,
    });
    setSelectedUser(null);
  }, []);

  /**
   * Fetch detailed user genome data
   */
  const fetchUserGenome = useCallback(async (username) => {
    if (!username) return;

    setUserGenomeLoading(true);
    setUserGenomeError(null);

    try {
      const response = await getUserGenome(username);

      if (response.success) {
        const formattedUser = formatUserData(response.data);
        setSelectedUser(formattedUser);
      } else {
        throw new Error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user genome:', error);
      setUserGenomeError(error.message || 'Failed to fetch user details');
    } finally {
      setUserGenomeLoading(false);
    }
  }, []);

  /**
   * Select a user from search results
   */
  const selectUser = useCallback((user) => {
    setSelectedUser(user);
    // Extract username from nested person structure or direct structure
    const username = user.person?.username || user.username;

    if (username) {
      fetchUserGenome(username);
    }
  }, [fetchUserGenome]);

  /**
   * Clear selected user
   */
  const clearSelectedUser = useCallback(() => {
    setSelectedUser(null);
    setUserGenomeError(null);
  }, []);

  /**
   * Retry search
   */
  const retrySearch = useCallback(() => {
    if (searchState.query) {
      performSearch(searchState.query);
    }
  }, [performSearch, searchState.query]);

  return {
    // Search state
    query: searchState.query,
    results: searchState.results,
    loading: searchState.loading,
    error: searchState.error,
    hasSearched: searchState.hasSearched,
    totalResults: searchState.totalResults,
    currentPage: searchState.currentPage,
    hasMore: searchState.results.length < searchState.totalResults,

    // User genome state
    selectedUser,
    userGenomeLoading,
    userGenomeError,

    // Actions
    handleSearchChange,
    loadMore,
    clearSearch,
    selectUser,
    clearSelectedUser,
    retrySearch,
    fetchUserGenome,
  };
};

export default useSearch;
