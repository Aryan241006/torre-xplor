/**
 * Torre API client.
 *
 * The only module that talks to Torre. Everything else in the backend goes
 * through these functions, so timeouts, caching and error mapping live in one place.
 */

import { HttpError } from '../utils/httpError.js';
import { TtlCache } from '../utils/ttlCache.js';

const TORRE_BASE_URL = process.env.TORRE_BASE_URL || 'https://torre.ai/api';
const REQUEST_TIMEOUT_MS = 15_000;

// Profiles change rarely and recommendations fetch the same ones repeatedly,
// so a short in-memory cache saves a lot of calls to Torre.
const genomeCache = new TtlCache({ ttlMs: 5 * 60 * 1000, maxEntries: 500 });
const searchCache = new TtlCache({ ttlMs: 60 * 1000, maxEntries: 200 });

const torreFetch = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(`${TORRE_BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new HttpError(504, 'Torre API timed out');
    }
    throw new HttpError(502, 'Unable to reach Torre API');
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new HttpError(404, 'Not found on Torre');
    }
    throw new HttpError(502, `Torre API responded with ${response.status}`);
  }

  return response;
};

/**
 * Search Torre's entities (people and organizations).
 * Torre streams results as NDJSON: one JSON object per line.
 * @returns {Promise<Array>} Raw entity objects
 */
export const searchEntities = async ({ query, limit = 20, offset = 0 }) => {
  const cacheKey = `${query.toLowerCase()}|${limit}|${offset}`;
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  const body = { query, limit };
  if (offset > 0) body.offset = offset;

  const response = await torreFetch('/entities/_searchStream', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const text = await response.text();
  const entities = text
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  searchCache.set(cacheKey, entities);
  return entities;
};

/**
 * Fetch a person's full genome (profile).
 * @returns {Promise<Object>} Raw genome object
 */
export const getGenome = async (username) => {
  const cached = genomeCache.get(username);
  if (cached) return cached;

  const response = await torreFetch(`/genome/bios/${encodeURIComponent(username)}`);
  const genome = await response.json();

  genomeCache.set(username, genome);
  return genome;
};
