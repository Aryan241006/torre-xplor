import { Router } from 'express';
import { getGenome } from '../services/torreClient.js';
import { toProfile } from '../services/profile.js';
import { calculateSimilarity } from '../services/comparison.js';
import { validateCompare } from '../middleware/validate.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();

/**
 * POST /api/compare   body: { "usernames": ["alice", "bob", ...] }  (2 to 4 people)
 * Fetches every profile, then scores each pair.
 */
router.post('/', validateCompare, async (req, res) => {
  const { usernames } = req.body;

  const genomes = await Promise.all(
    usernames.map((username) =>
      getGenome(username).catch((error) => {
        if (error.status === 404) throw new HttpError(404, `User "${username}" not found`);
        throw error;
      }),
    ),
  );

  const people = genomes.map((genome) => {
    const profile = toProfile(genome);
    return {
      ...profile.person,
      skills: profile.strengths,
      // Core strengths: skills rated "proficient" or above.
      strengths: profile.strengths.filter((skill) => skill.level >= 0.6),
    };
  });

  const comparisons = [];
  for (let i = 0; i < people.length; i += 1) {
    for (let j = i + 1; j < people.length; j += 1) {
      comparisons.push({
        id: `${people[i].username}-${people[j].username}`,
        person1: people[i],
        person2: people[j],
        similarity: calculateSimilarity(genomes[i], genomes[j]),
      });
    }
  }

  res.json({ people, comparisons });
});

export default router;
