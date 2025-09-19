/**
 * Professional Recommendation Service
 * Generates recommendations for similar professionals based on genome analysis
 */

import { searchEntities, getUserGenome } from './api.js';
import { calculateSimilarity, extractSkills, extractStrengths } from './comparison.js';

// Simple in-memory cache for genome data
const genomeCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get genome data with caching
 */
const getCachedGenome = async (username) => {
  const cacheKey = username;
  const cached = genomeCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  try {
    const genomeResponse = await getUserGenome(username);
    const genomeData = genomeResponse.data;
    
    // Cache the result
    genomeCache.set(cacheKey, {
      data: genomeData,
      timestamp: Date.now()
    });
    
    return genomeData;
  } catch (error) {
    console.warn(`Could not fetch genome for ${username}`);
    return null;
  }
};

/**
 * Process candidates in parallel batches
 */
const processCandidatesInBatches = async (candidates, targetGenome, minSimilarityScore, batchSize = 5) => {
  const recommendations = [];
  const candidateArray = Array.from(candidates.values());
  
  for (let i = 0; i < candidateArray.length; i += batchSize) {
    const batch = candidateArray.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (candidate) => {
      try {
        const candidateGenome = await getCachedGenome(candidate.username);
        if (!candidateGenome) return null;

        // Quick similarity check - only calculate full similarity if basic score is promising
        const basicSimilarity = calculateBasicSimilarity(targetGenome, candidateGenome);
        if (basicSimilarity < minSimilarityScore - 0.1) return null;

        const similarity = calculateSimilarity(targetGenome, candidateGenome);
        
        if (similarity.overallScore >= minSimilarityScore) {
          return {
            person: candidate,
            genome: candidateGenome,
            similarity,
            reasons: generateRecommendationReasons(similarity, targetGenome, candidate)
          };
        }
        return null;
      } catch (error) {
        console.warn(`Error processing candidate ${candidate.username}:`, error);
        return null;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(result => {
      if (result) recommendations.push(result);
    });
    
    // If we have enough good recommendations, stop processing
    if (recommendations.length >= 30) break; // Increased from 15 to 30
  }
  
  return recommendations;
};

/**
 * Quick basic similarity calculation for initial filtering
 */
const calculateBasicSimilarity = (person1, person2) => {
  const skills1 = extractSkills(person1);
  const skills2 = extractSkills(person2);
  
  if (skills1.length === 0 || skills2.length === 0) return 0;
  
  const skillNames1 = new Set(skills1.map(s => s.name.toLowerCase()));
  const skillNames2 = new Set(skills2.map(s => s.name.toLowerCase()));
  
  const intersection = [...skillNames1].filter(skill => skillNames2.has(skill));
  const union = new Set([...skillNames1, ...skillNames2]);
  
  return intersection.length / union.size;
};

/**
 * Find similar professionals based on a target person's genome
 * @param {Object} targetPerson - The person to find recommendations for
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of recommended professionals with similarity scores
 */
export const findSimilarProfessionals = async (targetPerson, options = {}) => {
  try {
    const {
      limit = 10,
      minSimilarityScore = 0.3,
      searchQueries = [],
      excludeUsernames = []
    } = options;

    console.log('Finding similar professionals for:', targetPerson.username);

    // Get target person's full genome data
    let targetGenome;
    try {
      targetGenome = await getCachedGenome(targetPerson.username);
    } catch (error) {
      console.warn('Could not fetch target genome, using basic data:', error);
      targetGenome = targetPerson;
    }

    // Extract key skills and strengths for search queries
    const targetSkills = extractSkills(targetGenome);
    const targetStrengths = extractStrengths(targetGenome);
    
    // Generate search queries based on target person's profile (back to normal amount)
    const queries = generateSearchQueries(targetPerson, targetSkills, targetStrengths, searchQueries);
    
    console.log('Generated search queries:', queries);

    // Search for candidates using parallel queries
    const searchPromises = queries.map(query => 
      searchEntities({ query, limit: 25 }) // Increased from 15 to 25
        .then(response => response?.success ? response.data : [])
        .catch(error => {
          console.warn(`Search failed for query "${query}":`, error);
          return [];
        })
    );

    const searchResults = await Promise.all(searchPromises);
    
    // Combine and deduplicate candidates
    const candidates = new Map();
    searchResults.forEach(results => {
      results.forEach(result => {
        const person = result.person;
        if (person && person.username && 
            person.username !== targetPerson.username &&
            !excludeUsernames.includes(person.username)) {
          candidates.set(person.username, person);
        }
      });
    });

    console.log(`Found ${candidates.size} candidate professionals`);

    // Process candidates in parallel batches for better performance
    const recommendations = await processCandidatesInBatches(
      candidates, 
      targetGenome, 
      minSimilarityScore,
      8 // Increased batch size from 6 to 8 for better throughput
    );

    // Sort by similarity score and return top results
    const sortedRecommendations = recommendations
      .sort((a, b) => b.similarity.overallScore - a.similarity.overallScore)
      .slice(0, limit);

    console.log(`Generated ${sortedRecommendations.length} recommendations`);

    return {
      success: true,
      data: sortedRecommendations,
      targetPerson: targetPerson.username,
      totalCandidates: candidates.size,
      searchQueries: queries
    };

  } catch (error) {
    console.error('Error finding similar professionals:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

/**
 * Generate search queries based on target person's profile
 * @param {Object} targetPerson - Target person's basic data
 * @param {Array} skills - Target person's skills
 * @param {Array} strengths - Target person's strengths
 * @param {Array} additionalQueries - Additional custom queries
 * @returns {Array} Array of search query strings
 */
const generateSearchQueries = (targetPerson, skills, strengths, additionalQueries = []) => {
  const queries = new Set();

  // Add custom queries first
  additionalQueries.forEach(query => queries.add(query));

  // Extract keywords from professional headline
  if (targetPerson.professionalHeadline) {
    const headline = targetPerson.professionalHeadline.toLowerCase();
    const keywords = extractKeywords(headline);
    keywords.forEach(keyword => queries.add(keyword));
  }

  // Add top skills as search queries
  const topSkills = skills
    .sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0))
    .slice(0, 5);
  
  topSkills.forEach(skill => {
    queries.add(skill.name);
  });

  // Add top strengths as search queries
  const topStrengths = strengths
    .sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0))
    .slice(0, 3);
  
  topStrengths.forEach(strength => {
    queries.add(strength.name);
  });

  // Add role-based queries
  const roleQueries = generateRoleQueries(targetPerson.professionalHeadline);
  roleQueries.forEach(query => queries.add(query));

  // Convert to array and limit
  return Array.from(queries).slice(0, 8);
};

/**
 * Extract keywords from professional headline
 * @param {string} headline - Professional headline
 * @returns {Array} Array of keywords
 */
const extractKeywords = (headline) => {
  if (!headline) return [];

  // Common stop words to exclude
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'
  ]);

  // Extract meaningful words
  const words = headline
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .filter(word => /^[a-zA-Z]+$/.test(word)); // Only alphabetic words

  // Return unique words
  return [...new Set(words)];
};

/**
 * Generate role-based search queries
 * @param {string} headline - Professional headline
 * @returns {Array} Array of role-based queries
 */
const generateRoleQueries = (headline) => {
  if (!headline) return [];

  const queries = [];
  const headline_lower = headline.toLowerCase();

  // Common role patterns
  const rolePatterns = [
    { pattern: 'developer', queries: ['developer', 'programming', 'software'] },
    { pattern: 'engineer', queries: ['engineer', 'engineering', 'technical'] },
    { pattern: 'designer', queries: ['designer', 'design', 'creative'] },
    { pattern: 'manager', queries: ['manager', 'management', 'leadership'] },
    { pattern: 'analyst', queries: ['analyst', 'analysis', 'data'] },
    { pattern: 'consultant', queries: ['consultant', 'consulting', 'advisory'] }
  ];

  rolePatterns.forEach(({ pattern, queries: roleQueries }) => {
    if (headline_lower.includes(pattern)) {
      queries.push(...roleQueries);
    }
  });

  return [...new Set(queries)]; // Remove duplicates
};

/**
 * Generate reasons for recommendation
 * @param {Object} similarity - Similarity analysis
 * @param {Object} targetPerson - Target person
 * @param {Object} candidate - Recommended candidate
 * @returns {Array} Array of reason strings
 */
const generateRecommendationReasons = (similarity, targetPerson, candidate) => {
  const reasons = [];

  // Skills-based reasons
  if (similarity.details.commonSkills.length > 0) {
    const topCommonSkills = similarity.details.commonSkills
      .slice(0, 3)
      .map(skill => skill.name);
    reasons.push(`Shares ${similarity.details.commonSkills.length} common skills including ${topCommonSkills.join(', ')}`);
  }

  // Strengths-based reasons
  if (similarity.details.commonStrengths.length > 0) {
    const strengthNames = similarity.details.commonStrengths
      .slice(0, 2)
      .map(strength => strength.name);
    reasons.push(`Similar strengths in ${strengthNames.join(' and ')}`);
  }

  // Experience-based reasons
  if (similarity.experienceScore > 0.7) {
    reasons.push('Similar experience level and professional maturity');
  }

  // Complementary skills
  if (similarity.details.uniqueSkills2.length > 0) {
    const complementarySkills = similarity.details.uniqueSkills2
      .slice(0, 2)
      .map(skill => skill.name);
    reasons.push(`Brings complementary skills in ${complementarySkills.join(' and ')}`);
  }

  // Overall similarity
  if (similarity.overallScore > 0.8) {
    reasons.push('High overall profile similarity');
  } else if (similarity.overallScore > 0.6) {
    reasons.push('Good profile compatibility');
  }

  return reasons.length > 0 ? reasons : ['Professional profile match'];
};

/**
 * Get recommendations for team building
 * @param {Array} teamMembers - Current team members
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Recommended professionals for the team
 */
export const getTeamRecommendations = async (teamMembers, options = {}) => {
  try {
    // Analyze team skills and find gaps
    const teamSkills = new Map();
    const teamStrengths = new Map();

    for (const member of teamMembers) {
      const skills = extractSkills(member);
      const strengths = extractStrengths(member);

      skills.forEach(skill => {
        teamSkills.set(skill.code, (teamSkills.get(skill.code) || 0) + skill.proficiency);
      });

      strengths.forEach(strength => {
        teamStrengths.set(strength.code, (teamStrengths.get(strength.code) || 0) + strength.proficiency);
      });
    }

    // Find skill gaps and generate search queries
    const gapQueries = ['full stack', 'backend', 'frontend', 'devops', 'data science', 'design'];
    
    // Search for candidates that fill team gaps
    const recommendations = await findSimilarProfessionals(
      teamMembers[0], // Use first team member as base
      {
        ...options,
        searchQueries: gapQueries,
        excludeUsernames: teamMembers.map(m => m.username)
      }
    );

    return recommendations;

  } catch (error) {
    console.error('Error getting team recommendations:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

export default {
  findSimilarProfessionals,
  getTeamRecommendations
};
