/**
 * Utility functions for processing Torre API data
 */

/**
 * Capitalize the first letter of each sentence in a text
 * @param {string} text - Text to capitalize
 * @returns {string} Text with capitalized first letters
 */
export const capitalizeText = (text) => {
  if (!text || typeof text !== 'string') return text;

  return text
    .split('. ')
    .map(sentence => {
      const trimmed = sentence.trim();
      if (!trimmed) return trimmed;
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    })
    .join('. ');
};

/**
 * Format user data from Torre API response
 * @param {Object} userData - Raw user data from API
 * @returns {Object} Formatted user data
 */
export const formatUserData = (userData) => {
  if (!userData) return null;

  // Handle Torre genome API response structure
  const person = userData.person || userData;
  const stats = userData.stats || {};

  return {
    // Basic person info
    person: {
      id: person.id || person.publicId || person.ardaId,
      username: person.username || person.publicId,
      name: person.name || 'Unknown User',
      professionalHeadline: person.professionalHeadline || person.headline,
      picture: person.picture || person.imageUrl,
      summaryOfBio: person.summaryOfBio || person.bio,
      location: formatLocation(person.location),
      verified: person.verified || false,
      openToWork: person.openToWork || false,
      remote: person.remote || false,
      weight: person.weight,
      completion: person.completion,
    },

    // Skills and strengths from stats
    skills: formatSkills(stats.skills || userData.skills || []),
    strengths: formatStrengths(stats.strengths || userData.strengths || []),
    interests: formatInterests(stats.interests || userData.interests || []),

    // Experience and education
    experiences: formatExperiences(userData.experiences || []),
    education: formatEducation(userData.education || []),
    languages: formatLanguages(userData.languages || []),

    // Additional data
    awards: userData.awards || [],
    projects: userData.projects || [],
    publications: userData.publications || [],

    // Social links and contact info
    links: formatLinks(userData.links || []),

    // Stats
    stats: {
      connections: stats.connections || 0,
      views: stats.views || 0,
      recommendations: stats.recommendations || 0,
    },
  };
};

/**
 * Format links/social media data
 * @param {Array} links - Array of link objects
 * @returns {Array} Formatted links
 */
export const formatLinks = (links) => {
  if (!Array.isArray(links)) return [];

  return links.map(link => ({
    id: link.id,
    name: link.name,
    address: link.address,
    type: link.type || 'website',
    // Determine platform type for icons
    platform: detectPlatform(link.address || link.name),
  })).filter(link => link.address);
};

/**
 * Detect social media platform from URL
 * @param {string} url - URL or platform name
 * @returns {string} Platform identifier
 */
export const detectPlatform = (url) => {
  if (!url) return 'website';

  const urlLower = url.toLowerCase();

  if (urlLower.includes('linkedin')) return 'linkedin';
  if (urlLower.includes('github')) return 'github';
  if (urlLower.includes('twitter') || urlLower.includes('x.com')) return 'twitter';
  if (urlLower.includes('instagram')) return 'instagram';
  if (urlLower.includes('facebook')) return 'facebook';
  if (urlLower.includes('youtube')) return 'youtube';
  if (urlLower.includes('behance')) return 'behance';
  if (urlLower.includes('dribbble')) return 'dribbble';
  if (urlLower.includes('medium')) return 'medium';
  if (urlLower.includes('stackoverflow')) return 'stackoverflow';

  return 'website';
};

/**
 * Format location data
 * @param {Object} location - Location object
 * @returns {Object} Formatted location
 */
export const formatLocation = (location) => {
  if (!location) return null;

  return {
    name: location.name,
    shortName: location.shortName,
    country: location.country,
    timezone: location.timezone,
    timezoneOffSet: location.timezoneOffSet,
  };
};

/**
 * Format skills array
 * @param {Array} skills - Skills array
 * @returns {Array} Formatted skills
 */
export const formatSkills = (skills) => {
  if (!Array.isArray(skills)) return [];

  return skills.map(skill => ({
    id: skill.id,
    name: skill.name,
    weight: skill.weight || 0,
    recommendations: skill.recommendations || 0,
    category: skill.category || 'Other',
  })).sort((a, b) => (b.weight || 0) - (a.weight || 0));
};

/**
 * Format strengths array
 * @param {Array} strengths - Strengths array
 * @returns {Array} Formatted strengths
 */
export const formatStrengths = (strengths) => {
  if (!Array.isArray(strengths)) return [];

  return strengths.map(strength => ({
    id: strength.id,
    name: strength.name,
    weight: strength.weight || 0,
    recommendations: strength.recommendations || 0,
  })).sort((a, b) => (b.weight || 0) - (a.weight || 0));
};

/**
 * Format interests array
 * @param {Array} interests - Interests array
 * @returns {Array} Formatted interests
 */
export const formatInterests = (interests) => {
  if (!Array.isArray(interests)) return [];

  return interests.map(interest => ({
    id: interest.id,
    name: interest.name,
    weight: interest.weight || 0,
  })).sort((a, b) => (b.weight || 0) - (a.weight || 0));
};

/**
 * Format experiences array
 * @param {Array} experiences - Experiences array
 * @returns {Array} Formatted experiences
 */
export const formatExperiences = (experiences) => {
  if (!Array.isArray(experiences)) return [];

  return experiences.map(exp => ({
    id: exp.id,
    name: capitalizeText(exp.name || exp.role || exp.title),
    category: capitalizeText(exp.category),
    // Handle different date field names from Torre API
    fromMonth: exp.fromMonth || exp.startMonth,
    fromYear: exp.fromYear || exp.startYear,
    toMonth: exp.toMonth || exp.endMonth,
    toYear: exp.toYear || exp.endYear,
    // Additional fields for rich experience data with capitalization
    summary: capitalizeText(exp.summary || exp.description),
    organizations: exp.organizations || (exp.organization ? [exp.organization] : []),
    responsibilities: (exp.responsibilities || exp.duties || []).map(item => capitalizeText(item)),
    achievements: (exp.achievements || exp.accomplishments || []).map(item => capitalizeText(item)),
    remote: exp.remote || false,
    weight: exp.weight || 0,
    recommendations: exp.recommendations || 0,
    highlighted: exp.highlighted || false,
    verifications: exp.verifications || 0,
  })).sort((a, b) => {
    // Sort by most recent first
    const aYear = a.toYear || new Date().getFullYear();
    const bYear = b.toYear || new Date().getFullYear();
    return bYear - aYear;
  });
};

/**
 * Format education array
 * @param {Array} education - Education array
 * @returns {Array} Formatted education
 */
export const formatEducation = (education) => {
  if (!Array.isArray(education)) return [];

  return education.map(edu => ({
    id: edu.id,
    name: capitalizeText(edu.name || edu.degree || edu.title),
    category: capitalizeText(edu.category),
    // Handle different date field names from Torre API
    fromMonth: edu.fromMonth || edu.startMonth,
    fromYear: edu.fromYear || edu.startYear,
    toMonth: edu.toMonth || edu.endMonth,
    toYear: edu.toYear || edu.endYear,
    // Additional fields for rich education data with capitalization
    summary: capitalizeText(edu.summary || edu.description),
    organizations: edu.organizations || (edu.organization ? [edu.organization] : []) || (edu.institution ? [{ name: edu.institution }] : []),
    field: capitalizeText(edu.field || edu.fieldOfStudy || edu.major),
    grade: edu.grade || edu.gpa,
    activities: (edu.activities || []).map(item => capitalizeText(item)),
    weight: edu.weight || 0,
    recommendations: edu.recommendations || 0,
    highlighted: edu.highlighted || false,
    verifications: edu.verifications || 0,
  })).sort((a, b) => {
    const aYear = a.toYear || new Date().getFullYear();
    const bYear = b.toYear || new Date().getFullYear();
    return bYear - aYear;
  });
};

/**
 * Format languages array
 * @param {Array} languages - Languages array
 * @returns {Array} Formatted languages
 */
export const formatLanguages = (languages) => {
  if (!Array.isArray(languages)) return [];

  return languages.map(lang => ({
    language: capitalizeText(lang.language || lang.name),
    fluency: capitalizeText(lang.fluency || 'Unknown'),
    weight: lang.weight || 0,
  })).sort((a, b) => (b.weight || 0) - (a.weight || 0));
};

/**
 * Calculate skill match percentage between two users
 * @param {Array} skills1 - First user's skills
 * @param {Array} skills2 - Second user's skills
 * @returns {number} Match percentage (0-100)
 */
export const calculateSkillMatch = (skills1, skills2) => {
  if (!skills1?.length || !skills2?.length) return 0;

  const skillNames1 = new Set(skills1.map(s => s.name.toLowerCase()));
  const skillNames2 = new Set(skills2.map(s => s.name.toLowerCase()));
  
  const intersection = new Set([...skillNames1].filter(x => skillNames2.has(x)));
  const union = new Set([...skillNames1, ...skillNames2]);
  
  return Math.round((intersection.size / union.size) * 100);
};

/**
 * Get color for skill weight visualization
 * @param {number} weight - Skill weight
 * @param {number} maxWeight - Maximum weight in the dataset
 * @returns {string} CSS color class
 */
export const getSkillWeightColor = (weight, maxWeight) => {
  if (!weight || !maxWeight) return 'bg-gray-200';
  
  const percentage = (weight / maxWeight) * 100;
  
  if (percentage >= 80) return 'bg-blue-600';
  if (percentage >= 60) return 'bg-blue-500';
  if (percentage >= 40) return 'bg-blue-400';
  if (percentage >= 20) return 'bg-blue-300';
  return 'bg-blue-200';
};

/**
 * Format date range for experiences/education
 * @param {number} fromMonth - Start month
 * @param {number} fromYear - Start year
 * @param {number} toMonth - End month
 * @param {number} toYear - End year
 * @returns {string} Formatted date range
 */
export const formatDateRange = (fromMonth, fromYear, toMonth, toYear) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Handle undefined/null values more gracefully
  const validFromMonth = fromMonth && fromMonth >= 1 && fromMonth <= 12 ? fromMonth : null;
  const validFromYear = fromYear && fromYear > 1900 ? fromYear : null;
  const validToMonth = toMonth && toMonth >= 1 && toMonth <= 12 ? toMonth : null;
  const validToYear = toYear && toYear > 1900 ? toYear : null;

  const startDate = validFromYear ?
    `${validFromMonth ? months[validFromMonth - 1] + ' ' : ''}${validFromYear}` :
    'Unknown';

  const endDate = validToYear ?
    `${validToMonth ? months[validToMonth - 1] + ' ' : ''}${validToYear}` :
    'Present';

  return `${startDate} - ${endDate}`;
};

/**
 * Debounce function for search input
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Validate search query
 * @param {string} query - Search query
 * @returns {Object} Validation result
 */
export const validateSearchQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return { isValid: false, error: 'Search query is required' };
  }
  
  if (query.trim().length < 3) {
    return { isValid: false, error: 'Search query must be at least 3 characters long' };
  }
  
  if (query.length > 100) {
    return { isValid: false, error: 'Search query must be less than 100 characters' };
  }
  
  return { isValid: true, error: null };
};

export default {
  capitalizeText,
  formatUserData,
  formatLocation,
  formatSkills,
  formatStrengths,
  formatInterests,
  formatExperiences,
  formatEducation,
  formatLanguages,
  calculateSkillMatch,
  getSkillWeightColor,
  formatDateRange,
  debounce,
  validateSearchQuery,
};
