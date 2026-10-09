import { Router } from 'express';
import { getGenome } from '../services/torreClient.js';
import { toProfile } from '../services/profile.js';
import { validateUsernameParam } from '../middleware/validate.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();

/**
 * GET /api/genome/:username
 * Returns a person's full profile, normalized.
 */
router.get('/:username', validateUsernameParam, async (req, res) => {
  const { username } = req.params;
  let genome;
  try {
    genome = await getGenome(username);
  } catch (error) {
    if (error.status === 404) throw new HttpError(404, `User "${username}" not found`);
    throw error;
  }

  res.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  res.json(toProfile(genome));
});

export default router;
