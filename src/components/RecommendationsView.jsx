import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Target,
  CheckCircle,
  Star,
  ArrowRight,
  RefreshCw,
  Filter,
  Search,
  GitCompare
} from 'lucide-react';
import { useComparison } from '../contexts/ComparisonContext.jsx';
import ComparisonButton from './ComparisonButton.jsx';
import Avatar from './Avatar.jsx';

const RecommendationsView = ({ onViewGenome, onSwitchToCompare }) => {
  const { 
    recommendations, 
    getRecommendationsForPerson, 
    selectedPeople,
    isLoading,
    error,
    compareSelectedPeople,
    canCompare
  } = useComparison();

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isComparing, setIsComparing] = useState(false);

  const handleGetRecommendations = async (person) => {
    setSelectedPerson(person);
    await getRecommendationsForPerson(person, {
      limit: 20, // Increased from 12 to 20
      minSimilarityScore: 0.1 // Lowered from 0.2 to 0.1 for more results
    });
  };

  const displayedRecommendations = recommendations.recommendations || [];

  if (selectedPeople.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <Sparkles className="mx-auto mb-3 sm:mb-4" style={{color: 'var(--torre-accent)'}} size={40} />
        <h3 className="text-base sm:text-lg font-semibold mb-2" style={{color: 'var(--torre-text-primary)'}}>No People Selected</h3>
        <p className="text-sm sm:text-base" style={{color: 'var(--torre-text-secondary)'}}>Select people from search results to get recommendations</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-lg border mx-4 sm:mx-0" style={{
      backgroundColor: 'var(--torre-bg-secondary)',
      borderColor: 'var(--torre-border)'
    }}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b" style={{borderColor: 'var(--torre-border)'}}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2" style={{color: 'var(--torre-text-primary)'}}>
              <Sparkles style={{color: 'var(--torre-accent)'}} size={24} className="sm:w-7 sm:h-7" />
              Professional Recommendations
            </h2>
            <p className="mt-1 text-sm sm:text-base" style={{color: 'var(--torre-text-secondary)'}}>
              Discover similar professionals based on skills and experience
            </p>
          </div>
        </div>

        {/* Person Selection */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <h3 className="font-semibold text-sm sm:text-base" style={{color: 'var(--torre-text-primary)'}}>Get recommendations for:</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              {selectedPeople.length >= 2 ? (
                <motion.button
                  onClick={async () => {
                    setIsComparing(true);
                    await compareSelectedPeople();
                    if (onSwitchToCompare) {
                      onSwitchToCompare();
                    }
                    setIsComparing(false);
                  }}
                  disabled={!canCompare || isLoading || isComparing}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    !canCompare || isLoading || isComparing ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: 'var(--torre-accent)',
                    color: 'white'
                  }}
                  whileHover={canCompare && !isLoading && !isComparing ? { scale: 1.02 } : {}}
                  whileTap={canCompare && !isLoading && !isComparing ? { scale: 0.98 } : {}}
                >
                  {isComparing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <GitCompare size={16} />
                      Compare Profiles ({selectedPeople.length})
                    </>
                  )}
                </motion.button>
              ) : selectedPeople.length === 1 ? (
                <span className="text-sm px-3 py-1 rounded-lg" style={{color: 'var(--torre-text-muted)', backgroundColor: 'var(--torre-bg-tertiary)'}}>
                  Add more people to compare (1/4)
                </span>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {selectedPeople.map((person) => (
              <motion.button
                key={person.username}
                onClick={() => handleGetRecommendations(person)}
                disabled={isLoading}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{
                  backgroundColor: selectedPerson?.username === person.username 
                    ? 'var(--torre-accent-light)' 
                    : 'var(--torre-bg-secondary)',
                  borderColor: selectedPerson?.username === person.username
                    ? 'var(--torre-accent)'
                    : 'var(--torre-border)'
                }}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                <Avatar
                  src={person.picture}
                  name={person.name}
                  size="w-10 h-10"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate" style={{color: 'var(--torre-text-primary)'}}>{person.name}</h4>
                  <p className="text-sm truncate" style={{color: 'var(--torre-text-secondary)'}}>@{person.username}</p>
                </div>
                {isLoading && selectedPerson?.username === person.username && (
                  <RefreshCw style={{color: 'var(--torre-accent)'}} className="animate-spin" size={16} />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{borderColor: 'var(--torre-accent)', borderTopColor: 'transparent'}} />
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--torre-text-primary)'}}>Finding Recommendations</h3>
            <p style={{color: 'var(--torre-text-secondary)'}}>Analyzing professional networks and skills...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--torre-text-primary)'}}>Error</h3>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {!isLoading && !error && recommendations.recommendations && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Summary */}
              <div className="rounded-lg p-4 border" style={{
                backgroundColor: 'var(--torre-bg-secondary)',
                borderColor: 'var(--torre-border)'
              }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2" style={{color: 'var(--torre-text-primary)'}}>
                    <Target style={{color: 'var(--torre-accent)'}} size={20} />
                    Recommendations for {recommendations.targetPerson?.name || selectedPerson?.name}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users style={{color: 'var(--torre-accent)'}} size={16} />
                    <span style={{color: 'var(--torre-text-secondary)'}}>{recommendations.recommendations.length} professionals found</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search style={{color: 'var(--torre-accent)'}} size={16} />
                    <span style={{color: 'var(--torre-text-secondary)'}}>{recommendations.totalCandidates} candidates analyzed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp style={{color: 'var(--torre-accent)'}} size={16} />
                    <span style={{color: 'var(--torre-text-secondary)'}}>
                      Avg similarity: {Math.round(
                        recommendations.recommendations.reduce((sum, rec) => sum + rec.similarity.overallScore, 0) / 
                        recommendations.recommendations.length * 100
                      )}%
                    </span>
                  </div>
                </div>

                {recommendations.searchQueries && (
                  <div className="mt-3 pt-3 border-t" style={{borderColor: 'var(--torre-border)'}}>
                    <p className="text-xs" style={{color: 'var(--torre-text-muted)'}}>
                      <strong>Search queries used:</strong> {recommendations.searchQueries.join(', ')}
                    </p>
                  </div>
                )}
              </div>

              {/* Recommendations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {displayedRecommendations.map((recommendation, index) => (
                  <RecommendationCard
                    key={recommendation.person.username}
                    recommendation={recommendation}
                    index={index}
                    onViewGenome={onViewGenome}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {!isLoading && !error && !recommendations.recommendations && selectedPeople.length > 0 && (
          <div className="text-center py-12">
            <Sparkles className="mx-auto mb-4" style={{color: 'var(--torre-accent)'}} size={48} />
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--torre-text-primary)'}}>Ready for Recommendations</h3>
            <p style={{color: 'var(--torre-text-secondary)'}}>Select a person above to get personalized recommendations</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual Recommendation Card
const RecommendationCard = ({ recommendation, index, onViewGenome }) => {
  const { person, similarity, reasons } = recommendation;
  const scoreColor = similarity.overallScore > 0.7 ? 'var(--torre-green)' :
                    similarity.overallScore > 0.5 ? 'var(--torre-accent)' : 'var(--torre-blue)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-lg p-4 hover:shadow-md transition-shadow border h-full flex flex-col"
      style={{
        backgroundColor: 'var(--torre-bg-secondary)',
        borderColor: 'var(--torre-border)',
        minHeight: '320px'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar
            src={person.picture}
            name={person.name}
            size="w-10 h-10"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate text-sm" style={{color: 'var(--torre-text-primary)'}}>{person.name}</h4>
            <p className="text-xs truncate" style={{color: 'var(--torre-text-secondary)'}}>@{person.username}</p>
            {person.verified && (
              <div className="flex items-center gap-1 mt-0.5">
                <CheckCircle className="text-green-500" size={10} />
                <span className="text-xs text-green-600 dark:text-green-400">Verified</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold" style={{color: scoreColor}}>
            {Math.round(similarity.overallScore * 100)}%
          </div>
          <div className="flex items-center gap-1">
            <Star style={{ color: 'var(--torre-accent)' }} size={10} />
            <span className="text-xs" style={{color: 'var(--torre-text-muted)'}}>match</span>
          </div>
        </div>
      </div>

      {/* Professional Headline */}
      <p className="text-xs mb-3 line-clamp-2 flex-shrink-0" style={{color: 'var(--torre-text-secondary)'}}>
        {person.professionalHeadline || 'Professional'}
      </p>

      {/* Similarity Breakdown */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs flex-shrink-0">
        <div className="rounded p-2 text-center" style={{backgroundColor: 'var(--torre-bg-tertiary)'}}>
          <div className="font-semibold text-sm" style={{color: 'var(--torre-text-primary)'}}>
            {Math.round(similarity.skillsScore * 100)}%
          </div>
          <div className="text-xs" style={{color: 'var(--torre-text-muted)'}}>Skills</div>
        </div>
        <div className="rounded p-2 text-center" style={{backgroundColor: 'var(--torre-bg-tertiary)'}}>
          <div className="font-semibold text-sm" style={{color: 'var(--torre-text-primary)'}}>
            {Math.round(similarity.strengthsScore * 100)}%
          </div>
          <div className="text-xs" style={{color: 'var(--torre-text-muted)'}}>Strengths</div>
        </div>
      </div>

      {/* Reasons */}
      <div className="space-y-1 mb-4 flex-1">
        {reasons.slice(0, 2).map((reason, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs" style={{color: 'var(--torre-text-secondary)'}}>
            <ArrowRight style={{color: 'var(--torre-accent)'}} className="mt-0.5 flex-shrink-0" size={8} />
            <span className="line-clamp-2">{reason}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-auto">
        <ComparisonButton person={person} size="xs" />
        <button 
          className="text-xs font-medium hover:opacity-80" 
          style={{color: 'var(--torre-accent)'}}
          onClick={(e) => {
            e.stopPropagation();
            if (onViewGenome) {
              onViewGenome(person);
            }
          }}
        >
          View Genome
        </button>
      </div>
    </motion.div>
  );
};

export default RecommendationsView;