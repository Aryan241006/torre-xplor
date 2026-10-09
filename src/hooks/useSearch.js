import { useState, useCallback, useRef, useMemo } from 'react';
import { searchPeople, getProfile } from '../services/api';
import { debounce, validateSearchQuery } from '../utils/dataProcessing';

const PAGE_SIZE = 15;

const initialSearchState = {
  query: '',
  results: [],
  loading: false,
  error: null,
  hasSearched: false,
  hasMore: false,
  currentPage: 1,
};

/**
 * Custom hook for managing search functionality
 * @returns {Object} Search state and functions
 */
export const useSearch = () => {
  const [searchState, setSearchState] = useState(initialSearchState);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userGenomeLoading, setUserGenomeLoading] = useState(false);
  const [userGenomeError, setUserGenomeError] = useState(null);

  const abortControllerRef = useRef(null);

  /**
   * Fetch a page of results. Page 1 replaces the results; later pages append.
   * Caching happens on the backend, so repeated searches are cheap.
   */
  const performSearch = useCallback(async (query, page = 1) => {
    const validation = validateSearchQuery(query);
    if (!validation.isValid) {
      setSearchState(prev => ({ ...prev, error: validation.error, loading: false }));
      return;
    }

    // Cancel the previous request so a slow, outdated response can't overwrite a newer one.
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setSearchState(prev => ({
      ...prev,
      loading: true,
      error: null,
      query: query.trim(),
      currentPage: page,
    }));

    try {
      const response = await searchPeople({
        query: query.trim(),
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        signal: controller.signal,
      });

      setSearchState(prev => {
        const results = page === 1 ? response.results : [...prev.results, ...response.results];
        // Pages can overlap, so drop duplicates.
        const unique = [...new Map(results.map(person => [person.username, person])).values()];
        return {
          ...prev,
          results: unique,
          loading: false,
          hasSearched: true,
          hasMore: response.hasMore,
        };
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        setSearchState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'An error occurred while searching',
        }));
      }
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce((query) => {
      if (query.trim()) {
        performSearch(query);
      }
    }, 400),
    [performSearch]
  );

  /**
   * Handle search input change
   */
  const handleSearchChange = useCallback((query) => {
    setSearchState(prev => ({ ...prev, query, error: null }));

    if (query.trim().length >= 3) {
      debouncedSearch(query);
    } else if (query.trim().length === 0) {
      setSearchState(prev => ({ ...initialSearchState, query: prev.query }));
    }
  }, [debouncedSearch]);

  /**
   * Load more results (pagination)
   */
  const loadMore = useCallback(() => {
    if (!searchState.loading && searchState.query) {
      performSearch(searchState.query, searchState.currentPage + 1);
    }
  }, [performSearch, searchState.loading, searchState.query, searchState.currentPage]);

  /**
   * Clear search results
   */
  const clearSearch = useCallback(() => {
    abortControllerRef.current?.abort();
    setSearchState(initialSearchState);
    setSelectedUser(null);
  }, []);

  /**
   * Fetch a person's full profile from the backend
   */
  const fetchUserGenome = useCallback(async (username) => {
    if (!username) return;

    setUserGenomeLoading(true);
    setUserGenomeError(null);

    try {
      const profile = await getProfile(username);
      setSelectedUser(profile);
    } catch (error) {
      setUserGenomeError(error.message || 'Failed to fetch user details');
    } finally {
      setUserGenomeLoading(false);
    }
  }, []);

  /**
   * Select a user from search results
   */
  const selectUser = useCallback((user) => {
    // Show the summary we already have while the full profile loads.
    setSelectedUser(user);
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
    totalResults: searchState.results.length,
    currentPage: searchState.currentPage,
    hasMore: searchState.hasMore,

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
