import React from 'react';
import { AlertCircle, RefreshCw, X, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * ErrorMessage component with different variants and actions
 * @param {Object} props - Component props
 * @param {string} props.type - Error type ('error', 'warning', 'info', 'success')
 * @param {string} props.title - Error title
 * @param {string} props.message - Error message
 * @param {Function} props.onRetry - Retry function
 * @param {Function} props.onDismiss - Dismiss function
 * @param {boolean} props.dismissible - Whether the error can be dismissed
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Additional content
 */
const ErrorMessage = ({
  type = 'error',
  title,
  message,
  onRetry,
  onDismiss,
  dismissible = false,
  className = '',
  children,
}) => {
  // Configuration for different error types
  const typeConfig = {
    error: {
      icon: AlertCircle,
      bgColor: 'var(--torre-bg-secondary)',
      borderColor: 'var(--torre-red)',
      iconColor: 'var(--torre-red)',
      titleColor: 'var(--torre-text-primary)',
      messageColor: 'var(--torre-text-secondary)',
      buttonColor: 'var(--torre-red)',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'var(--torre-bg-secondary)',
      borderColor: 'var(--torre-accent)',
      iconColor: 'var(--torre-accent)',
      titleColor: 'var(--torre-text-primary)',
      messageColor: 'var(--torre-text-secondary)',
      buttonColor: 'var(--torre-accent)',
    },
    info: {
      icon: Info,
      bgColor: 'var(--torre-bg-secondary)',
      borderColor: 'var(--torre-accent)',
      iconColor: 'var(--torre-accent)',
      titleColor: 'var(--torre-text-primary)',
      messageColor: 'var(--torre-text-secondary)',
      buttonColor: 'var(--torre-accent)',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-500',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700',
      buttonColor: 'bg-green-600 hover:bg-green-700 text-white',
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`relative rounded-lg border p-4 ${className}`}
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
        borderWidth: '1px'
      }}
    >
      <div className="flex">
        {/* Icon */}
        <div className="flex-shrink-0">
          <IconComponent
            className="h-5 w-5"
            style={{ color: config.iconColor }}
          />
        </div>

        {/* Content */}
        <div className="ml-3 flex-1">
          {title && (
            <h3
              className="text-sm font-medium mb-1"
              style={{ color: config.titleColor }}
            >
              {title}
            </h3>
          )}

          {message && (
            <p
              className="text-sm"
              style={{ color: config.messageColor }}
            >
              {message}
            </p>
          )}

          {children && (
            <div className="mt-2">
              {children}
            </div>
          )}

          {/* Actions */}
          {(onRetry || onDismiss) && (
            <div className="mt-4 flex gap-2">
              {onRetry && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRetry}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
                  style={{
                    backgroundColor: config.buttonColor,
                    color: config.buttonColor === 'var(--torre-accent)' ? '#000000' : '#ffffff'
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </motion.button>
              )}
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
                  style={{
                    backgroundColor: 'transparent',
                    color: config.titleColor
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--torre-bg-tertiary)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onDismiss}
                className={`
                  inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${config.iconColor} hover:bg-black hover:bg-opacity-10
                  focus:ring-offset-${config.bgColor.split('-')[1]}-50 focus:ring-${config.iconColor.split('-')[1]}-600
                `}
                aria-label="Dismiss"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Specialized error components for common use cases
 */

export const NetworkError = ({ onRetry, onDismiss }) => (
  <ErrorMessage
    type="error"
    title="Network Error"
    message="Unable to connect to Torre servers. Please check your internet connection and try again."
    onRetry={onRetry}
    onDismiss={onDismiss}
    dismissible={!!onDismiss}
  />
);

export const SearchError = ({ query, onRetry, onDismiss }) => (
  <ErrorMessage
    type="error"
    title="Search Failed"
    message={`Unable to search for "${query}". This might be a temporary issue.`}
    onRetry={onRetry}
    onDismiss={onDismiss}
    dismissible={!!onDismiss}
  />
);

export const NoResults = ({ query, onClear }) => (
  <ErrorMessage
    type="info"
    title="No Results Found"
    message={`No people found matching "${query}". Try adjusting your search terms.`}
    onRetry={onClear}
    dismissible={false}
  >
    <div className="mt-2 text-sm" style={{ color: 'var(--torre-accent)' }}>
      <p>Search tips:</p>
      <ul className="list-disc list-inside mt-1 space-y-1">
        <li>Try different keywords or names</li>
        <li>Check for typos in your search</li>
        <li>Use broader search terms</li>
      </ul>
    </div>
  </ErrorMessage>
);

export const LoadingError = ({ onRetry }) => (
  <ErrorMessage
    type="warning"
    title="Loading Error"
    message="Something went wrong while loading the data."
    onRetry={onRetry}
  />
);

export const ValidationError = ({ message, onDismiss }) => (
  <ErrorMessage
    type="warning"
    title="Invalid Input"
    message={message}
    onDismiss={onDismiss}
    dismissible={!!onDismiss}
  />
);

export default ErrorMessage;
