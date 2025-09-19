import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, UserMinus, Users, X } from 'lucide-react';
import { useComparison } from '../contexts/ComparisonContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import Avatar from './Avatar.jsx';

const ComparisonButton = ({ person, size = 'sm', showLabel = true }) => {
  const { 
    addPersonToComparison, 
    removePersonFromComparison, 
    isPersonSelected,
    maxSelectionReached 
  } = useComparison();

  const isSelected = isPersonSelected(person.username);
  const canAdd = !isSelected && !maxSelectionReached;

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    if (isSelected) {
      removePersonFromComparison(person.username);
    } else if (canAdd) {
      addPersonToComparison(person);
    }
  };

  const getButtonStyles = () => {
    const sizeStyles = {
      xs: "w-6 h-6 text-xs",
      sm: "w-8 h-8 text-sm",
      md: "w-10 h-10 text-sm",
      lg: "w-12 h-12 text-base"
    };

    return `rounded-full flex items-center justify-center transition-all duration-200 ${sizeStyles[size]} font-semibold`;
  };

  const getButtonStyleProps = () => {
    if (isSelected) {
      return {
        style: {
          backgroundColor: '#ef4444',
          color: '#ffffff',
          border: 'none'
        }
      };
    } else if (canAdd) {
      return {
        style: {
          backgroundColor: '#CDDC39',
          color: '#000000',
          border: 'none'
        }
      };
    } else {
      return {
        style: {
          backgroundColor: 'var(--torre-bg-tertiary)',
          color: 'var(--torre-text-muted)',
          border: 'none',
          cursor: 'not-allowed'
        }
      };
    }
  };

  const getIcon = () => {
    const iconSize = size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'md' ? 16 : 18;
    
    if (isSelected) {
      return <UserMinus size={iconSize} />;
    } else {
      return <UserPlus size={iconSize} />;
    }
  };

  const getLabel = () => {
    if (!showLabel) return null;
    
    if (isSelected) {
      return 'Remove';
    } else if (canAdd) {
      return 'Compare';
    } else {
      return 'Max reached';
    }
  };

  const getTooltip = () => {
    if (isSelected) {
      return 'Remove from comparison';
    } else if (canAdd) {
      return 'Add to comparison';
    } else {
      return 'Maximum 4 people can be compared';
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={!canAdd && !isSelected}
      className={getButtonStyles()}
      {...getButtonStyleProps()}
      title={getTooltip()}
      whileHover={canAdd || isSelected ? { scale: 1.05 } : {}}
      whileTap={canAdd || isSelected ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {getIcon()}
    </motion.button>
  );
};

// Floating comparison panel component
export const ComparisonPanel = ({ onNavigateToCompare }) => {
  const { isDark } = useTheme();
  const {
    selectedPeople,
    clearComparison,
    removePersonFromComparison,
    compareSelectedPeople,
    canCompare,
    isLoading
  } = useComparison();

  const [isComparing, setIsComparing] = useState(false);

  const handleCompare = async () => {
    setIsComparing(true);
    try {
      await compareSelectedPeople();
      // Add delay for better UX
      setTimeout(() => {
        if (onNavigateToCompare) {
          onNavigateToCompare();
        }
        setIsComparing(false);
      }, 1500);
    } catch (error) {
      setIsComparing(false);
    }
  };

  if (selectedPeople.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.8 }}
        transition={{ 
          type: "spring", 
          damping: 20, 
          stiffness: 300,
          duration: 0.3
        }}
        className="fixed bottom-6 right-6 rounded-xl shadow-2xl p-6 max-w-md z-50 backdrop-blur-sm"
        style={{
          backgroundColor: 'var(--torre-bg-primary)',
          border: '1px solid var(--torre-border)',
          boxShadow: isDark 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
            : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          color: 'var(--torre-text-primary)'
        }}
        drag={false}
        whileHover={{ scale: 1.02 }}
      >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={20} style={{ color: 'var(--torre-accent)' }} />
          <h3 className="font-semibold" style={{ color: 'var(--torre-text-primary)' }}>
            Compare ({selectedPeople.length})
          </h3>
        </div>
        <button
          onClick={clearComparison}
          className="transition-colors"
          style={{
            color: 'var(--torre-text-muted)',
            fontSize: '20px'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = 'var(--torre-text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = 'var(--torre-text-muted)';
          }}
          title="Clear selection"
        >
          ×
        </button>
      </div>

      <motion.div className="space-y-3 mb-5">
        <AnimatePresence>
          {selectedPeople.map((person, index) => (
            <motion.div 
              key={person.username} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 text-sm"
            >
              <Avatar
                src={person.picture}
                name={person.name}
                size="w-8 h-8"
              />
              <span className="flex-1 truncate" style={{ color: 'var(--torre-text-primary)' }}>
                {person.name}
              </span>
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removePersonFromComparison(person.username);
                }}
                className="transition-colors text-sm"
                style={{ color: '#ef4444' }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#ef4444';
                }}
                title="Remove"
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={16} />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <div className="flex gap-2">
        <motion.button
          onClick={handleCompare}
          disabled={!canCompare || isLoading || isComparing}
          className="flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all"
          style={{
            backgroundColor: canCompare && !isLoading && !isComparing ? '#CDDC39' : 'var(--torre-bg-tertiary)',
            color: canCompare && !isLoading && !isComparing ? '#000000' : 'var(--torre-text-muted)',
            cursor: canCompare && !isLoading && !isComparing ? 'pointer' : 'not-allowed'
          }}
          onMouseEnter={(e) => {
            if (canCompare && !isLoading && !isComparing) {
              e.target.style.backgroundColor = '#C0CA33';
            }
          }}
          onMouseLeave={(e) => {
            if (canCompare && !isLoading && !isComparing) {
              e.target.style.backgroundColor = '#CDDC39';
            }
          }}
          whileHover={canCompare && !isLoading && !isComparing ? { scale: 1.02 } : {}}
          whileTap={canCompare && !isLoading && !isComparing ? { scale: 0.98 } : {}}
        >
          {(isLoading || isComparing) ? (
            <motion.div 
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div 
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span>
                {isComparing ? 'Analyzing...' : 'Comparing...'}
              </span>
            </motion.div>
          ) : (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Compare
            </motion.span>
          )}
        </motion.button>
      </div>

      {!canCompare && selectedPeople.length === 1 && (
        <p className="text-xs mt-3 text-center" style={{ color: 'var(--torre-text-muted)' }}>
          Add at least one more person to compare
        </p>
      )}
    </motion.div>
    </AnimatePresence>
  );
};

export default ComparisonButton;
