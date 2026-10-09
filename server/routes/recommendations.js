import { Router } from 'express';
import { findSimilarProfessionals } from '../services/recommendations.js';
import { validateUsernameParam, assertUsername, parseIntInRange } from '../middleware/validate.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();

/**
 * GET /api/recommendations/:username?limit=8&exclude=alice,bob
 * Finds professionals similar to :username. One request from the browser;
 * the server does the dozens of Torre calls behind it.
 */
router.get('/:username', validateUsernameParam, async (req, res) => {
  const { username } = req.params;
  const limit = parseIntInRange(req.query.limit, { name: 'limit', min: 1, max: 20, fallback: 8 });
  const exclude = typeof req.query.exclude === 'string' && req.query.exclude
    ? req.query.exclude.split(',').slice(0, 10).map(assertUsername)
    : [];

  try {
    const result = await findSimilarProfessionals(username, { limit, exclude });
    res.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800');
    res.json(result);
  } catch (error) {
    if (error.status === 404) throw new HttpError(404, `User "${username}" not found`);
    throw error;
  }
});

export default router;
