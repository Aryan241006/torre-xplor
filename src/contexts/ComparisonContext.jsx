import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { compareProfiles, getRecommendations } from '../services/api.js';

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
    case ACTIONS.ADD_PERSON: {
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
    }

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

  /**
   * Compare people on the backend, which fetches their profiles and scores every pair.
   * Pass `people` explicitly when calling right after adding someone: the state
   * update hasn't been applied yet, so selectedPeople would still be the old list.
   */
  const compareSelectedPeople = useCallback(async (people = state.selectedPeople) => {
    if (people.length < 2) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'At least 2 people are required for comparison' });
      return;
    }

    dispatch({ type: ACTIONS.SET_ERROR, payload: null });
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const { comparisons } = await compareProfiles(people.map(p => p.username));
      dispatch({ type: ACTIONS.SET_COMPARISONS, payload: comparisons });
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  }, [state.selectedPeople]);

  // Get recommendations for a specific person (one request; the backend does the searching and scoring)
  const getRecommendationsForPerson = useCallback(async (person, { limit = 8 } = {}) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: null });
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const result = await getRecommendations(person.username, {
        limit,
        exclude: state.selectedPeople.map(p => p.username).filter(u => u !== person.username),
      });

      dispatch({
        type: ACTIONS.SET_RECOMMENDATIONS,
        payload: {
          targetPerson: result.target,
          recommendations: result.recommendations,
          searchQueries: result.searchQueries,
          totalCandidates: result.totalCandidates
        }
      });
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    } catch (error) {
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
