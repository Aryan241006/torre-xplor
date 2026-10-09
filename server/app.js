/**
 * Express app for the Torre Xplor API.
 *
 * Runs in two places with no changes:
 *  - locally, started by server/dev.js
 *  - on Vercel, exported by api/index.js as a serverless function
 */

import express from 'express';
import searchRouter from './routes/search.js';
import genomeRouter from './routes/genome.js';
import compareRouter from './routes/compare.js';
import recommendationsRouter from './routes/recommendations.js';
import { rateLimit } from './middleware/rateLimit.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Vercel sits in front of the function as a proxy; trust it so req.ip is the real client IP.
app.set('trust proxy', true);
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', rateLimit({ windowMs: 60_000, max: 60 }));
app.use('/api/search', searchRouter);
app.use('/api/genome', genomeRouter);
app.use('/api/compare', compareRouter);
// Each recommendation triggers many Torre calls, so it gets a tighter limit.
app.use('/api/recommendations', rateLimit({ windowMs: 60_000, max: 10 }), recommendationsRouter);

app.use('/api', notFound);
app.use(errorHandler);

export default app;
