import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { calculateSimilarity } from '../services/comparison.js';
import { findSimilarProfessionals } from '../services/recommendations.js';
import { getUserGenome } from '../services/api.js';

// Helper functions to extract data from genome
const extractSkillsFromGenome = (genomeData) => {
  const skills = [];
  
  // Torre genome structure: skills are in the root level
  if (genomeData?.skills) {
    genomeData.skills.forEach(skill => {
      if (skill.name) {
        skills.push({
          name: skill.name,
          proficiency: skill.weight || skill.proficiency || 1
        });
      }
    });
  }
  
  // Also check interests
  if (genomeData?.interests) {
    genomeData.interests.forEach(interest => {
      if (interest.name) {
        skills.push({
          name: interest.name,
          proficiency: interest.weight || interest.proficiency || 1
        });
      }
    });
  }
  
  return skills;
};

const extractStrengthsFromGenome = (genomeData) => {
  const strengths = [];
  
  // Torre genome structure: strengths are in the root level
  if (genomeData?.strengths) {
    genomeData.strengths.forEach(strength => {
      if (strength.name) {
        strengths.push({
          name: strength.name,
          proficiency: strength.weight || strength.proficiency || 1
        });
      }
    });
  }
  
  return strengths;
};

// Initial state
const initialState = {
  selectedPeople: [],
  comparisons: [],
  recommendations: [],
  isLoading: false,
  error: null,
  activeComparison: null
};

// Action types
const ACTIONS = {
  ADD_PERSON: 'ADD_PERSON',
  REMOVE_PERSON: 'REMOVE_PERSON',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  SET_COMPARISONS: 'SET_COMPARISONS',
  SET_RECOMMENDATIONS: 'SET_RECOMMENDATIONS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_ACTIVE_COMPARISON: 'SET_ACTIVE_COMPARISON'
};

// Reducer function
const comparisonReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_PERSON:
      // Prevent duplicates and limit to 4 people for comparison
      if (state.selectedPeople.length >= 4) {
        return {
          ...state,
          error: 'Maximum 4 people can be compared at once'
        };
      }
      
      const exists = state.selectedPeople.some(p => p.username === action.payload.username);
      if (exists) {
        return {
          ...state,
          error: 'Person already selected for comparison'
        };
      }

      return {
        ...state,
        selectedPeople: [...state.selectedPeople, action.payload],
        error: null
      };

    case ACTIONS.REMOVE_PERSON:
      return {
        ...state,
        selectedPeople: state.selectedPeople.filter(p => p.username !== action.payload),
        error: null
      };

    case ACTIONS.CLEAR_SELECTION:
      return {
        ...state,
        selectedPeople: [],
        comparisons: [],
        recommendations: [],
        activeComparison: null,
        error: null
      };

    case ACTIONS.SET_COMPARISONS:
      return {
        ...state,
        comparisons: action.payload,
        error: null
      };

    case ACTIONS.SET_RECOMMENDATIONS:
      return {
        ...state,
        recommendations: action.payload,
        error: null
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case ACTIONS.SET_ACTIVE_COMPARISON:
      return {
        ...state,
        activeComparison: action.payload
      };

    default:
      return state;
  }
};

// Create context
const ComparisonContext = createContext();

// Provider component
export const ComparisonProvider = ({ children }) => {
  const [state, dispatch] = useReducer(comparisonReducer, initialState);

  // Add person to comparison
  const addPersonToComparison = useCallback((person) => {
    dispatch({ type: ACTIONS.ADD_PERSON, payload: person });
  }, []);

  // Remove person from comparison
  const removePersonFromComparison = useCallback((username) => {
    dispatch({ type: ACTIONS.REMOVE_PERSON, payload: username });
  }, []);

  // Clear all selected people
  const clearComparison = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_SELECTION });
  }, []);

  // Compare selected people
  const compareSelectedPeople = useCallback(async () => {
    if (state.selectedPeople.length < 2) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'At least 2 people are required for comparison' });
      return;
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ACTIONS.SET_ERROR, payload: null }); // Clear any previous errors

    try {
      const comparisons = [];
      const peopleWithGenome = [];

      // Get genome data for all selected people
      for (const person of state.selectedPeople) {
        try {
          const genomeResponse = await getUserGenome(person.username);
          const genomeData = genomeResponse.data;
          
          // Extract skills and strengths from genome data
          const skills = extractSkillsFromGenome(genomeData);
          const strengths = extractStrengthsFromGenome(genomeData);
          
          console.log(`Extracted data for ${person.username}:`, {
            skills: skills.length,
            strengths: strengths.length,
            genomeKeys: Object.keys(genomeData || {}),
            picture: genomeData.picture,
            originalPicture: person.picture,
            finalPicture: genomeData.picture || person.picture
          });
          
          peopleWithGenome.push({
            ...person,
            genome: genomeData,
            skills: skills,
            strengths: strengths,
            professionalHeadline: genomeData.professionalHeadline || genomeData.headline || person.professionalHeadline || person.headline,
            picture: genomeData.picture || person.picture,
            name: genomeData.name || person.name,
            verified: genomeData.verified || person.verified
          });
        } catch (error) {
          console.warn(`Could not fetch genome for ${person.username}:`, error);
          peopleWithGenome.push({
            ...person,
            genome: person,
            skills: [],
            strengths: []
          });
        }
      }

      // Generate all pairwise comparisons
      for (let i = 0; i < peopleWithGenome.length; i++) {
        for (let j = i + 1; j < peopleWithGenome.length; j++) {
          const person1 = peopleWithGenome[i];
          const person2 = peopleWithGenome[j];
          
          const similarity = calculateSimilarity(person1.genome, person2.genome);
          
          console.log(`Similarity between ${person1.username} and ${person2.username}:`, {
            overallScore: similarity.overallScore,
            skillsScore: similarity.skillsScore,
            strengthsScore: similarity.strengthsScore
          });
          
          comparisons.push({
            id: `${person1.username}-${person2.username}`,
            person1,
            person2,
            similarity,
            timestamp: new Date().toISOString()
          });
          
          console.log(`Created comparison between ${person1.username} and ${person2.username}:`, {
            person1: { name: person1.name, picture: person1.picture },
            person2: { name: person2.name, picture: person2.picture },
            hasDetails: !!similarity.details,
            commonSkills: similarity.details?.commonSkills?.length || 0,
            uniqueSkills1: similarity.details?.uniqueSkills1?.length || 0,
            uniqueSkills2: similarity.details?.uniqueSkills2?.length || 0
          });
        }
      }

      dispatch({ type: ACTIONS.SET_COMPARISONS, payload: comparisons });
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });

    } catch (error) {
      console.error('Error comparing people:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  }, [state.selectedPeople]);

  // Get recommendations for a specific person
  const getRecommendationsForPerson = useCallback(async (person, options = {}) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const recommendationsResponse = await findSimilarProfessionals(person, {
        limit: 8,
        minSimilarityScore: 0.3,
        excludeUsernames: state.selectedPeople.map(p => p.username),
        ...options
      });

      if (recommendationsResponse.success) {
        dispatch({ 
          type: ACTIONS.SET_RECOMMENDATIONS, 
          payload: {
            targetPerson: person,
            recommendations: recommendationsResponse.data,
            searchQueries: recommendationsResponse.searchQueries,
            totalCandidates: recommendationsResponse.totalCandidates
          }
        });
      } else {
        throw new Error(recommendationsResponse.error || 'Failed to get recommendations');
      }

      dispatch({ type: ACTIONS.SET_LOADING, payload: false });

    } catch (error) {
      console.error('Error getting recommendations:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  }, [state.selectedPeople]);

  // Set active comparison
  const setActiveComparison = useCallback((comparisonId) => {
    const comparison = state.comparisons.find(c => c.id === comparisonId);
    dispatch({ type: ACTIONS.SET_ACTIVE_COMPARISON, payload: comparison });
  }, [state.comparisons]);

  // Check if person is selected
  const isPersonSelected = useCallback((username) => {
    return state.selectedPeople.some(p => p.username === username);
  }, [state.selectedPeople]);

  // Get comparison between two specific people
  const getComparisonBetween = useCallback((username1, username2) => {
    return state.comparisons.find(c => 
      (c.person1.username === username1 && c.person2.username === username2) ||
      (c.person1.username === username2 && c.person2.username === username1)
    );
  }, [state.comparisons]);

  const value = {
    // State
    selectedPeople: state.selectedPeople,
    comparisons: state.comparisons,
    recommendations: state.recommendations,
    isLoading: state.isLoading,
    error: state.error,
    activeComparison: state.activeComparison,

    // Actions
    addPersonToComparison,
    removePersonFromComparison,
    clearComparison,
    compareSelectedPeople,
    getRecommendationsForPerson,
    setActiveComparison,
    isPersonSelected,
    getComparisonBetween,

    // Computed values
    canCompare: state.selectedPeople.length >= 2,
    maxSelectionReached: state.selectedPeople.length >= 4
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};

// Hook to use comparison context
export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};

export default ComparisonContext;
