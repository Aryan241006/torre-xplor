/**
 * Recommendation engine: finds professionals similar to a given person.
 *
 * 1. Fetch the target's genome.
 * 2. Build search queries from their top skills and headline.
 * 3. Run the searches, merge and de-duplicate the people found.
 * 4. Fetch each candidate's genome (a few at a time) and score it against the target.
 * 5. Return the best matches with human-readable reasons.
 */

import { searchEntities, getGenome } from './torreClient.js';
import { isPerson, toPersonSummary, toProfile, extractSkills } from './profile.js';
import { calculateSimilarity } from './comparison.js';
import { mapWithConcurrency } from '../utils/concurrency.js';

const MAX_QUERIES = 6;
const RESULTS_PER_QUERY = 20;
const MAX_CANDIDATES = 40;
const CONCURRENT_GENOME_FETCHES = 8;
// A match must share at least this many skills. Without it, a high score can come
// from similar years of experience alone, which isn't a useful recommendation.
const MIN_SHARED_SKILLS = 2;

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'into', 'about', 'are', 'was', 'were', 'been',
  'have', 'has', 'had', 'will', 'would', 'could', 'should', 'can', 'at', 'in', 'on', 'of',
]);

const headlineKeywords = (headline) => {
  if (!headline) return [];
  const words = headline
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
  return [...new Set(words)];
};

/**
 * Top skills first (they're the strongest signal), then headline keywords.
 */
export const buildSearchQueries = (genome) => {
  const queries = new Set();
  extractSkills(genome)
    .filter((skill) => skill.proficiency !== 'no-experience-interested')
    .slice(0, 4)
    .forEach((skill) => queries.add(skill.name));
  headlineKeywords(genome?.person?.professionalHeadline).forEach((word) => queries.add(word));
  return [...queries].slice(0, MAX_QUERIES);
};

const buildReasons = (similarity) => {
  const reasons = [];
  const { details } = similarity;

  if (details.commonSkills.length > 0) {
    const top = details.commonSkills.slice(0, 3).map((skill) => skill.name).join(', ');
    reasons.push(`Shares ${details.commonSkills.length} skills including ${top}`);
  }
  if (details.commonStrengths.length > 0) {
    reasons.push(`Similar core strengths in ${details.commonStrengths.slice(0, 2).map((s) => s.name).join(' and ')}`);
  }
  if (similarity.experienceScore !== null && similarity.experienceScore > 0.7) {
    reasons.push('Similar years of experience');
  }
  if (similarity.educationScore) {
    reasons.push('Shared educational background');
  }
  if (details.uniqueSkills2.length > 0) {
    reasons.push(`Brings complementary skills in ${details.uniqueSkills2.slice(0, 2).map((s) => s.name).join(' and ')}`);
  }

  return reasons.length > 0 ? reasons : ['Professional profile match'];
};

/**
 * @param {string} username - The person to find matches for
 * @param {Object} options
 * @param {number} options.limit - Maximum recommendations to return
 * @param {string[]} options.exclude - Usernames to leave out
 */
export const findSimilarProfessionals = async (username, { limit = 8, exclude = [] } = {}) => {
  const targetGenome = await getGenome(username);
  const queries = buildSearchQueries(targetGenome);

  // A failed query shouldn't fail the whole request; it just contributes no candidates.
  const searchResults = await Promise.all(
    queries.map((query) => searchEntities({ query, limit: RESULTS_PER_QUERY }).catch(() => [])),
  );

  const excluded = new Set([username, ...exclude]);
  const candidates = new Map();
  searchResults.flat().filter(isPerson).forEach((entity) => {
    if (!excluded.has(entity.username) && !candidates.has(entity.username)) {
      candidates.set(entity.username, toPersonSummary(entity));
    }
  });

  const candidateList = [...candidates.values()].slice(0, MAX_CANDIDATES);

  const scored = await mapWithConcurrency(candidateList, CONCURRENT_GENOME_FETCHES, async (person) => {
    try {
      const genome = await getGenome(person.username);
      const similarity = calculateSimilarity(targetGenome, genome);
      return { person, similarity, reasons: buildReasons(similarity) };
    } catch {
      return null; // Skip candidates whose profile can't be fetched.
    }
  });

  const recommendations = scored
    .filter((match) => match && match.similarity.details.commonSkills.length >= MIN_SHARED_SKILLS)
    .sort((a, b) => b.similarity.overallScore - a.similarity.overallScore)
    .slice(0, limit);

  return {
    target: toProfile(targetGenome).person,
    recommendations,
    searchQueries: queries,
    totalCandidates: candidates.size,
  };
};
