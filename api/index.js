/**
 * Vercel entry point. Vercel turns each file in /api into a serverless function;
 * this one serves the whole Express app. vercel.json routes every /api/* request here.
 */

import app from '../server/app.js';

export default app;
