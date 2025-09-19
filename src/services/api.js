import axios from 'axios';

// Torre API Configuration - Use environment variables for security
const BASE_URL = import.meta.env.DEV 
  ? import.meta.env.VITE_DEV_API_PROXY || '/api'
  : import.meta.env.VITE_TORRE_API_BASE_URL || 'https://torre.ai';

const SEARCH_API_URL = import.meta.env.DEV 
  ? import.meta.env.VITE_DEV_SEARCH_PROXY || '/search-api'
  : import.meta.env.VITE_TORRE_SEARCH_API_URL || 'https://search.torre.co/people/_search/?';

/**
 * Search for people and organizations using Torre's search API
 * @param {Object} searchParams - Search parameters
 * @returns {Promise<Object>} Search results
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
    const response = await axios.post(`${BASE_URL}/entities/_searchStream`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 15000,
    });

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
 * Get detailed genome information for a specific user
 * @param {string} username - Torre username
 * @returns {Promise<Object>} User genome data
 */
export const getUserGenome = async (username) => {
  try {
    if (!username || typeof username !== 'string') {
      throw new Error('Username is required and must be a string');
    }

    console.log(`Fetching genome for user: ${username}`);
    console.log(`Using BASE_URL: ${BASE_URL}`);
    console.log(`Environment: ${import.meta.env.DEV ? 'Development' : 'Production'}`);
    console.log(`Full URL: ${BASE_URL}/genome/bios/${username}`);

    const response = await axios.get(`${BASE_URL}/genome/bios/${username}`, {
      headers: {
        'Accept': 'application/json',
      },
      timeout: 15000,
    });
    
    return {
      success: true,
      data: response.data,
      username,
    };
  } catch (error) {
    console.error(`Error fetching genome for ${username}:`, error);
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: `${BASE_URL}/genome/bios/${username}`
    });
    
    if (error.response) {
      throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || 'User not found'}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to reach Torre API. Please check your internet connection.');
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
};

/**
 * Search for jobs using Torre's job search API
 * @param {Object} searchParams - Job search parameters
 * @returns {Promise<Object>} Job search results
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

    const response = await axios.post(`${SEARCH_API_URL}/jobs/_searchStream`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 15000,
    });
    
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
      throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to reach Torre job search API.');
    } else {
      throw new Error(`Request error: ${error.message}`);
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
