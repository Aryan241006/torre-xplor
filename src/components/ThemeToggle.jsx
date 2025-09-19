import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ size = 'md', showLabel = false }) => {
  const { isDarkMode, toggleTheme, isSystemTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-12 h-6',
    md: 'w-14 h-7',
    lg: 'w-16 h-8'
  };

  const sliderSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  const slideDistances = {
    sm: 24,
    md: 28,
    lg: 32
  };

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <span className="text-sm font-medium" style={{ color: 'var(--torre-text-secondary)' }}>
          {isSystemTheme ? 'System' : (isDarkMode ? 'Dark' : 'Light')}
        </span>
      )}

      <motion.button
        onClick={toggleTheme}
        className="theme-toggle flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={
          isSystemTheme 
            ? `System theme (${isDarkMode ? 'dark' : 'light'}). Click to switch to manual mode.`
            : `Switch to ${isDarkMode ? 'light' : 'dark'} mode`
        }
        title={
          isSystemTheme 
            ? `Following system theme (${isDarkMode ? 'dark' : 'light'}). Click to override.`
            : `Switch to ${isDarkMode ? 'light' : 'dark'} mode`
        }
      >
        {isSystemTheme ? (
          <Monitor
            size={18}
            style={{ color: 'var(--torre-text-primary)' }}
          />
        ) : isDarkMode ? (
          <Moon
            size={18}
            style={{ color: 'var(--torre-text-primary)' }}
          />
        ) : (
          <Sun
            size={18}
            style={{ color: 'var(--torre-text-primary)' }}
          />
        )}
      </motion.button>
    </div>
  );
};

export default ThemeToggle;
