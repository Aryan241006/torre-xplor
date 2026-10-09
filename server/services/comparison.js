/**
 * Comparison engine: scores how similar two professionals are.
 *
 * Four signals, each scored 0-1:
 *  - skills:     overlap of all skills (Dice coefficient)
 *  - strengths:  overlap of core skills, rated "proficient" or above
 *  - experience: how close their years of work experience are
 *  - education:  shared institutions or degrees
 *
 * The overall score is a weighted average. A signal is skipped (null) when
 * either person has no data for it, and the remaining weights are rescaled,
 * so missing profile data doesn't count as "not similar".
 */

import { extractSkills } from './profile.js';

const WEIGHTS = { skills: 0.4, strengths: 0.3, experience: 0.2, education: 0.1 };
const CORE_SKILL_LEVEL = 0.6; // "proficient" or above
const SKILL_GAP_LEVEL = 0.8; // "expert" or above

// Dice coefficient: 2 * |A ∩ B| / (|A| + |B|). 1 means identical sets, 0 means nothing shared.
const dice = (setA, setB) => {
  if (setA.size === 0 || setB.size === 0) return null;
  let shared = 0;
  setA.forEach((item) => { if (setB.has(item)) shared += 1; });
  return (2 * shared) / (setA.size + setB.size);
};

const realSkills = (genome) =>
  extractSkills(genome).filter((skill) => skill.proficiency !== 'no-experience-interested');

const compareSkills = (skills1, skills2) => {
  const byCode2 = new Map(skills2.map((skill) => [skill.code, skill]));
  const codes1 = new Set(skills1.map((skill) => skill.code));

  const common = skills1
    .filter((skill) => byCode2.has(skill.code))
    .map((skill) => {
      const other = byCode2.get(skill.code);
      return {
        name: skill.name,
        proficiency1: skill.level,
        proficiency2: other.level,
        difference: Math.abs(skill.level - other.level),
      };
    })
    .sort((a, b) => (b.proficiency1 + b.proficiency2) - (a.proficiency1 + a.proficiency2));

  const toUnique = (skill) => ({
    name: skill.name,
    code: skill.code,
    proficiency: skill.level,
    proficiencyLabel: skill.proficiency,
  });
  const unique1 = skills1.filter((skill) => !byCode2.has(skill.code)).map(toUnique);
  const unique2 = skills2.filter((skill) => !codes1.has(skill.code)).map(toUnique);

  // A gap is an expert-level skill that the other person doesn't have at all.
  const gaps = [
    ...unique1.filter((s) => s.proficiency >= SKILL_GAP_LEVEL)
      .map((s) => ({ skill: s.name, missingIn: 'person2', proficiency: s.proficiency })),
    ...unique2.filter((s) => s.proficiency >= SKILL_GAP_LEVEL)
      .map((s) => ({ skill: s.name, missingIn: 'person1', proficiency: s.proficiency })),
  ];

  return {
    score: dice(codes1, new Set(byCode2.keys())) ?? 0,
    common,
    unique1,
    unique2,
    gaps,
  };
};

const compareStrengths = (skills1, skills2) => {
  const core1 = skills1.filter((skill) => skill.level >= CORE_SKILL_LEVEL);
  const core2 = skills2.filter((skill) => skill.level >= CORE_SKILL_LEVEL);
  const byCode2 = new Map(core2.map((skill) => [skill.code, skill]));

  return {
    score: dice(new Set(core1.map((s) => s.code)), new Set(byCode2.keys())),
    common: core1
      .filter((skill) => byCode2.has(skill.code))
      .map((skill) => ({
        name: skill.name,
        proficiency1: skill.level,
        proficiency2: byCode2.get(skill.code).level,
      })),
  };
};

/**
 * Years between a person's earliest job start and their latest job end (or today).
 */
export const yearsOfExperience = (genome) => {
  const currentYear = new Date().getFullYear();
  const jobs = (genome?.jobs || []).filter((job) => Number(job.fromYear));
  if (jobs.length === 0) return 0;

  const start = Math.min(...jobs.map((job) => Number(job.fromYear)));
  const end = Math.max(...jobs.map((job) => Number(job.toYear) || currentYear));
  return Math.max(0, end - start);
};

const compareExperience = (genome1, genome2) => {
  const years1 = yearsOfExperience(genome1);
  const years2 = yearsOfExperience(genome2);
  if (years1 === 0 || years2 === 0) return null;
  return Math.min(years1, years2) / Math.max(years1, years2);
};

const educationKeys = (genome) => {
  const keys = new Set();
  (genome?.education || []).forEach((entry) => {
    if (entry.name) keys.add(`degree:${entry.name.toLowerCase().trim()}`);
    (entry.organizations || []).forEach((org) => {
      if (org.name) keys.add(`school:${org.name.toLowerCase().trim()}`);
    });
  });
  return keys;
};

const compareEducation = (genome1, genome2) => dice(educationKeys(genome1), educationKeys(genome2));

const weightedOverall = (scores) => {
  let total = 0;
  let weightUsed = 0;
  Object.entries(WEIGHTS).forEach(([key, weight]) => {
    if (scores[key] !== null) {
      total += scores[key] * weight;
      weightUsed += weight;
    }
  });
  return weightUsed > 0 ? total / weightUsed : 0;
};

const generateInsights = (analysis) => {
  const insights = [];
  const { details } = analysis;

  if (analysis.overallScore > 0.7) {
    insights.push({
      type: 'high_similarity',
      title: 'Highly Similar Professionals',
      description: 'Very similar profiles; a good fit for similar roles or peer collaboration.',
      priority: 'high',
    });
  }

  if (details.skillGaps.length > 0) {
    insights.push({
      type: 'skill_development',
      title: 'Skill Development Opportunities',
      description: `Expert-level skills only one of them has: ${details.skillGaps.slice(0, 3).map((g) => g.skill).join(', ')}`,
      priority: 'high',
    });
  }

  if (details.uniqueSkills1.length > 0 && details.uniqueSkills2.length > 0) {
    insights.push({
      type: 'collaboration',
      title: 'Complementary Skills Partnership',
      description: 'Each brings skills the other lacks, which could make a strong team.',
      priority: 'medium',
    });
  }

  if (analysis.experienceScore !== null && analysis.experienceScore < 0.4) {
    insights.push({
      type: 'mentorship',
      title: 'Mentorship Opportunity',
      description: 'A large gap in years of experience suggests a possible mentoring relationship.',
      priority: 'medium',
    });
  }

  if (details.commonSkills.length >= 5 && analysis.skillsScore >= 0.3) {
    insights.push({
      type: 'skills_overlap',
      title: 'Strong Skills Alignment',
      description: `${details.commonSkills.length} shared skills indicate strong professional alignment.`,
      priority: 'medium',
    });
  }

  if (analysis.skillsScore < 0.2 && details.uniqueSkills1.length > 3 && details.uniqueSkills2.length > 3) {
    insights.push({
      type: 'diversity',
      title: 'Diverse Skill Sets',
      description: 'Very different skill sets could bring valuable diversity to a team or project.',
      priority: 'low',
    });
  }

  return insights;
};

/**
 * Compare two professionals using their raw Torre genomes.
 * @returns {Object} Scores (0-1, or null when there's no data) and the details behind them
 */
export const calculateSimilarity = (genome1, genome2) => {
  const skills1 = realSkills(genome1);
  const skills2 = realSkills(genome2);

  const skillsAnalysis = compareSkills(skills1, skills2);
  const strengthsAnalysis = compareStrengths(skills1, skills2);

  const scores = {
    skills: skills1.length && skills2.length ? skillsAnalysis.score : null,
    strengths: strengthsAnalysis.score,
    experience: compareExperience(genome1, genome2),
    education: compareEducation(genome1, genome2),
  };

  const analysis = {
    overallScore: weightedOverall(scores),
    skillsScore: scores.skills ?? 0,
    strengthsScore: scores.strengths ?? 0,
    experienceScore: scores.experience,
    educationScore: scores.education,
    details: {
      commonSkills: skillsAnalysis.common,
      uniqueSkills1: skillsAnalysis.unique1,
      uniqueSkills2: skillsAnalysis.unique2,
      commonStrengths: strengthsAnalysis.common,
      skillGaps: skillsAnalysis.gaps,
    },
  };

  analysis.details.recommendations = generateInsights(analysis);
  return analysis;
};
