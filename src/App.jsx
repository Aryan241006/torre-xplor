import React from 'react';
import SearchPage from './pages/SearchPage';
import { ToastProvider } from './components/Toast';
import { ComparisonProvider } from './contexts/ComparisonContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ComparisonProvider>
          <div className="min-h-screen" style={{ backgroundColor: 'var(--torre-bg-primary)' }}>
            {/* Fixed Theme Toggle */}
            <ThemeToggle size="md" showLabel={false} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <SearchPage />
            </main>
          </div>
        </ComparisonProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
