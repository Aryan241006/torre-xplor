import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * SearchBar component for Torre Xplor
 * @param {Object} props - Component props
 * @param {string} props.query - Current search query
 * @param {Function} props.onQueryChange - Function to handle query changes
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onClear - Function to clear search
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Disabled state
 */
const SearchBar = ({
  query,
  onQueryChange,
  loading = false,
  onClear,
  placeholder = "Search for people on Torre...",
  disabled = false,
}) => {
  const handleInputChange = (e) => {
    onQueryChange(e.target.value);
  };

  const handleClear = () => {
    onClear();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative w-full max-w-2xl mx-auto"
    >
      <motion.div 
        className="relative flex items-center"
        whileFocus={{
          scale: 1.01,
          transition: { type: "spring", stiffness: 300, damping: 25 }
        }}
      >
        {/* Search Icon Container */}
        <div 
          className="absolute left-0 top-0 bottom-0 flex items-center justify-center z-10"
          style={{ 
            width: '48px',
            pointerEvents: 'none'
          }}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--torre-accent)' }} />
          ) : (
            <Search className="h-5 w-5" style={{ color: 'var(--torre-text-muted)' }} />
          )}
        </div>

        {/* Search Input */}
        <motion.input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || loading}
          className="input-iconoir w-full py-4 text-lg"
          style={{
            paddingLeft: '56px', // Space for icon (48px) + extra spacing (8px)
            paddingRight: query && !loading ? '48px' : '16px', // Space for clear button when visible
            backgroundColor: 'var(--torre-bg-secondary)',
            borderColor: query ? 'var(--torre-accent)' : 'var(--torre-border)',
            color: 'var(--torre-text-primary)',
            opacity: disabled || loading ? 0.5 : 1,
            cursor: disabled || loading ? 'not-allowed' : 'text'
          }}
          autoComplete="off"
          spellCheck="false"
        />

        {/* Clear Button */}
        {query && !loading && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center transition-all duration-200 z-10 rounded-md"
            style={{
              color: 'var(--torre-text-muted)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = 'var(--torre-text-secondary)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'var(--torre-text-muted)';
              e.target.style.backgroundColor = 'transparent';
            }}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </motion.button>
        )}
      </motion.div>

      {/* Search Suggestions/Hints */}
      {!query && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center"
        >
          <p className="text-sm font-medium" style={{ color: 'var(--torre-text-muted)' }}>
            Try searching for names like "John Smith", "Maria Garcia", or professionals by location
          </p>
        </motion.div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-center"
        >
          <p className="text-sm flex items-center justify-center gap-2" style={{ color: 'var(--torre-accent)' }}>
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching Torre network...
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SearchBar;