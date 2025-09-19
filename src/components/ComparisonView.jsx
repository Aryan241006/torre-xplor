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
import StarRating from './StarRating.jsx';
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
  const [step, setStep] = useState('initial'); // 'initial', 'first-search', 'second-search', 'analyzing', 'comparison'
  const [firstPerson, setFirstPerson] = useState(null);
  const [secondPerson, setSecondPerson] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Search hooks for each step
  const firstSearch = useSearch();
  const secondSearch = useSearch();
  const addMoreSearch = useSearch();

  // Handle person selection in different steps
  const handlePersonSelect = (data) => {
    // Extract person from the data structure passed by SearchResults
    const person = data.person || data;
    
    if (step === 'first-search') {
      setFirstPerson(person);
      addPersonToComparison(person);
      setStep('second-search');
    } else if (step === 'second-search') {
      setSecondPerson(person);
      addPersonToComparison(person);
      setStep('analyzing');
      // Start comparison after a short delay
      setTimeout(() => {
        compareSelectedPeople().then(() => {
          setStep('comparison');
        });
      }, 1000);
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
    // Only auto-start comparison if we're on initial step AND have existing comparisons
    // This handles the case where user comes from comparison panel with pre-existing data
    else if (selectedPeople.length >= 2 && comparisons.length > 0 && step === 'initial') {
      setStep('comparison');
      setFirstPerson(selectedPeople[0]);
      setSecondPerson(selectedPeople[1]);
    }
  }, [selectedPeople.length, comparisons.length]); // Remove step from dependencies to prevent conflicts

  // Initial state - no people selected
  if (step === 'initial') {
    return (
      <div className="text-center py-8 sm:py-12 lg:py-16 px-4">
        <Users className="mx-auto mb-4 sm:mb-6" style={{ color: 'var(--torre-text-muted)' }} size={48} />
        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--torre-text-primary)' }}>
          Compare Torre Professionals
        </h3>
        <p className="text-base sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto" style={{ color: 'var(--torre-text-secondary)' }}>
          Discover similarities, differences, and complementary skills between professionals
        </p>

        <div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setStep('first-search');
            }}
            className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg"
            style={{
              backgroundColor: '#CDDC39',
              color: '#000000',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Search size={18} className="sm:w-5 sm:h-5" />
            Start Comparing
          </button>
        </div>
      </div>
    );
  }

  // First person search step
  if (step === 'first-search') {
    return (
      <div className="space-y-4 sm:space-y-6 px-4">
        {/* Back button */}
        <div className="flex justify-start">
          <button
            onClick={() => setStep('initial')}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ color: 'var(--torre-text-secondary)' }}
          >
            <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
            Back
          </button>
        </div>

        {/* Header */}
        <div className="text-center py-2 sm:py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 sm:space-y-4"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <User style={{ color: 'var(--torre-accent)' }} size={24} className="sm:w-8 sm:h-8" />
              <h3 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--torre-text-primary)' }}>
                Select First Person
              </h3>
            </div>
            <p className="text-sm sm:text-base" style={{ color: 'var(--torre-text-secondary)' }}>
              Search for the first professional you want to compare
            </p>
          </motion.div>
        </div>

        {/* Search Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 sm:space-y-6"
        >
          <div className="max-w-2xl mx-auto">
            <SearchBar
              query={firstSearch.query}
              onQueryChange={firstSearch.handleSearchChange}
              loading={firstSearch.loading}
              onClear={firstSearch.clearSearch}
              placeholder="Search for first person..."
            />
          </div>
          
          <div className="min-h-screen pb-16 sm:pb-20 lg:pb-24">
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
      </div>
    );
  }

  // Second person search step
  if (step === 'second-search') {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <div className="flex justify-start">
          <button
            onClick={() => {
              setStep('first-search');
              setFirstPerson(null);
              clearComparison();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ color: 'var(--torre-text-secondary)' }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

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
          className="space-y-6"
        >
          <div className="max-w-2xl mx-auto">
            <SearchBar
              query={secondSearch.query}
              onQueryChange={secondSearch.handleSearchChange}
              loading={secondSearch.loading}
              onClear={secondSearch.clearSearch}
              placeholder="Search for second person..."
            />
          </div>
          
          <div className="min-h-screen pb-24">
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
      </div>
    );
  }

  // Analyzing step - custom animation for comparison
  if (step === 'analyzing') {
    return (
      <div className="text-center py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 max-w-md mx-auto"
        >
          {/* Animated analyzing icon */}
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-20 h-20 mx-auto rounded-full border-4 border-t-transparent"
            style={{ borderColor: 'var(--torre-accent)', borderTopColor: 'transparent' }}
          />
          
          <motion.h3 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold" 
            style={{ color: 'var(--torre-text-primary)' }}
          >
            Analyzing Professionals
          </motion.h3>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg" 
            style={{ color: 'var(--torre-text-secondary)' }}
          >
            Comparing skills, experience, and compatibility between professionals...
          </motion.p>
          
          {/* Progress indicators */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-6 mt-8"
          >
            <div className="flex items-center gap-3">
              <Avatar person={firstPerson} size="md" />
              <span className="font-medium" style={{ color: 'var(--torre-text-secondary)' }}>
                {firstPerson?.name}
              </span>
            </div>
            
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ color: 'var(--torre-accent)' }}
            >
              <ArrowRight size={24} />
            </motion.div>
            
            <div className="flex items-center gap-3">
              <Avatar person={secondPerson} size="md" />
              <span className="font-medium" style={{ color: 'var(--torre-text-secondary)' }}>
                {secondPerson?.name}
              </span>
            </div>
          </motion.div>

          {/* Analyzing steps */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="space-y-2 text-sm"
            style={{ color: 'var(--torre-text-muted)' }}
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              • Fetching professional genomes...
            </motion.div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
            >
              • Analyzing skill compatibility...
            </motion.div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, delay: 1, repeat: Infinity }}
            >
              • Computing similarity scores...
            </motion.div>
          </motion.div>
        </motion.div>
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
            Analyzing People...
          </h3>
          <p style={{ color: 'var(--torre-text-secondary)' }}>
            Fetching professional data and comparing skills, experience, and strengths between {firstPerson?.name || selectedPeople[0]?.name} and {secondPerson?.name || selectedPeople[1]?.name}...
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
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 0.6,
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        className="space-y-6"
      >
        {/* Header with Add People option */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-xl shadow-lg p-6" 
          style={{ backgroundColor: 'var(--torre-bg-secondary)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--torre-text-primary)' }}>
                <Users style={{ color: 'var(--torre-accent)' }} size={28} />
                Professional Comparison
              </h2>
              <p className="mt-1 flex items-center gap-2" style={{ color: 'var(--torre-text-secondary)' }}>
                Analyzing {selectedPeople.length} professionals • 
                <StarRating 
                  rating={(comparison.similarity?.overallScore || 0) * 5} 
                  size={14} 
                  color="var(--torre-accent)" 
                  showRating={false} 
                />
                compatibility
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('add-more')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                style={{
                  color: '#000000',
                  backgroundColor: '#CDDC39',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#C0CA33';
                  e.target.style.color = '#000000';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#CDDC39';
                  e.target.style.color = '#000000';
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
                    backgroundColor: isActive ? 'var(--torre-bg-tertiary)' : 'transparent',
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
        </motion.div>

        {/* Tab Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="rounded-xl shadow-lg p-6" 
          style={{ backgroundColor: 'var(--torre-bg-secondary)' }}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <OverviewTab comparison={comparison} />
              </motion.div>
            )}
            {activeTab === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <SkillsTab comparison={comparison} />
              </motion.div>
            )}
            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <InsightsTab comparison={comparison} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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
          className="space-y-6"
        >
          <div className="max-w-2xl mx-auto">
            <SearchBar
              query={addMoreSearch.query}
              onQueryChange={addMoreSearch.handleSearchChange}
              loading={addMoreSearch.loading}
              onClear={addMoreSearch.clearSearch}
              placeholder="Search for more people to add..."
            />
          </div>
          
          <div className="min-h-screen pb-24">
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

  // Fallback - only show when truly no people are selected
  if (selectedPeople.length === 0) {
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
  }

  // If we have people selected but no step matches, default to initial step
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
        onClick={() => {
          console.log('Fallback Start Comparing button clicked, current step:', step);
          setStep('first-search');
        }}
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
};

// Tab Components with Horizontal Bar Graphs
const OverviewTab = ({ comparison }) => {
  const person1 = comparison.person1;
  const person2 = comparison.person2;
  
  return (
    <div className="space-y-6">
      {/* People Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PersonOverview person={person1} title="Person 1" comparison={comparison} isFirst={true} />
        <PersonOverview person={person2} title="Person 2" comparison={comparison} isFirst={false} />
      </div>

      {/* Overall Compatibility with Star Ratings */}
      <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--torre-bg-tertiary)', borderColor: 'var(--torre-border)' }}>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--torre-text-primary)' }}>
          <TrendingUp style={{ color: 'var(--torre-accent)' }} size={20} />
          Overall Compatibility
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium" style={{ color: 'var(--torre-text-primary)' }}>Overall Match</span>
            <StarRating rating={(comparison.similarity?.overallScore || 0) * 5} color="var(--torre-accent)" />
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium" style={{ color: 'var(--torre-text-primary)' }}>Skills Similarity</span>
            <StarRating rating={(comparison.similarity?.skillsScore || 0) * 5} color="var(--torre-accent)" />
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium" style={{ color: 'var(--torre-text-primary)' }}>Strengths Alignment</span>
            <StarRating rating={(comparison.similarity?.strengthsScore || 0) * 5} color="var(--torre-accent)" />
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium" style={{ color: 'var(--torre-text-primary)' }}>Experience Level</span>
            <StarRating rating={(comparison.similarity?.experienceScore || 0) * 5} color="var(--torre-accent)" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SkillsTab = ({ comparison }) => {
  const commonSkills = comparison.similarity?.details?.commonSkills || [];
  const uniqueSkills1 = comparison.similarity?.details?.uniqueSkills1 || [];
  const uniqueSkills2 = comparison.similarity?.details?.uniqueSkills2 || [];

  return (
    <div className="space-y-6">
      {/* Common Skills */}
      {commonSkills.length > 0 && (
        <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--torre-bg-tertiary)', borderColor: 'var(--torre-border)' }}>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--torre-text-primary)' }}>
            <CheckCircle style={{ color: 'var(--torre-green)' }} size={20} />
            Common Skills ({commonSkills.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {commonSkills.slice(0, 15).map((skill, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--torre-accent)' }}></div>
                <span className="text-sm" style={{ color: 'var(--torre-text-secondary)' }}>
                  {skill.name}
                </span>
              </div>
            ))}
            {commonSkills.length > 15 && (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--torre-text-muted)' }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--torre-text-muted)' }}></div>
                <span>+{commonSkills.length - 15} more skills</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unique Skills Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Person 1 Unique Skills */}
        <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--torre-bg-tertiary)', borderColor: 'var(--torre-border)' }}>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--torre-text-primary)' }}>
            <User style={{ color: 'var(--torre-blue)' }} size={20} />
            {comparison.person1?.name}'s Unique Skills
          </h3>
          
          <div className="space-y-2">
            {uniqueSkills1.slice(0, 10).map((skill, index) => (
              <div key={index} className="text-sm" style={{ color: 'var(--torre-text-secondary)' }}>
                • {skill.name}
              </div>
            ))}
            {uniqueSkills1.length === 0 && (
              <p className="text-sm italic" style={{ color: 'var(--torre-text-muted)' }}>
                No unique skills found
              </p>
            )}
          </div>
        </div>

        {/* Person 2 Unique Skills */}
        <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--torre-bg-tertiary)', borderColor: 'var(--torre-border)' }}>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--torre-text-primary)' }}>
            <User style={{ color: 'var(--torre-purple)' }} size={20} />
            {comparison.person2?.name}'s Unique Skills
          </h3>
          
          <div className="space-y-2">
            {uniqueSkills2.slice(0, 10).map((skill, index) => (
              <div key={index} className="text-sm" style={{ color: 'var(--torre-text-secondary)' }}>
                • {skill.name}
              </div>
            ))}
            {uniqueSkills2.length === 0 && (
              <p className="text-sm italic" style={{ color: 'var(--torre-text-muted)' }}>
                No unique skills found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InsightsTab = ({ comparison }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Collaboration Potential */}
        <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--torre-bg-tertiary)', borderColor: 'var(--torre-border)' }}>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--torre-text-primary)' }}>
            <Target style={{ color: 'var(--torre-accent)' }} size={20} />
            Collaboration Potential
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--torre-green)' }}></div>
              <span className="text-sm" style={{ color: 'var(--torre-text-secondary)' }}>
                Strong technical alignment
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--torre-blue)' }}></div>
              <span className="text-sm" style={{ color: 'var(--torre-text-secondary)' }}>
                Complementary skill sets
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--torre-accent)' }}></div>
              <span className="text-sm" style={{ color: 'var(--torre-text-secondary)' }}>
                Similar experience levels
              </span>
            </div>
          </div>
        </div>

        {/* Team Recommendations */}
        <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--torre-bg-tertiary)', borderColor: 'var(--torre-border)' }}>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--torre-text-primary)' }}>
            <Award style={{ color: 'var(--torre-accent)' }} size={20} />
            Recommendations
          </h3>
          <div className="space-y-3 text-sm" style={{ color: 'var(--torre-text-secondary)' }}>
            <p>These professionals would work well together on technical projects.</p>
            <p>Consider pairing them for mentorship opportunities.</p>
            <p>Strong potential for knowledge sharing and growth.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const PersonOverview = ({ person, title, comparison = null, isFirst = false }) => {
  // Calculate common skills for this person if comparison data is available
  const commonSkillsCount = comparison?.similarity?.details?.commonSkills?.length || 0;
  const totalSkills = person?.skills?.length || 0;
  
  return (
    <div className="rounded-lg border p-6 h-full flex flex-col" style={{ backgroundColor: 'var(--torre-bg-tertiary)', borderColor: 'var(--torre-border)' }}>
      <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--torre-text-primary)' }}>
        {title}
      </h3>
      
      <div className="flex items-center gap-4 mb-4">
        <Avatar person={person} size="lg" />
        <div className="flex-1">
          <h4 className="font-semibold" style={{ color: 'var(--torre-text-primary)' }}>
            {person?.name}
          </h4>
          <p className="text-sm" style={{ color: 'var(--torre-text-secondary)' }}>
            @{person?.username}
          </p>
          {person?.verified && (
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle className="text-green-500" size={12} />
              <span className="text-xs text-green-600 dark:text-green-400">Verified</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 mb-4">
        <p className="text-sm" style={{ color: 'var(--torre-text-secondary)' }}>
          {person?.professionalHeadline || 'Professional'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mt-auto">
        <div>
          <span style={{ color: 'var(--torre-text-muted)' }}>
            {comparison ? 'Common Skills' : 'Skills'}
          </span>
          <div className="font-semibold" style={{ color: 'var(--torre-text-primary)' }}>
            {comparison ? `${commonSkillsCount}/${totalSkills}` : (totalSkills || 0)}
          </div>
        </div>
        <div>
          <span style={{ color: 'var(--torre-text-muted)' }}>Strengths</span>
          <div className="font-semibold" style={{ color: 'var(--torre-text-primary)' }}>
            {person?.strengths?.length || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

const SkillBar = ({ label, value, color, showPercentage = false }) => {
  const percentage = Math.round(value * 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium text-sm" style={{ color: 'var(--torre-text-primary)' }}>
          {label}
        </span>
        {showPercentage && (
          <span className="text-xs" style={{ color: 'var(--torre-text-muted)' }}>
            {percentage}%
          </span>
        )}
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      
      <div className="text-right">
        <span className="text-xs font-medium" style={{ color }}>
          {percentage}%
        </span>
      </div>
    </div>
  );
};

const SkillComparisonBar = ({ skill1, skill2, person1Name, person2Name }) => {
  const max = Math.max(skill1, skill2);
  const percentage1 = (skill1 / max) * 100;
  const percentage2 = (skill2 / max) * 100;
  
  return (
    <div className="space-y-2">
      {/* Person 1 */}
      <div className="flex items-center gap-2">
        <span className="text-xs w-20 truncate" style={{ color: 'var(--torre-text-muted)' }}>
          {person1Name}
        </span>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage1}%` }}
            transition={{ duration: 0.6 }}
            className="h-1.5 rounded-full"
            style={{ backgroundColor: '#CDDC39' }}
          />
        </div>
        <span className="text-xs w-8" style={{ color: 'var(--torre-text-muted)' }}>
          {Math.round(skill1 * 100)}%
        </span>
      </div>
      
      {/* Person 2 */}
      <div className="flex items-center gap-2">
        <span className="text-xs w-20 truncate" style={{ color: 'var(--torre-text-muted)' }}>
          {person2Name}
        </span>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage2}%` }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--torre-purple)' }}
          />
        </div>
        <span className="text-xs w-8" style={{ color: 'var(--torre-text-muted)' }}>
          {Math.round(skill2 * 100)}%
        </span>
      </div>
    </div>
  );
};

export default ComparisonView;