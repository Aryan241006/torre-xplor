import { Router } from 'express';
import { searchEntities } from '../services/torreClient.js';
import { isPerson, toPersonSummary } from '../services/profile.js';
import { validateSearch } from '../middleware/validate.js';

const router = Router();

/**
 * GET /api/search?q=react&limit=15&offset=0
 * Searches Torre and returns only people, as clean summaries.
 */
router.get('/', validateSearch, async (req, res) => {
  const { query, limit, offset } = req.search;
  const entities = await searchEntities({ query, limit, offset });
  const results = entities.filter(isPerson).map(toPersonSummary);

  // Lets Vercel's CDN serve repeated searches without running the function again.
  res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.json({
    query,
    limit,
    offset,
    count: results.length,
    // Torre returns `limit` entities before we drop organizations, so a full page means there may be more.
    hasMore: entities.length >= limit,
    results,
  });
});

export default router;
