import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  TrendingUp,
  Award,
  Target,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Lightbulb,
  Search,
  Plus,
  User,
  UserPlus,
  ArrowLeft
} from 'lucide-react';
import { useComparison } from '../contexts/ComparisonContext.jsx';
import Avatar from './Avatar.jsx';
import SearchBar from './SearchBar.jsx';
import SearchResults from './SearchResults.jsx';
import useSearch from '../hooks/useSearch.js';

const ComparisonView = () => {
  const { 
    comparisons, 
    selectedPeople, 
    isLoading, 
    error, 
    addPersonToComparison, 
    clearComparison,
    compareSelectedPeople 
  } = useComparison();

  // Step-by-step flow state
  const [step, setStep] = useState('initial'); // 'initial', 'first-search', 'second-search', 'add-more', 'comparison'
  const [firstPerson, setFirstPerson] = useState(null);
  const [secondPerson, setSecondPerson] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Search hooks for each step
  const firstSearch = useSearch();
  const secondSearch = useSearch();
  const addMoreSearch = useSearch();

  // Handle person selection in different steps
  const handlePersonSelect = (person) => {
    if (step === 'first-search') {
      setFirstPerson(person);
      addPersonToComparison(person);
      setStep('second-search');
    } else if (step === 'second-search') {
      setSecondPerson(person);
      addPersonToComparison(person);
      setStep('comparison');
      // Automatically start comparison
      setTimeout(() => {
        compareSelectedPeople();
      }, 500);
    } else if (step === 'add-more') {
      addPersonToComparison(person);
    }
  };

  // Reset flow when clearing comparison
  useEffect(() => {
    if (selectedPeople.length === 0) {
      setStep('initial');
      setFirstPerson(null);
      setSecondPerson(null);
    }
  }, [selectedPeople.length]);

  // Initial state - no people selected
  if (step === 'initial') {
    return (
      <div className="text-center py-16">
        <Users className="mx-auto mb-6" style={{ color: 'var(--torre-text-muted)' }} size={64} />
        <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--torre-text-primary)' }}>
          Compare Torre Professionals
        </h3>
        <p className="text-lg mb-8" style={{ color: 'var(--torre-text-secondary)' }}>
          Discover similarities, differences, and complementary skills between professionals
        </p>

        <motion.button
          onClick={() => setStep('first-search')}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
          style={{
            backgroundColor: 'var(--torre-accent)',
            color: '#000000'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--torre-accent-dark)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'var(--torre-accent)';
          }}
        >
          <Search size={20} />
          Start Comparing
        </motion.button>
      </div>
    );
  }

  // First person search step
  if (step === 'first-search') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-3">
              <User style={{ color: 'var(--torre-accent)' }} size={32} />
              <h3 className="text-xl font-bold" style={{ color: 'var(--torre-text-primary)' }}>
                Select First Person
              </h3>
            </div>
            <p style={{ color: 'var(--torre-text-secondary)' }}>
              Search for the first professional you want to compare
            </p>
          </motion.div>
        </div>

        {/* Search Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <SearchBar
            query={firstSearch.query}
            onQueryChange={firstSearch.handleSearchChange}
            loading={firstSearch.loading}
            onClear={firstSearch.clearSearch}
            placeholder="Search for first person..."
          />
          
          <div className="max-h-96 overflow-y-auto">
            <SearchResults
              results={firstSearch.results}
              loading={firstSearch.loading}
              error={firstSearch.error}
              query={firstSearch.query}
              hasSearched={firstSearch.hasSearched}
              hasMore={firstSearch.hasMore}
              totalResults={firstSearch.totalResults}
              onLoadMore={firstSearch.loadMore}
              onPersonClick={handlePersonSelect}
              onRetry={firstSearch.retrySearch}
              onClear={firstSearch.clearSearch}
              showAddButton={false}
              selectButtonText="Select for Comparison"
            />
          </div>
        </motion.div>

        {/* Back button */}
        <div className="text-center">
          <button
            onClick={() => setStep('initial')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ color: 'var(--torre-text-secondary)' }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>
    );
  }

  // Second person search step
  if (step === 'second-search') {
    return (
      <div className="space-y-6">
        {/* Progress indicator */}
        <div className="text-center py-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div className="flex items-center gap-2">
              <CheckCircle style={{ color: 'var(--torre-green)' }} size={20} />
              <span className="text-sm font-medium" style={{ color: 'var(--torre-text-secondary)' }}>
                {firstPerson?.name}
              </span>
            </div>
            <ArrowRight style={{ color: 'var(--torre-text-muted)' }} size={16} />
            <div className="flex items-center gap-2">
              <UserPlus style={{ color: 'var(--torre-accent)' }} size={20} />
              <span className="text-sm font-medium" style={{ color: 'var(--torre-text-secondary)' }}>
                Select second person
              </span>
            </div>
          </motion.div>
        </div>

        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold" style={{ color: 'var(--torre-text-primary)' }}>
              Select Second Person
            </h3>
            <p style={{ color: 'var(--torre-text-secondary)' }}>
              Search for the second professional to compare with {firstPerson?.name}
            </p>
          </motion.div>
        </div>

        {/* Search Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <SearchBar
            query={secondSearch.query}
            onQueryChange={secondSearch.handleSearchChange}
            loading={secondSearch.loading}
            onClear={secondSearch.clearSearch}
            placeholder="Search for second person..."
          />
          
          <div className="max-h-96 overflow-y-auto">
            <SearchResults
              results={secondSearch.results}
              loading={secondSearch.loading}
              error={secondSearch.error}
              query={secondSearch.query}
              hasSearched={secondSearch.hasSearched}
              hasMore={secondSearch.hasMore}
              totalResults={secondSearch.totalResults}
              onLoadMore={secondSearch.loadMore}
              onPersonClick={handlePersonSelect}
              onRetry={secondSearch.retrySearch}
              onClear={secondSearch.clearSearch}
              showAddButton={false}
              selectButtonText="Compare Now"
            />
          </div>
        </motion.div>

        {/* Back button */}
        <div className="text-center">
          <button
            onClick={() => {
              setStep('first-search');
              setFirstPerson(null);
              clearComparison();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ color: 'var(--torre-text-secondary)' }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto" 
               style={{ borderColor: 'var(--torre-accent)', borderTopColor: 'transparent' }} />
          <h3 className="text-xl font-bold" style={{ color: 'var(--torre-text-primary)' }}>
            Analyzing Profiles
          </h3>
          <p style={{ color: 'var(--torre-text-secondary)' }}>
            Comparing skills, experience, and professional strengths between {firstPerson?.name} and {secondPerson?.name}...
          </p>
          
          {/* Progress indicators */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-2">
              <Avatar person={firstPerson} size="sm" />
              <span className="text-sm font-medium" style={{ color: 'var(--torre-text-secondary)' }}>
                {firstPerson?.name}
              </span>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <ArrowRight style={{ color: 'var(--torre-accent)' }} size={20} />
            </motion.div>
            <div className="flex items-center gap-2">
              <Avatar person={secondPerson} size="sm" />
              <span className="text-sm font-medium" style={{ color: 'var(--torre-text-secondary)' }}>
                {secondPerson?.name}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-16">
        <XCircle className="mx-auto mb-6" style={{ color: '#ef4444' }} size={64} />
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--torre-text-primary)' }}>
          Comparison Error
        </h3>
        <p className="mb-6" style={{ color: '#ef4444' }}>
          {error}
        </p>
        <button
          onClick={() => {
            setStep('initial');
            clearComparison();
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
          style={{
            backgroundColor: 'var(--torre-accent)',
            color: '#000000'
          }}
        >
          Start Over
        </button>
      </div>
    );
  }

  // Comparison results state
  if (step === 'comparison' && comparisons.length > 0) {
    const comparison = comparisons[0]; // Get the first comparison
    
    const tabs = [
      { id: 'overview', label: 'Overview', icon: BarChart3 },
      { id: 'skills', label: 'Skills Analysis', icon: Target },
      { id: 'insights', label: 'Insights', icon: Lightbulb }
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header with Add People option */}
        <div className="rounded-xl shadow-lg border p-6" 
             style={{ backgroundColor: 'var(--torre-bg-secondary)', borderColor: 'var(--torre-border)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--torre-text-primary)' }}>
                <Users style={{ color: 'var(--torre-accent)' }} size={28} />
                Professional Comparison
              </h2>
              <p className="mt-1" style={{ color: 'var(--torre-text-secondary)' }}>
                Analyzing {selectedPeople.length} professionals • {comparison.overallScore ? Math.round(comparison.overallScore * 100) : 0}% compatibility
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('add-more')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: 'var(--torre-bg-tertiary)',
                  color: 'var(--torre-text-secondary)',
                  border: '1px solid var(--torre-border)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--torre-accent-light)';
                  e.target.style.color = 'var(--torre-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--torre-bg-tertiary)';
                  e.target.style.color = 'var(--torre-text-secondary)';
                }}
              >
                <Plus size={16} />
                Add People
              </button>

              <button
                onClick={() => {
                  setStep('initial');
                  clearComparison();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--torre-text-muted)',
                  border: '1px solid var(--torre-border)'
                }}
              >
                Start Over
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? 'var(--torre-accent-light)' : 'transparent',
                    color: isActive ? 'var(--torre-accent)' : 'var(--torre-text-secondary)',
                    border: '1px solid transparent'
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-xl shadow-lg border p-6" 
             style={{ backgroundColor: 'var(--torre-bg-secondary)', borderColor: 'var(--torre-border)' }}>
          {activeTab === 'overview' && <OverviewTab comparison={comparison} />}
          {activeTab === 'skills' && <SkillsTab comparison={comparison} />}
          {activeTab === 'insights' && <InsightsTab comparison={comparison} />}
        </div>
      </motion.div>
    );
  }

  // Add more people step
  if (step === 'add-more') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-3">
              <Plus style={{ color: 'var(--torre-accent)' }} size={32} />
              <h3 className="text-xl font-bold" style={{ color: 'var(--torre-text-primary)' }}>
                Add More People
              </h3>
            </div>
            <p style={{ color: 'var(--torre-text-secondary)' }}>
              Search for additional professionals to include in the comparison
            </p>
          </motion.div>
        </div>

        {/* Current selection */}
        <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--torre-bg-tertiary)', borderColor: 'var(--torre-border)' }}>
          <h4 className="font-semibold mb-3" style={{ color: 'var(--torre-text-primary)' }}>
            Currently Comparing ({selectedPeople.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedPeople.map((person) => (
              <div key={person.username} className="flex items-center gap-2 px-3 py-1 rounded-full text-sm" 
                   style={{ backgroundColor: 'var(--torre-bg-secondary)', border: '1px solid var(--torre-border)' }}>
                <Avatar person={person} size="xs" />
                <span style={{ color: 'var(--torre-text-secondary)' }}>{person.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <SearchBar
            query={addMoreSearch.query}
            onQueryChange={addMoreSearch.handleSearchChange}
            loading={addMoreSearch.loading}
            onClear={addMoreSearch.clearSearch}
            placeholder="Search for more people to add..."
          />
          
          <div className="max-h-96 overflow-y-auto">
            <SearchResults
              results={addMoreSearch.results}
              loading={addMoreSearch.loading}
              error={addMoreSearch.error}
              query={addMoreSearch.query}
              hasSearched={addMoreSearch.hasSearched}
              hasMore={addMoreSearch.hasMore}
              totalResults={addMoreSearch.totalResults}
              onLoadMore={addMoreSearch.loadMore}
              onPersonClick={handlePersonSelect}
              onRetry={addMoreSearch.retrySearch}
              onClear={addMoreSearch.clearSearch}
              showAddButton={false}
              selectButtonText="Add to Comparison"
              excludeUsernames={selectedPeople.map(p => p.username)}
            />
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep('comparison')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ color: 'var(--torre-text-secondary)' }}
          >
            <ArrowLeft size={16} />
            Back to Comparison
          </button>

          {selectedPeople.length >= 2 && (
            <button
              onClick={() => {
                setStep('comparison');
                compareSelectedPeople();
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: 'var(--torre-accent)',
                color: '#000000'
              }}
            >
              Update Comparison
            </button>
          )}
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="text-center py-12">
      <AlertCircle className="mx-auto mb-4" style={{ color: 'var(--torre-accent)' }} size={48} />
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--torre-text-primary)' }}>
        Ready to Compare
      </h3>
      <p style={{ color: 'var(--torre-text-secondary)' }}>
        Select people to start comparing their professional profiles
      </p>
    </div>
  );
};
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.color = 'var(--torre-text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.color = 'var(--torre-text-secondary)';
                  }
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Interface */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 pb-4 space-y-4"
              style={{ borderBottom: '1px solid var(--torre-border)' }}
            >
              <div className="text-center mb-4">
                <h4 className="font-medium mb-2" style={{ color: 'var(--torre-text-primary)' }}>
                  Search for People to Compare
                </h4>
                <p className="text-sm" style={{ color: 'var(--torre-text-secondary)' }}>
                  Search and add multiple people to your comparison
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <SearchBar
                  query={query}
                  onQueryChange={handleSearchChange}
                  loading={searchLoading}
                  onClear={() => {
                    clearSearch();
                    // Don't close search, just clear results
                  }}
                  placeholder="Search for more people to compare..."
                />
              </div>

              {(hasSearched || searchLoading) && (
                <div className="max-h-96 overflow-y-auto">
                  <SearchResults
                    results={results}
                    loading={searchLoading}
                    error={searchError}
                    query={query}
                    hasSearched={hasSearched}
                    hasMore={hasMore}
                    totalResults={totalResults}
                    onLoadMore={loadMore}
                    onPersonClick={(person) => {
                      addPersonToComparison(person);
                      // Clear search after adding but keep search open
                      clearSearch();
                    }}
                    onRetry={retrySearch}
                    onClear={() => {
                      clearSearch();
                    }}
                    showAddButton={true}
                    compact={true}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OverviewTab comparisons={comparisons} selectedPeople={selectedPeople} />
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SkillsTab comparisons={comparisons} />
            </motion.div>
          )}

          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RecommendationsTab comparisons={comparisons} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ comparisons, selectedPeople }) => {
  return (
    <div className="space-y-6">
      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {selectedPeople.map((person) => (
          <div key={person.username} className="rounded-lg p-4" style={{ backgroundColor: 'var(--torre-bg-secondary)' }}>
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                src={person.picture}
                name={person.name}
                size="w-12 h-12"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate" style={{ color: 'var(--torre-text-primary)' }}>{person.name}</h3>
                <p className="text-sm truncate" style={{ color: 'var(--torre-text-secondary)' }}>@{person.username}</p>
              </div>
            </div>
            <p className="text-sm line-clamp-2" style={{ color: 'var(--torre-text-secondary)' }}>
              {person.professionalHeadline || 'Professional'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {person.verified && (
                <CheckCircle style={{ color: '#10b981' }} size={16} />
              )}
              <span className="text-xs" style={{ color: 'var(--torre-text-muted)' }}>
                {Math.round((person.completion || 0) * 100)}% complete
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Matrix */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="text-blue-600" size={20} />
          Similarity Matrix
        </h3>
        
        <div className="space-y-3">
          {comparisons.map((comparison) => (
            <ComparisonCard key={comparison.id} comparison={comparison} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Skills Tab Component
const SkillsTab = ({ comparisons }) => {
  return (
    <div className="space-y-6">
      {comparisons.map((comparison) => (
        <SkillsComparisonCard key={comparison.id} comparison={comparison} />
      ))}
    </div>
  );
};

// Recommendations Tab Component
const RecommendationsTab = ({ comparisons }) => {
  return (
    <div className="space-y-6">
      {comparisons.map((comparison) => (
        <RecommendationCard key={comparison.id} comparison={comparison} />
      ))}
    </div>
  );
};

// Individual Comparison Card
const ComparisonCard = ({ comparison }) => {
  const { person1, person2, similarity } = comparison;
  const scoreColor = similarity.overallScore > 0.7 ? 'var(--torre-green)' :
                    similarity.overallScore > 0.4 ? 'var(--torre-accent)' : 'var(--torre-red)';

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--torre-bg-primary)', border: '1px solid var(--torre-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar
              src={person1.picture}
              name={person1.name}
              size="w-8 h-8"
            />
            <span className="font-medium" style={{ color: 'var(--torre-text-primary)' }}>{person1.name}</span>
          </div>
          <ArrowRight style={{ color: 'var(--torre-text-muted)' }} size={16} />
          <div className="flex items-center gap-2">
            <Avatar
              src={person2.picture}
              name={person2.name}
              size="w-8 h-8"
            />
            <span className="font-medium" style={{ color: 'var(--torre-text-primary)' }}>{person2.name}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-2xl font-bold ${scoreColor}`}>
            {Math.round(similarity.overallScore * 100)}%
          </div>
          <div className="text-xs text-gray-500">similarity</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(similarity.skillsScore * 100)}%
          </div>
          <div className="text-xs text-gray-500">Skills</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(similarity.strengthsScore * 100)}%
          </div>
          <div className="text-xs text-gray-500">Strengths</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(similarity.experienceScore * 100)}%
          </div>
          <div className="text-xs text-gray-500">Experience</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900">
            {similarity.details.commonSkills.length}
          </div>
          <div className="text-xs text-gray-500">Common</div>
        </div>
      </div>
    </div>
  );
};

// Skills Comparison Card
const SkillsComparisonCard = ({ comparison }) => {
  const { person1, person2, similarity } = comparison;

  return (
    <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--torre-bg-primary)', border: '1px solid var(--torre-border)' }}>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Avatar
            src={person1.picture}
            name={person1.name}
            size="w-10 h-10"
          />
          <span className="font-semibold" style={{ color: 'var(--torre-text-primary)' }}>{person1.name}</span>
        </div>
        <ArrowRight style={{ color: 'var(--torre-text-muted)' }} size={20} />
        <div className="flex items-center gap-2">
          <Avatar
            src={person2.picture}
            name={person2.name}
            size="w-10 h-10"
          />
          <span className="font-semibold" style={{ color: 'var(--torre-text-primary)' }}>{person2.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Common Skills with Visual Bars */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--torre-text-primary)' }}>
            <CheckCircle style={{ color: 'var(--torre-green)' }} size={16} />
            Common Skills ({similarity.details.commonSkills.length})
          </h4>
          <div className="space-y-4">
            {similarity.details.commonSkills.slice(0, 8).map((skill, index) => {
              const prof1 = Math.round(skill.proficiency1 * 100);
              const prof2 = Math.round(skill.proficiency2 * 100);
              const difference = Math.abs(prof1 - prof2);

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium" style={{ color: 'var(--torre-text-primary)' }}>
                      {skill.name}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--torre-text-secondary)' }}>
                      {difference}% diff
                    </span>
                  </div>

                  {/* Visual comparison bars */}
                  <div className="space-y-1">
                    {/* Person 1 bar */}
                    <div className="flex items-center gap-2">
                      <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--torre-bg-tertiary)' }}>
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${prof1}%`,
                            backgroundColor: '#3B82F6' // Blue for person 1
                          }}
                        />
                      </div>
                      <span className="text-xs w-10 text-right" style={{ color: 'var(--torre-text-secondary)' }}>
                        {prof1}%
                      </span>
                    </div>

                    {/* Person 2 bar */}
                    <div className="flex items-center gap-2">
                      <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--torre-bg-tertiary)' }}>
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${prof2}%`,
                            backgroundColor: '#8B5CF6' // Purple for person 2
                          }}
                        />
                      </div>
                      <span className="text-xs w-10 text-right" style={{ color: 'var(--torre-text-secondary)' }}>
                        {prof2}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unique Skills Person 1 */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--torre-text-primary)' }}>
            <Award style={{ color: '#3B82F6' }} size={16} />
            {person1.name}'s Unique Skills
          </h4>
          <div className="space-y-2">
            {similarity.details.uniqueSkills1.slice(0, 8).map((skill, index) => (
              <div key={index} className="text-sm" style={{ color: 'var(--torre-text-secondary)' }}>
                {skill.name}
              </div>
            ))}
          </div>
        </div>

        {/* Unique Skills Person 2 */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--torre-text-primary)' }}>
            <Award style={{ color: '#8B5CF6' }} size={16} />
            {person2.name}'s Unique Skills
          </h4>
          <div className="space-y-2">
            {similarity.details.uniqueSkills2.slice(0, 8).map((skill, index) => (
              <div key={index} className="text-sm" style={{ color: 'var(--torre-text-secondary)' }}>
                {skill.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Recommendation Card
const RecommendationCard = ({ comparison }) => {
  const { person1, person2, similarity } = comparison;

  // Generate enhanced insights based on the comparison data
  const generateEnhancedInsights = () => {
    const insights = [];

    // Collaboration potential
    if (similarity.overallScore > 0.6) {
      insights.push({
        type: 'collaboration',
        title: 'Strong Collaboration Potential',
        description: `${person1.name} and ${person2.name} have ${Math.round(similarity.overallScore * 100)}% compatibility, indicating excellent potential for collaborative work.`,
        priority: 'high'
      });
    } else if (similarity.overallScore > 0.3) {
      insights.push({
        type: 'complementary',
        title: 'Complementary Skills Partnership',
        description: `These professionals have complementary skills that could create a strong collaborative team with diverse capabilities.`,
        priority: 'medium'
      });
    } else {
      insights.push({
        type: 'diverse',
        title: 'Diverse Skill Sets',
        description: `Very different skill sets could bring valuable diversity to a team or project, offering unique perspectives.`,
        priority: 'medium'
      });
    }

    // Skills analysis
    if (similarity.details.commonSkills.length > 5) {
      insights.push({
        type: 'skills',
        title: 'Shared Expertise Areas',
        description: `Both professionals excel in ${similarity.details.commonSkills.length} common areas, enabling knowledge sharing and peer mentoring.`,
        priority: 'medium'
      });
    }

    // Skill gaps and learning opportunities
    if (similarity.details.skillGaps.length > 0) {
      const topGap = similarity.details.skillGaps[0];
      insights.push({
        type: 'learning',
        title: 'Knowledge Transfer Opportunity',
        description: `${topGap.missingIn === 'person1' ? person1.name : person2.name} could benefit from learning ${topGap.skill} from their counterpart.`,
        priority: 'medium'
      });
    }

    // Team composition insights
    if (similarity.details.uniqueSkills1.length > 3 && similarity.details.uniqueSkills2.length > 3) {
      insights.push({
        type: 'team',
        title: 'Well-Rounded Team Potential',
        description: `Together, they bring a comprehensive skill set covering both overlapping expertise and unique specializations.`,
        priority: 'high'
      });
    }

    return insights;
  };

  const insights = generateEnhancedInsights();

  return (
    <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--torre-bg-primary)', border: '1px solid var(--torre-border)' }}>
      <div className="flex items-center gap-4 mb-4">
        <Lightbulb style={{ color: 'var(--torre-accent)' }} size={24} />
        <h4 className="font-semibold" style={{ color: 'var(--torre-text-primary)' }}>
          Insights: {person1.name} & {person2.name}
        </h4>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--torre-bg-secondary)' }}>
            <div
              className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
              style={{
                backgroundColor: insight.priority === 'high' ? 'var(--torre-green)' :
                                insight.priority === 'medium' ? 'var(--torre-accent)' : 'var(--torre-text-muted)'
              }}
            />
            <div className="flex-1">
              <h5 className="font-medium mb-1" style={{ color: 'var(--torre-text-primary)' }}>
                {insight.title}
              </h5>
              <p className="text-sm" style={{ color: 'var(--torre-text-secondary)' }}>
                {insight.description}
              </p>
            </div>
          </div>
        ))}

        {/* Additional metrics */}
        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--torre-bg-secondary)' }}>
          <h5 className="font-medium mb-3" style={{ color: 'var(--torre-text-primary)' }}>
            Compatibility Breakdown
          </h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm" style={{ color: 'var(--torre-text-secondary)' }}>Skills Overlap</span>
              <div className="font-semibold" style={{ color: 'var(--torre-text-primary)' }}>
                {Math.round(similarity.skillsScore * 100)}%
              </div>
            </div>
            <div>
              <span className="text-sm" style={{ color: 'var(--torre-text-secondary)' }}>Experience Match</span>
              <div className="font-semibold" style={{ color: 'var(--torre-text-primary)' }}>
                {Math.round(similarity.experienceScore * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
