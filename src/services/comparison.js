/**
 * Professional Comparison and Recommendation Service
 * Handles comparison logic and recommendation algorithms for Torre professionals
 */

/**
 * Calculate similarity score between two professionals based on their genome data
 * @param {Object} person1 - First person's genome data
 * @param {Object} person2 - Second person's genome data
 * @returns {Object} Similarity analysis with scores and details
 */
export const calculateSimilarity = (person1, person2) => {
  try {
    const analysis = {
      overallScore: 0,
      skillsScore: 0,
      strengthsScore: 0,
      experienceScore: 0,
      educationScore: 0,
      details: {
        commonSkills: [],
        uniqueSkills1: [],
        uniqueSkills2: [],
        commonStrengths: [],
        skillGaps: [],
        recommendations: []
      }
    };

    // Extract skills from genome data
    const skills1 = extractSkills(person1);
    const skills2 = extractSkills(person2);
    
    // Extract strengths from genome data
    const strengths1 = extractStrengths(person1);
    const strengths2 = extractStrengths(person2);

    // Calculate skills similarity
    const skillsAnalysis = compareSkills(skills1, skills2);
    analysis.skillsScore = skillsAnalysis.score;
    analysis.details.commonSkills = skillsAnalysis.common;
    analysis.details.uniqueSkills1 = skillsAnalysis.unique1;
    analysis.details.uniqueSkills2 = skillsAnalysis.unique2;
    analysis.details.skillGaps = skillsAnalysis.gaps;

    // Calculate strengths similarity
    const strengthsAnalysis = compareStrengths(strengths1, strengths2);
    analysis.strengthsScore = strengthsAnalysis.score;
    analysis.details.commonStrengths = strengthsAnalysis.common;

    // Calculate experience similarity
    analysis.experienceScore = compareExperience(person1, person2);

    // Calculate education similarity
    analysis.educationScore = compareEducation(person1, person2);

    // Calculate overall similarity score (weighted average)
    analysis.overallScore = (
      analysis.skillsScore * 0.4 +
      analysis.strengthsScore * 0.3 +
      analysis.experienceScore * 0.2 +
      analysis.educationScore * 0.1
    );

    // Generate recommendations
    analysis.details.recommendations = generateComparisonRecommendations(analysis);

    return analysis;
  } catch (error) {
    console.error('Error calculating similarity:', error);
    return {
      overallScore: 0,
      skillsScore: 0,
      strengthsScore: 0,
      experienceScore: 0,
      educationScore: 0,
      details: {
        commonSkills: [],
        uniqueSkills1: [],
        uniqueSkills2: [],
        commonStrengths: [],
        skillGaps: [],
        recommendations: [],
        error: error.message
      }
    };
  }
};

/**
 * Extract skills from genome data
 * @param {Object} person - Person's genome data
 * @returns {Array} Array of skills with proficiency levels
 */
export const extractSkills = (person) => {
  const skills = [];

  // Helper function to safely get numeric proficiency - don't default to 0.5
  const getProficiency = (value) => {
    const num = parseFloat(value);
    // Only use default if the value is truly missing, and make it 0 instead of 0.5
    if (value === null || value === undefined || isNaN(num)) {
      return 0;
    }
    return Math.max(0, Math.min(1, num));
  };

  // Torre genome structure: skills are in the root level
  if (person?.skills) {
    person.skills.forEach(skill => {
      if (skill.name) {
        // Try different proficiency sources from Torre API
        let proficiency = 0;
        if (skill.weight !== undefined && skill.weight !== null) {
          proficiency = getProficiency(skill.weight);
        } else if (skill.proficiency !== undefined && skill.proficiency !== null) {
          proficiency = getProficiency(skill.proficiency);
        } else if (skill.media && skill.media.length > 0) {
          // If skill has media/evidence, give it a higher proficiency based on evidence count
          proficiency = Math.min(0.9, 0.5 + (skill.media.length * 0.1));
        } else {
          // For skills without specific values, use a more realistic range based on position in list
          // Skills listed earlier are likely more important
          const skillIndex = person.skills.indexOf(skill);
          const totalSkills = person.skills.length;
          proficiency = Math.max(0.3, 0.8 - (skillIndex / totalSkills) * 0.4);
        }
        
        skills.push({
          name: skill.name,
          code: skill.code || skill.name.toLowerCase().replace(/\s+/g, '-'),
          proficiency: proficiency,
          type: 'skill'
        });
      }
    });
  }

  // Also check interests as skills
  if (person?.interests) {
    person.interests.forEach(interest => {
      if (interest.name) {
        let proficiency = 0;
        if (interest.weight !== undefined && interest.weight !== null) {
          proficiency = getProficiency(interest.weight);
        } else if (interest.proficiency !== undefined && interest.proficiency !== null) {
          proficiency = getProficiency(interest.proficiency);
        } else {
          // For interests without specific values, use moderate proficiency
          const interestIndex = person.interests.indexOf(interest);
          const totalInterests = person.interests.length;
          proficiency = Math.max(0.4, 0.7 - (interestIndex / totalInterests) * 0.3);
        }
        
        skills.push({
          name: interest.name,
          code: interest.code || interest.name.toLowerCase().replace(/\s+/g, '-'),
          proficiency: proficiency,
          type: 'interest'
        });
      }
    });
  }

  // Also include strengths as skills for comparison
  if (person?.strengths) {
    person.strengths.forEach(strength => {
      if (strength.name) {
        skills.push({
          name: strength.name,
          code: strength.code || strength.name.toLowerCase().replace(/\s+/g, '-'),
          proficiency: getProficiency(strength.weight || strength.proficiency),
          type: 'strength'
        });
      }
    });
  }

  return skills;
};

/**
 * Extract strengths from genome data
 * @param {Object} person - Person's genome data
 * @returns {Array} Array of strengths
 */
export const extractStrengths = (person) => {
  if (!person?.strengths) return [];

  // Helper function to safely get numeric proficiency - don't default to 0.5
  const getProficiency = (value) => {
    const num = parseFloat(value);
    // Only use default if the value is truly missing, and make it 0 instead of 0.5
    if (value === null || value === undefined || isNaN(num)) {
      return 0;
    }
    return Math.max(0, Math.min(1, num));
  };

  return person.strengths.map(strength => ({
    name: strength.name,
    code: strength.code || strength.name.toLowerCase().replace(/\s+/g, '-'),
    proficiency: getProficiency(strength.weight || strength.proficiency)
  }));
};

/**
 * Compare skills between two professionals
 * @param {Array} skills1 - First person's skills
 * @param {Array} skills2 - Second person's skills
 * @returns {Object} Skills comparison analysis
 */
const compareSkills = (skills1, skills2) => {
  const common = [];
  const unique1 = [];
  const unique2 = [];
  const gaps = [];

  const skills1Map = new Map(skills1.map(s => [s.code, s]));
  const skills2Map = new Map(skills2.map(s => [s.code, s]));

  // Find common skills
  skills1.forEach(skill1 => {
    const skill2 = skills2Map.get(skill1.code);
    if (skill2) {
      const prof1 = isNaN(skill1.proficiency) ? 0 : skill1.proficiency;
      const prof2 = isNaN(skill2.proficiency) ? 0 : skill2.proficiency;
      common.push({
        name: skill1.name,
        proficiency1: prof1,
        proficiency2: prof2,
        difference: Math.abs(prof1 - prof2)
      });
    } else {
      unique1.push(skill1);
    }
  });

  // Find unique skills in person2
  skills2.forEach(skill2 => {
    if (!skills1Map.has(skill2.code)) {
      unique2.push(skill2);
    }
  });

  // Identify skill gaps (high proficiency in one, missing in other)
  unique1.forEach(skill => {
    if (skill.proficiency > 0.7) {
      gaps.push({
        skill: skill.name,
        missingIn: 'person2',
        proficiency: skill.proficiency
      });
    }
  });

  unique2.forEach(skill => {
    if (skill.proficiency > 0.7) {
      gaps.push({
        skill: skill.name,
        missingIn: 'person1',
        proficiency: skill.proficiency
      });
    }
  });

  // Calculate similarity score
  const totalSkills = skills1.length + skills2.length;
  const commonCount = common.length;
  const score = totalSkills > 0 ? (commonCount * 2) / totalSkills : 0;

  return {
    score: Math.min(score, 1),
    common,
    unique1,
    unique2,
    gaps
  };
};

/**
 * Compare strengths between two professionals
 * @param {Array} strengths1 - First person's strengths
 * @param {Array} strengths2 - Second person's strengths
 * @returns {Object} Strengths comparison analysis
 */
const compareStrengths = (strengths1, strengths2) => {
  const common = [];
  const strengths1Codes = new Set(strengths1.map(s => s.code));
  const strengths2Codes = new Set(strengths2.map(s => s.code));

  // Find common strengths
  strengths1.forEach(strength1 => {
    if (strengths2Codes.has(strength1.code)) {
      const strength2 = strengths2.find(s => s.code === strength1.code);
      common.push({
        name: strength1.name,
        proficiency1: strength1.proficiency,
        proficiency2: strength2.proficiency
      });
    }
  });

  // Calculate similarity score
  const totalStrengths = strengths1.length + strengths2.length;
  const commonCount = common.length;
  const score = totalStrengths > 0 ? (commonCount * 2) / totalStrengths : 0;

  return {
    score: Math.min(score, 1),
    common
  };
};

/**
 * Compare experience between two professionals
 * @param {Object} person1 - First person's data
 * @param {Object} person2 - Second person's data
 * @returns {number} Experience similarity score (0-1)
 */
const compareExperience = (person1, person2) => {
  // This would be enhanced with actual experience data from genome
  // For now, use completion and weight as proxies
  const completion1 = person1.completion || 0;
  const completion2 = person2.completion || 0;
  const weight1 = person1.weight || 0;
  const weight2 = person2.weight || 0;

  const completionSimilarity = 1 - Math.abs(completion1 - completion2);
  const weightSimilarity = weight1 > 0 && weight2 > 0 ? 
    Math.min(weight1, weight2) / Math.max(weight1, weight2) : 0;

  return (completionSimilarity + weightSimilarity) / 2;
};

/**
 * Compare education between two professionals
 * @param {Object} person1 - First person's data
 * @param {Object} person2 - Second person's data
 * @returns {number} Education similarity score (0-1)
 */
const compareEducation = (person1, person2) => {
  // This would be enhanced with actual education data from genome
  // For now, return a base score
  return 0.5;
};

/**
 * Generate recommendations based on comparison analysis
 * @param {Object} analysis - Comparison analysis results
 * @returns {Array} Array of recommendation objects
 */
const generateComparisonRecommendations = (analysis) => {
  const recommendations = [];

  // High similarity recommendations
  if (analysis.overallScore > 0.8) {
    recommendations.push({
      type: 'high_similarity',
      title: 'Highly Similar Professionals',
      description: 'These professionals have very similar profiles and could be ideal for similar roles or peer collaboration',
      priority: 'high'
    });
  }

  // Skill development recommendations
  if (analysis.details.skillGaps.length > 0) {
    const highPriorityGaps = analysis.details.skillGaps.filter(g => g.proficiency > 0.8);
    if (highPriorityGaps.length > 0) {
      recommendations.push({
        type: 'skill_development',
        title: 'High-Impact Skill Development',
        description: `Consider developing expertise in: ${highPriorityGaps.map(g => g.skill).join(', ')}`,
        priority: 'high'
      });
    } else if (analysis.details.skillGaps.length > 0) {
      recommendations.push({
        type: 'skill_development',
        title: 'Skill Development Opportunities',
        description: `Consider developing skills in: ${analysis.details.skillGaps.slice(0, 3).map(g => g.skill).join(', ')}`,
        priority: 'medium'
      });
    }
  }

  // Collaboration recommendations
  if (analysis.details.uniqueSkills1.length > 0 && analysis.details.uniqueSkills2.length > 0) {
    recommendations.push({
      type: 'collaboration',
      title: 'Complementary Skills Partnership',
      description: 'These professionals have complementary skills that could create a strong collaborative team',
      priority: 'medium'
    });
  }

  // Mentorship recommendations
  if (analysis.experienceScore < 0.4) {
    recommendations.push({
      type: 'mentorship',
      title: 'Mentorship Opportunity',
      description: 'Significant experience gap suggests potential for mentorship relationship',
      priority: 'medium'
    });
  }

  // Skills overlap recommendations
  if (analysis.skillsScore > 0.6 && analysis.details.commonSkills.length > 5) {
    recommendations.push({
      type: 'skills_overlap',
      title: 'Strong Skills Alignment',
      description: `${analysis.details.commonSkills.length} shared skills indicate strong professional alignment`,
      priority: 'medium'
    });
  }

  // Diversity recommendations
  if (analysis.skillsScore < 0.3 && analysis.details.uniqueSkills1.length > 3 && analysis.details.uniqueSkills2.length > 3) {
    recommendations.push({
      type: 'diversity',
      title: 'Diverse Skill Sets',
      description: 'Very different skill sets could bring valuable diversity to a team or project',
      priority: 'low'
    });
  }

  return recommendations;
};

/**
 * Calculate skill complementarity score between two professionals
 * @param {Object} person1 - First person's genome data
 * @param {Object} person2 - Second person's genome data
 * @returns {Object} Complementarity analysis
 */
export const calculateComplementarity = (person1, person2) => {
  try {
    const skills1 = extractSkills(person1);
    const skills2 = extractSkills(person2);

    const skills1Map = new Map(skills1.map(s => [s.code, s]));
    const skills2Map = new Map(skills2.map(s => [s.code, s]));

    let complementaryPairs = [];
    let totalComplementarity = 0;

    // Find skills where one person is strong and the other is weak/missing
    skills1.forEach(skill1 => {
      const skill2 = skills2Map.get(skill1.code);
      if (!skill2 && skill1.proficiency > 0.7) {
        // Person1 has skill, Person2 doesn't
        complementaryPairs.push({
          skill: skill1.name,
          person1Proficiency: skill1.proficiency,
          person2Proficiency: 0,
          complementarityScore: skill1.proficiency
        });
        totalComplementarity += skill1.proficiency;
      } else if (skill2 && Math.abs(skill1.proficiency - skill2.proficiency) > 0.4) {
        // Significant proficiency difference
        const stronger = skill1.proficiency > skill2.proficiency ? 'person1' : 'person2';
        complementaryPairs.push({
          skill: skill1.name,
          person1Proficiency: skill1.proficiency,
          person2Proficiency: skill2.proficiency,
          complementarityScore: Math.abs(skill1.proficiency - skill2.proficiency),
          stronger
        });
        totalComplementarity += Math.abs(skill1.proficiency - skill2.proficiency);
      }
    });

    // Check skills unique to person2
    skills2.forEach(skill2 => {
      if (!skills1Map.has(skill2.code) && skill2.proficiency > 0.7) {
        complementaryPairs.push({
          skill: skill2.name,
          person1Proficiency: 0,
          person2Proficiency: skill2.proficiency,
          complementarityScore: skill2.proficiency
        });
        totalComplementarity += skill2.proficiency;
      }
    });

    const averageComplementarity = complementaryPairs.length > 0 ?
      totalComplementarity / complementaryPairs.length : 0;

    return {
      complementarityScore: Math.min(averageComplementarity, 1),
      complementaryPairs: complementaryPairs.sort((a, b) => b.complementarityScore - a.complementarityScore),
      totalPairs: complementaryPairs.length
    };
  } catch (error) {
    console.error('Error calculating complementarity:', error);
    return {
      complementarityScore: 0,
      complementaryPairs: [],
      totalPairs: 0,
      error: error.message
    };
  }
};

/**
 * Generate team composition recommendations
 * @param {Array} people - Array of people to analyze for team composition
 * @returns {Object} Team composition analysis
 */
export const analyzeTeamComposition = (people) => {
  try {
    if (people.length < 2) {
      return {
        error: 'At least 2 people required for team analysis',
        recommendations: []
      };
    }

    const allSkills = new Map();
    const skillCoverage = new Map();
    const recommendations = [];

    // Collect all skills and their coverage
    people.forEach((person, index) => {
      const skills = extractSkills(person);
      skills.forEach(skill => {
        if (!allSkills.has(skill.code)) {
          allSkills.set(skill.code, {
            name: skill.name,
            maxProficiency: skill.proficiency,
            coverage: [{ personIndex: index, proficiency: skill.proficiency }]
          });
        } else {
          const existing = allSkills.get(skill.code);
          existing.coverage.push({ personIndex: index, proficiency: skill.proficiency });
          existing.maxProficiency = Math.max(existing.maxProficiency, skill.proficiency);
        }
      });
    });

    // Analyze skill coverage
    const wellCoveredSkills = [];
    const poorlyCoveredSkills = [];
    const uniqueSkills = [];

    allSkills.forEach((skillData, skillCode) => {
      if (skillData.coverage.length === 1) {
        uniqueSkills.push({
          skill: skillData.name,
          owner: people[skillData.coverage[0].personIndex].name,
          proficiency: skillData.coverage[0].proficiency
        });
      } else if (skillData.coverage.length >= people.length * 0.5) {
        wellCoveredSkills.push({
          skill: skillData.name,
          coverage: skillData.coverage.length,
          maxProficiency: skillData.maxProficiency
        });
      } else {
        poorlyCoveredSkills.push({
          skill: skillData.name,
          coverage: skillData.coverage.length,
          maxProficiency: skillData.maxProficiency
        });
      }
    });

    // Generate recommendations
    if (wellCoveredSkills.length > 0) {
      recommendations.push({
        type: 'strength',
        title: 'Team Strengths',
        description: `Strong coverage in: ${wellCoveredSkills.slice(0, 3).map(s => s.skill).join(', ')}`,
        priority: 'high'
      });
    }

    if (uniqueSkills.length > 0) {
      recommendations.push({
        type: 'unique_expertise',
        title: 'Unique Expertise',
        description: `Specialized skills: ${uniqueSkills.slice(0, 3).map(s => s.skill).join(', ')}`,
        priority: 'medium'
      });
    }

    if (poorlyCoveredSkills.length > 0) {
      recommendations.push({
        type: 'skill_gaps',
        title: 'Potential Skill Gaps',
        description: `Consider strengthening: ${poorlyCoveredSkills.slice(0, 3).map(s => s.skill).join(', ')}`,
        priority: 'medium'
      });
    }

    return {
      wellCoveredSkills,
      poorlyCoveredSkills,
      uniqueSkills,
      recommendations,
      totalSkills: allSkills.size,
      averageSkillsPerPerson: Array.from(allSkills.values()).reduce((sum, skill) => sum + skill.coverage.length, 0) / people.length
    };
  } catch (error) {
    console.error('Error analyzing team composition:', error);
    return {
      error: error.message,
      recommendations: []
    };
  }
};

export default {
  calculateSimilarity,
  extractSkills,
  extractStrengths,
  calculateComplementarity,
  analyzeTeamComposition
};
