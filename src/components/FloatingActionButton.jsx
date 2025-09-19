import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ArrowUp, 
  RefreshCw, 
  Download,
  Share2,
  X
} from 'lucide-react';

/**
 * FloatingActionButton component with expandable menu
 * @param {Object} props - Component props
 * @param {Function} props.onScrollToTop - Function to scroll to top
 * @param {Function} props.onRefresh - Function to refresh data
 * @param {Function} props.onExport - Function to export data
 * @param {Function} props.onShare - Function to share results
 * @param {boolean} props.showScrollToTop - Whether to show scroll to top
 * @param {boolean} props.hasResults - Whether there are search results
 */
const FloatingActionButton = ({
  onScrollToTop,
  onRefresh,
  onExport,
  onShare,
  showScrollToTop = false,
  hasResults = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAction = (action) => {
    action();
    setIsExpanded(false);
  };

  const actions = [
    {
      icon: ArrowUp,
      label: 'Scroll to Top',
      action: onScrollToTop,
      show: showScrollToTop,
      bgColor: 'var(--torre-text-muted)',
      hoverColor: 'var(--torre-text-secondary)',
    },
    {
      icon: RefreshCw,
      label: 'Refresh',
      action: onRefresh,
      show: hasResults,
      bgColor: 'var(--torre-accent)',
      hoverColor: 'var(--torre-accent-dark)',
    },
    {
      icon: Download,
      label: 'Export Data',
      action: onExport,
      show: hasResults,
      bgColor: 'var(--torre-accent)',
      hoverColor: 'var(--torre-accent-dark)',
    },
    {
      icon: Share2,
      label: 'Share Results',
      action: onShare,
      show: hasResults,
      bgColor: 'var(--torre-accent)',
      hoverColor: 'var(--torre-accent-dark)',
    },
  ].filter(action => action.show);

  if (actions.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                    transition: { delay: index * 0.1 }
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.8, 
                    y: 20,
                    transition: { delay: (actions.length - index - 1) * 0.05 }
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction(action.action)}
                  className="flex items-center gap-3 px-4 py-3 rounded-full shadow-lg font-medium transition-all duration-200 group"
                  style={{
                    backgroundColor: action.bgColor,
                    color: action.bgColor === 'var(--torre-accent)' ? '#000000' : '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = action.hoverColor;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = action.bgColor;
                  }}
                  title={action.label}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="text-sm whitespace-nowrap">
                    {action.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleExpanded}
        className="w-14 h-14 rounded-full shadow-lg font-bold text-xl transition-all duration-300 flex items-center justify-center"
        style={{
          backgroundColor: isExpanded ? 'var(--torre-red)' : 'var(--torre-accent)',
          color: isExpanded ? '#ffffff' : '#000000',
          transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = isExpanded ? 'var(--torre-red)' : 'var(--torre-accent-dark)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = isExpanded ? 'var(--torre-red)' : 'var(--torre-accent)';
        }}
        title={isExpanded ? 'Close menu' : 'Open menu'}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </motion.div>
      </motion.button>
    </div>
  );
};

/**
 * Simple scroll to top button
 */
export const ScrollToTopButton = ({ show = false }) => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!show) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
      title="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </motion.button>
  );
};

export default FloatingActionButton;
