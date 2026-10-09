/**
 * Turns any error thrown in a route into a JSON response.
 * Known errors (HttpError) keep their status and message; anything else
 * becomes a generic 500 so internal details never reach the client.
 */

export const notFound = (req, res) => {
  res.status(404).json({ error: `No API route for ${req.method} ${req.path}` });
};

// eslint-disable-next-line no-unused-vars -- Express needs all 4 arguments to treat this as an error handler.
export const errorHandler = (err, req, res, next) => {
  // express.json() throws this for a malformed request body.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }

  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(`[api] ${req.method} ${req.originalUrl} failed:`, err);
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
};
