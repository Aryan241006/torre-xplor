import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Helper function to get system preference
  const getSystemPreference = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  };

  // Simple initialization - ALWAYS check system first, then localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const systemPrefersDark = getSystemPreference();
    const savedTheme = localStorage.getItem('torre-explorer-theme');
    
    // If no preference saved, use system
    if (!savedTheme) {
      return systemPrefersDark;
    }
    
    // If system preference saved, use system
    if (savedTheme === 'system') {
      return systemPrefersDark;
    }
    
    // Use saved manual preference
    return savedTheme === 'dark';
  });

  const [isSystemTheme, setIsSystemTheme] = useState(() => {
    const savedTheme = localStorage.getItem('torre-explorer-theme');
    return !savedTheme || savedTheme === 'system';
  });

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      // Only update if user hasn't manually overridden
      if (isSystemTheme) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [isSystemTheme]);

  useEffect(() => {
    // Save theme preference to localStorage
    if (isSystemTheme) {
      localStorage.setItem('torre-explorer-theme', 'system');
    } else {
      localStorage.setItem('torre-explorer-theme', isDarkMode ? 'dark' : 'light');
    }

    // Apply theme to document root
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark-mode');
      root.classList.add('dark'); // Add Tailwind dark mode class
    } else {
      root.classList.remove('dark-mode');
      root.classList.remove('dark'); // Remove Tailwind dark mode class
    }

    // Remove preload class to enable transitions after initial load
    setTimeout(() => {
      document.body.classList.remove('preload');
    }, 100);
  }, [isDarkMode, isSystemTheme]);

  useEffect(() => {
    // Add preload class to prevent transitions on initial load
    document.body.classList.add('preload');
    
    // Ensure system preference is saved if no preference exists
    const savedTheme = localStorage.getItem('torre-explorer-theme');
    if (!savedTheme) {
      localStorage.setItem('torre-explorer-theme', 'system');
    }
  }, []);

  const toggleTheme = () => {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (isSystemTheme) {
      // If currently using system theme, toggle to opposite of system
      setIsDarkMode(!systemPrefersDark);
      setIsSystemTheme(false);
    } else {
      // If manually set, cycle through: current -> opposite -> system
      if (isDarkMode !== systemPrefersDark) {
        // If different from system, go to system
        setIsDarkMode(systemPrefersDark);
        setIsSystemTheme(true);
      } else {
        // If same as system, toggle to opposite
        setIsDarkMode(!isDarkMode);
      }
    }
  };

  const resetToSystemTheme = () => {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(systemPrefersDark);
    setIsSystemTheme(true);
  };

  const value = {
    isDarkMode,
    toggleTheme,
    resetToSystemTheme,
    isSystemTheme,
    theme: isDarkMode ? 'dark' : 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
