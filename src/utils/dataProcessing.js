/**
 * Small frontend helpers. Turning Torre data into clean shapes happens on the
 * backend (server/services/profile.js); these only deal with display and input.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Torre sends month names ("April"); accept month numbers too.
const shortMonth = (month) => {
  if (!month) return null;
  if (typeof month === 'string' && Number.isNaN(Number(month))) {
    const match = MONTHS.find(m => month.toLowerCase().startsWith(m.toLowerCase()));
    return match || null;
  }
  const number = Number(month);
  return number >= 1 && number <= 12 ? MONTHS[number - 1] : null;
};

const formatDate = (month, year) => {
  if (!year || Number(year) <= 1900) return null;
  const monthLabel = shortMonth(month);
  return monthLabel ? `${monthLabel} ${year}` : String(year);
};

/**
 * Format date range for experiences/education, e.g. "Apr 2015 - Present"
 */
export const formatDateRange = (fromMonth, fromYear, toMonth, toYear) => {
  const startDate = formatDate(fromMonth, fromYear) || 'Unknown';
  const endDate = formatDate(toMonth, toYear) || 'Present';
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
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Validate search query before sending it (the backend validates again).
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
