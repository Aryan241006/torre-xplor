/**
 * Client for the Torre Xplor backend (server/ in this repo).
 *
 * The frontend never talks to Torre directly: every call goes to our own /api,
 * where the Express backend validates input, calls Torre and runs the
 * comparison and recommendation logic.
 */

const API_BASE = '/api';

const request = async (path, { method = 'GET', body, signal } = {}) => {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Network error: unable to reach the server. Please check your connection.');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }
  return data;
};

/**
 * Search for people.
 * @returns {Promise<{query, count, hasMore, results: Array}>}
 */
export const searchPeople = ({ query, limit = 15, offset = 0, signal }) => {
  const params = new URLSearchParams({ q: query, limit, offset });
  return request(`/search?${params}`, { signal });
};

/**
 * Get a person's full profile (genome).
 */
export const getProfile = (username) => request(`/genome/${encodeURIComponent(username)}`);

/**
 * Compare 2-4 people. Returns their profiles and a similarity analysis for each pair.
 * @returns {Promise<{people: Array, comparisons: Array}>}
 */
export const compareProfiles = (usernames) =>
  request('/compare', { method: 'POST', body: { usernames } });

/**
 * Find professionals similar to a person.
 * @returns {Promise<{target, recommendations: Array, searchQueries: Array, totalCandidates: number}>}
 */
export const getRecommendations = (username, { limit = 8, exclude = [] } = {}) => {
  const params = new URLSearchParams({ limit });
  if (exclude.length > 0) params.set('exclude', exclude.join(','));
  return request(`/recommendations/${encodeURIComponent(username)}?${params}`);
};
