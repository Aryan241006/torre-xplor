import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PersonCard from './PersonCard';
import LoadingSpinner, { SkeletonGrid } from './LoadingSpinner';
import ErrorMessage, { NoResults, SearchError } from './ErrorMessage';
import { ChevronDown, Users, TrendingUp } from 'lucide-react';

/**
 * SearchResults component to display search results with pagination
 * @param {Object} props - Component props
 * @param {Array} props.results - Search results array
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {string} props.query - Current search query
 * @param {boolean} props.hasSearched - Whether a search has been performed
 * @param {boolean} props.hasMore - Whether there are more results to load
 * @param {Function} props.onLoadMore - Function to load more results
 * @param {Function} props.onPersonClick - Function to handle person card clicks
 * @param {Function} props.onRetry - Function to retry search
 * @param {Function} props.onClear - Function to clear search
 * @param {number} props.totalResults - Total number of results
 */
const SearchResults = ({
  results = [],
  loading = false,
  error = null,
  query = '',
  hasSearched = false,
  hasMore = false,
  onLoadMore,
  onPersonClick,
  onRetry,
  onClear,
  totalResults = 0,
  showAddButton = false,
  compact = false,
  selectButtonText = "View Genome",
  excludeUsernames = []
}) => {
  // Show initial state when no search has been performed
  if (!hasSearched && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
               style={{
                 background: 'var(--torre-accent)'
               }}>
            <Users className="h-12 w-12" style={{ color: '#2d3748' }} />
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--torre-text-primary)' }}>
            Discover Torre Professionals
          </h2>
          <p className="mb-6" style={{ color: 'var(--torre-text-secondary)' }}>
            Search through Torre's network of talented professionals and discover their skills, experiences, and achievements.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Real-time data</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Users className="h-4 w-4" />
              <span>Global network</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Users className="h-4 w-4" />
              <span>Verified profiles</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show loading skeleton on initial search
  if (loading && results.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <LoadingSpinner size="lg" text={`Searching for "${query}"...`} />
        </div>
        <SkeletonGrid count={6} />
      </div>
    );
  }

  // Show error state
  if (error && results.length === 0) {
    return (
      <div className="py-8">
        <SearchError
          query={query}
          onRetry={onRetry}
          onDismiss={onClear}
        />
      </div>
    );
  }

  // Show no results state
  if (hasSearched && results.length === 0 && !loading && !error) {
    return (
      <div className="py-8">
        <NoResults query={query} onClear={onClear} />
      </div>
    );
  }

  // Show results
  return (
    <div className="space-y-6">
      {/* Results Header */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between py-4"
          style={{ borderBottom: '1px solid var(--g6)' }}
        >
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--g0)' }}>
              Search Results
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--g2)' }}>
              {totalResults > 0 ? (
                <>
                  Found {totalResults.toLocaleString()} people matching "{query}"
                </>
              ) : (
                <>
                  Showing {results.length} results for "{query}"
                </>
              )}
            </p>
          </div>

          {/* Optional: Add sorting/filtering controls here */}
        </motion.div>
      )}

      {/* Results Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`results-${query}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={compact ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch"}
        >
          {results
            .filter(result => {
              const username = result.person?.username || result.username;
              return !excludeUsernames.includes(username);
            })
            .map((result, index) => (
            <PersonCard
              key={result.person?.id || result.person?.username || result.id || result.username || index}
              person={{
                ...result.person,
                skills: result.skills || [],
                strengths: result.strengths || [],
                // Handle both old and new data structures
                name: result.person?.name || result.name,
                headline: result.person?.professionalHeadline || result.person?.headline || result.headline,
                picture: result.person?.picture || result.picture,
                username: result.person?.username || result.username,
                verified: result.person?.verified || result.verified,
                location: result.person?.location || result.location,
              }}
              onClick={(personData) => {
                // Pass the original result structure with person nested
                onPersonClick({
                  person: result.person || result,
                  skills: result.skills || [],
                  strengths: result.strengths || [],
                });
              }}
              index={index}
              showAddButton={showAddButton}
              compact={compact}
              selectButtonText={selectButtonText}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Load More Button */}
      {hasMore && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLoadMore}
            className="btn-iconoir"
          >
            <ChevronDown className="h-5 w-5" />
            Load More Results
          </motion.button>
        </motion.div>
      )}

      {/* Loading More Indicator */}
      {loading && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <LoadingSpinner size="md" text="Loading more results..." />
        </motion.div>
      )}

      {/* End of Results Indicator */}
      {!hasMore && results.length > 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
            style={{
              backgroundColor: 'var(--torre-bg-secondary)',
              color: 'var(--torre-text-muted)',
              border: '1px solid var(--torre-border)'
            }}
          >
            <Users className="h-4 w-4" />
            You've seen all {results.length} results
          </div>
        </motion.div>
      )}

      {/* Error during load more */}
      {error && results.length > 0 && (
        <div className="py-4">
          <ErrorMessage
            type="error"
            title="Failed to load more results"
            message={error}
            onRetry={onLoadMore}
            dismissible={true}
          />
        </div>
      )}
    </div>
  );
};

export default SearchResults;
