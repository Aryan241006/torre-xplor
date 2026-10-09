/**
 * Input validation. Bad input is rejected with a 400 before any call to Torre is made.
 */

import { HttpError } from '../utils/httpError.js';

// Torre usernames are letters, digits, dots, dashes and underscores (some are UUIDs).
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;

export const assertUsername = (value) => {
  if (typeof value !== 'string' || !USERNAME_PATTERN.test(value)) {
    throw new HttpError(400, 'Invalid username');
  }
  return value;
};

export const parseIntInRange = (value, { name, min, max, fallback }) => {
  if (value === undefined || value === '') return fallback;
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new HttpError(400, `${name} must be an integer between ${min} and ${max}`);
  }
  return number;
};

export const validateSearch = (req, res, next) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (query.length < 3 || query.length > 100) {
    return next(new HttpError(400, 'Search query must be between 3 and 100 characters'));
  }
  try {
    req.search = {
      query,
      limit: parseIntInRange(req.query.limit, { name: 'limit', min: 1, max: 50, fallback: 15 }),
      offset: parseIntInRange(req.query.offset, { name: 'offset', min: 0, max: 1000, fallback: 0 }),
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const validateUsernameParam = (req, res, next) => {
  try {
    assertUsername(req.params.username);
    next();
  } catch (error) {
    next(error);
  }
};

export const validateCompare = (req, res, next) => {
  const usernames = req.body?.usernames;
  if (!Array.isArray(usernames) || usernames.length < 2 || usernames.length > 4) {
    return next(new HttpError(400, 'Provide between 2 and 4 usernames to compare'));
  }
  try {
    usernames.forEach(assertUsername);
    if (new Set(usernames).size !== usernames.length) {
      throw new HttpError(400, 'Usernames must be unique');
    }
    next();
  } catch (error) {
    next(error);
  }
};
