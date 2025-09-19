import axios from 'axios';

// Torre API endpoints - using proxy paths for CORS handling
const BASE_URL = '/api';
const SEARCH_API_URL = '/search-api';

// Configure axios with timeout and headers
const api = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`Received response from:`, response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    console.error('Response interceptor error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

/**
 * Search for entities (people and organizations) using Torre's stream API
 * POST: "https://torre.ai/api/entities/_searchStream"
 */
export const searchEntities = async (searchParams) => {
  try {
    const { query, limit = 20, offset = 0, filters = [] } = searchParams;
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Search query is required');
    }

    // Use minimal request format that works with Torre API
    const requestBody = {
      query: query.trim(),
    };

    // Only add optional parameters if they have meaningful values
    if (limit && limit > 0) {
      requestBody.limit = Math.min(limit, 50);
    }
    if (offset && offset > 0) {
      requestBody.offset = Math.max(offset, 0);
    }

    console.log('Searching Torre API with:', requestBody);

    // Make the request to Torre's entities search endpoint
    const response = await api.post(`${BASE_URL}/entities/_searchStream`, requestBody);

    // Process the response data
    console.log('Raw Torre API response:', response.data);

    // Torre API returns a stream of JSON objects, one per line
    let results = [];
    if (typeof response.data === 'string') {
      // Parse line-delimited JSON
      const lines = response.data.trim().split('\n').filter(line => line.trim());
      results = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          console.warn('Failed to parse line:', line);
          return null;
        }
      }).filter(Boolean);
    } else if (Array.isArray(response.data)) {
      results = response.data;
    } else if (response.data && typeof response.data === 'object') {
      results = [response.data];
    }

    console.log('Parsed results:', results);

    // Filter results to only include people (not organizations)
    // Torre API returns people with username field and organizations without
    const peopleResults = results.filter(item =>
      item && item.username && item.username !== null && !item.organizationId
    ).map(person => ({
      person: {
        id: person.ardaId || person.ggId || person.id,
        publicId: person.username,
        name: person.name,
        username: person.username,
        picture: person.imageUrl,
        professionalHeadline: person.professionalHeadline,
        verified: person.verified || false,
        weight: person.weight,
        completion: person.completion,
        // Add location if available (Torre API might not always include this)
        location: person.location || null,
      },
      // Torre API doesn't include skills/strengths in search results
      // These would be available in the genome endpoint
      skills: [],
      strengths: [],
    }));

    console.log('Filtered people results:', peopleResults);

    return {
      success: true,
      data: peopleResults,
      total: peopleResults.length,
      query: query.trim(),
      limit,
      offset,
    };
  } catch (error) {
    console.error('Error searching entities:', error);
    
    if (error.response) {
      throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to reach Torre API. Please check your internet connection.');
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
};

/**
 * Get user genome/bio information
 * GET: "https://torre.ai/api/genome/bios/$username"
 */
export const getUserGenome = async (username) => {
  try {
    if (!username || typeof username !== 'string') {
      throw new Error('Username is required and must be a string');
    }

    console.log(`Fetching genome for user: ${username}`);

    const response = await api.get(`${BASE_URL}/genome/bios/${username}`);
    
    return {
      success: true,
      data: response.data,
      username,
    };
  } catch (error) {
    console.error(`Error fetching genome for ${username}:`, error);
    
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        throw new Error(`User "${username}" not found`);
      }
      const message = error.response.data?.message || error.response.statusText || 'Unknown error';
      throw new Error(`API Error ${status}: ${message}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to reach Torre API. Please check your internet connection.');
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
};

/**
 * Search for jobs using Torre's job search API
 * This would use the search.torre.co endpoint for job searches
 */
export const searchJobs = async (searchParams) => {
  try {
    const { query, limit = 20, offset = 0, filters = [] } = searchParams;
    
    const requestBody = {
      query,
      limit,
      offset,
      filters,
    };

    console.log('Searching jobs with:', requestBody);

    const response = await api.post(`${SEARCH_API_URL}/jobs/_searchStream`, requestBody);
    
    return {
      success: true,
      data: response.data || [],
      total: response.data?.length || 0,
      query,
      limit,
      offset,
    };
  } catch (error) {
    console.error('Error searching jobs:', error);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText || 'Unknown error';
      throw new Error(`Job API Error ${status}: ${message}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to reach Torre Job API. Please check your internet connection.');
    } else {
      throw new Error(`Job search error: ${error.message}`);
    }
  }
};

/**
 * Get trending skills or technologies
 * This is a utility function that processes search results to identify trends
 * @param {Array} searchResults - Array of search results
 * @returns {Object} Trending skills analysis
 */
export const analyzeTrendingSkills = (searchResults) => {
  try {
    const skillsMap = new Map();
    const strengthsMap = new Map();
    
    searchResults.forEach(person => {
      // Extract skills from person data
      if (person.skills) {
        person.skills.forEach(skill => {
          const skillName = skill.name || skill;
          skillsMap.set(skillName, (skillsMap.get(skillName) || 0) + 1);
        });
      }
      
      // Extract strengths
      if (person.strengths) {
        person.strengths.forEach(strength => {
          const strengthName = strength.name || strength;
          strengthsMap.set(strengthName, (strengthsMap.get(strengthName) || 0) + 1);
        });
      }
    });
    
    // Convert to sorted arrays
    const topSkills = Array.from(skillsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
      
    const topStrengths = Array.from(strengthsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
    
    return {
      topSkills,
      topStrengths,
      totalPeople: searchResults.length,
      analysis: {
        mostPopularSkill: topSkills[0]?.name || 'N/A',
        mostPopularStrength: topStrengths[0]?.name || 'N/A',
        skillDiversity: skillsMap.size,
        strengthDiversity: strengthsMap.size,
      }
    };
  } catch (error) {
    console.error('Error analyzing trending skills:', error);
    return {
      topSkills: [],
      topStrengths: [],
      totalPeople: 0,
      analysis: {},
      error: error.message,
    };
  }
};

export default {
  searchEntities,
  getUserGenome,
  searchJobs,
  analyzeTrendingSkills,
};
