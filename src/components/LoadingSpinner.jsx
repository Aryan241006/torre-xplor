import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * LoadingSpinner component with different variants
 * @param {Object} props - Component props
 * @param {string} props.size - Size variant ('sm', 'md', 'lg', 'xl')
 * @param {string} props.variant - Style variant ('primary', 'secondary', 'white')
 * @param {string} props.text - Optional loading text
 * @param {boolean} props.fullScreen - Whether to show as full screen overlay
 * @param {string} props.className - Additional CSS classes
 */
const LoadingSpinner = ({
  size = 'md',
  variant = 'primary',
  text = '',
  fullScreen = false,
  className = '',
}) => {
  // Size configurations
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  // Variant configurations
  const variantClasses = {
    primary: 'var(--torre-accent)',
    secondary: 'var(--torre-text-muted)',
    white: '#ffffff',
  };

  // Text size based on spinner size
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const spinnerElement = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col items-center justify-center ${className}`}
    >
      <Loader2
        className={`animate-spin ${sizeClasses[size]}`}
        style={{ color: variantClasses[variant] }}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mt-3 ${textSizeClasses[size]} font-medium`}
          style={{ color: variantClasses[variant] }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center"
        style={{
          backgroundColor: 'var(--torre-bg-primary)',
          opacity: 0.95
        }}
      >
        {spinnerElement}
      </motion.div>
    );
  }

  return spinnerElement;
};

/**
 * Skeleton loading component for cards
 */
export const SkeletonCard = ({ className = '' }) => {
  return (
    <div
      className={`card-iconoir overflow-hidden ${className}`}
    >
      <div className="p-6">
        {/* Header skeleton */}
        <div className="flex items-start space-x-4 mb-4">
          <div
            className="w-16 h-16 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--torre-bg-tertiary)' }}
          ></div>
          <div className="flex-1 space-y-2">
            <div
              className="h-5 rounded animate-pulse w-3/4"
              style={{ backgroundColor: 'var(--torre-bg-tertiary)' }}
            ></div>
            <div
              className="h-4 rounded animate-pulse w-full"
              style={{ backgroundColor: 'var(--torre-bg-tertiary)' }}
            ></div>
            <div
              className="h-3 rounded animate-pulse w-1/2"
              style={{ backgroundColor: 'var(--torre-bg-tertiary)' }}
            ></div>
          </div>
        </div>

        {/* Location skeleton */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="h-4 rounded animate-pulse w-24"
            style={{ backgroundColor: 'var(--torre-bg-tertiary)' }}
          ></div>
          <div
            className="h-4 rounded animate-pulse w-20"
            style={{ backgroundColor: 'var(--torre-bg-tertiary)' }}
          ></div>
        </div>

        {/* Skills skeleton */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <div
              className="h-6 rounded-full animate-pulse w-16"
              style={{ backgroundColor: 'var(--torre-bg-tertiary)' }}
            ></div>
            <div
              className="h-6 rounded-full animate-pulse w-20"
              style={{ backgroundColor: 'var(--torre-bg-tertiary)' }}
            ></div>
            <div
              className="h-6 rounded-full animate-pulse w-14"
              style={{ backgroundColor: 'var(--torre-bg-tertiary)' }}
            ></div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div
          className="flex items-center justify-between pt-4 border-t"
          style={{ borderColor: 'var(--torre-border)' }}
        >
          <div className="flex items-center gap-4">
            <div
              className="h-4 rounded animate-pulse w-8"
              style={{ backgroundColor: 'var(--torre-bg-tertiary)' }}
            ></div>
            <div
              className="h-4 rounded animate-pulse w-8"
              style={{ backgroundColor: 'var(--torre-bg-tertiary)' }}
            ></div>
            <div
              className="h-4 rounded animate-pulse w-8"
              style={{ backgroundColor: 'var(--torre-bg-tertiary)' }}
            ></div>
          </div>
          <div
            className="h-4 rounded animate-pulse w-20"
            style={{ backgroundColor: 'var(--torre-bg-tertiary)' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Grid of skeleton cards for loading state
 */
export const SkeletonGrid = ({ count = 6, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

/**
 * Inline loading component for buttons
 */
export const InlineLoader = ({ size = 'sm', className = '' }) => {
  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};

/**
 * Pulsing dot loader
 */
export const DotLoader = ({ variant = 'primary', className = '' }) => {
  const dotVariantStyles = {
    primary: { backgroundColor: 'var(--torre-accent)' },
    secondary: { backgroundColor: 'var(--torre-text-muted)' },
    white: { backgroundColor: '#ffffff' },
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 rounded-full"
          style={dotVariantStyles[variant]}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;
