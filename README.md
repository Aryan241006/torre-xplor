# torre xplor

A full-stack app for exploring [Torre](https://torre.ai)'s professional network. Search for people, view their full profiles ("genomes"), compare up to four professionals side by side, and get recommendations for similar professionals.

The React frontend talks only to the project's own Express backend. The backend calls Torre's public APIs, cleans up the data, and runs the comparison and recommendation logic on the server.

## Features

- **Search**: find people on Torre by name or keyword, with debounced input and "load more" pagination.
- **Profiles**: skills with proficiency levels, work experience, education, languages and links.
- **Compare**: pick 2 to 4 people and see an overall match score, shared and unique skills, and insights generated for each pair.
- **Recommendations**: find professionals similar to someone, ranked by similarity, with the reasons for each match.
- **Themes**: light, dark, or follow the system setting.
- **Export and share**: download search results as JSON, or share a link.

## Architecture

```
Browser (React)
   │  fetch('/api/...')
   ▼
Vercel ── vercel.json rewrites /api/* ──► api/index.js  (serverless function)
                                             │
                                             ▼
                                       server/app.js  (Express)
                                         ├─ rate limiting
                                         ├─ input validation
                                         ├─ routes ──► services (scoring, recommendations)
                                         └─ error handler
                                             │
                                             ▼
                                      Torre public API
                                      (torre.ai/api)
```

The same Express app runs in two places with no code changes:

- **Locally**: `server/dev.js` starts it on port 3001, and Vite's dev server forwards `/api` requests to it.
- **On Vercel**: `api/index.js` exports the app as a serverless function, and `vercel.json` sends every `/api/*` request to it.

### Why a backend?

- **One request instead of dozens.** A recommendation needs about 6 Torre searches plus up to 40 profile fetches. The browser makes one request; the server does the fan-out, fetching 8 profiles at a time.
- **Business logic stays on the server.** Scoring, ranking and data normalization live in one place, and the frontend only displays results.
- **Protection.** Input is validated and requests are rate-limited before anything reaches Torre.
- **Caching.** Repeated searches and profiles are served from cache instead of calling Torre again.

Torre's endpoints are public, so there is no API key to manage. If a key were ever needed, it would go in a Vercel environment variable and be read only by the server. `TORRE_BASE_URL` is already configurable this way.

## Project structure

```
api/
  index.js                 Vercel entry point; exports the Express app
server/
  app.js                   Express setup: middleware and routes
  dev.js                   Starts the API locally (port 3001)
  routes/                  search, genome, compare, recommendations
  services/
    torreClient.js         The only module that calls Torre (timeouts, caching, errors)
    profile.js             Turns raw Torre data into clean shapes
    comparison.js          Similarity scoring between two people
    recommendations.js     Finds and ranks similar professionals
  middleware/              validation, rate limiting, error handling
  utils/                   TTL cache, concurrency limiter, helpers
src/
  services/api.js          Frontend client for the backend
  contexts/                Comparison selection state, theme
  hooks/useSearch.js       Search state, pagination, request cancelling
  pages/, components/      UI
```

## API reference

All endpoints return JSON. Errors look like `{ "error": "message" }`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/search?q=&limit=&offset=` | Search people. `q` is 3 to 100 characters, `limit` 1 to 50 (default 15). |
| GET | `/api/genome/:username` | A person's full profile |
| POST | `/api/compare` | Body: `{ "usernames": ["a", "b"] }` (2 to 4, unique). Returns each person plus a similarity analysis for every pair. |
| GET | `/api/recommendations/:username?limit=&exclude=` | Similar professionals. `limit` 1 to 20 (default 8); `exclude` is a comma-separated list of usernames. |

**Status codes**

- `400`: invalid input.
- `404`: the user doesn't exist on Torre.
- `429`: rate limit reached. Every client gets 60 requests per minute; recommendations are limited to 10 per minute.
- `502` or `504`: Torre is failing or timed out.

## How similarity is scored

Torre calls a person's skills "strengths" and rates each one with a word. The backend maps those words to numbers: master 1.0, expert 0.8, proficient 0.6, novice 0.4.

Two people are compared on four signals, each scored from 0 to 1:

| Signal | Weight | How it's measured |
|---|---|---|
| Skills | 40% | Overlap of all their skills (Dice coefficient: 2 × shared ÷ total) |
| Core strengths | 30% | Overlap of skills rated "proficient" or above |
| Experience | 20% | Ratio of their years of work experience (shorter ÷ longer) |
| Education | 10% | Overlap of schools and degrees |

The overall score is the weighted average. If either person has no data for a signal (for example, no education listed), that signal is skipped and the remaining weights are rescaled, so missing data doesn't count as a mismatch.

The backend also generates **insights** for each pair. Examples: skill gaps (expert-level skills only one of them has), complementary skills, or a possible mentoring match when their years of experience differ a lot.

## How recommendations work

1. Fetch the person's profile.
2. Build up to 6 search queries from their top skills and headline keywords.
3. Run the searches in parallel, then merge and de-duplicate the people found (up to 40 candidates).
4. Fetch each candidate's profile, 8 at a time, and score it against the person.
5. Keep candidates who share at least 2 skills, and rank them by score.

## Caching

- **In memory**: profiles are cached for 5 minutes and searches for 1 minute, inside each serverless instance.
- **CDN**: GET responses send `Cache-Control: s-maxage=...`, so Vercel's servers can answer repeated requests without running the function.

## Known limitations

- **Per-instance cache and rate limits.** Both are kept in each serverless instance's memory. They reduce load and stop abuse, but they aren't shared between instances or kept across cold starts. A shared store such as Redis would be needed for exact, global limits.
- **Results depend on Torre's data.** Many search results are organizations or near-empty profiles, so some people get only a few recommendations.
- **Search has no total count.** Torre's search stream doesn't report how many results exist in total, so pagination uses "load more".

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # starts the API (port 3001) and Vite together
```

Other scripts:

| Script | What it does |
|---|---|
| `npm run dev:api` | Start only the API (restarts when files change) |
| `npm run dev:web` | Start only the Vite frontend |
| `npm run build` | Production build of the frontend |
| `npm run lint` | Run ESLint |

## Deployment

The project is deployed on Vercel with zero extra configuration. Vercel builds the Vite frontend and turns `api/index.js` into a serverless function; `vercel.json` routes `/api/*` to it.

## Tech stack

- **Frontend**: React 19, Vite 7, Tailwind CSS 4, Framer Motion, Lucide icons
- **Backend**: Node.js, Express 5, deployed as a Vercel serverless function
- **Data**: Torre public API