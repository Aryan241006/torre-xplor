/**
 * Fixed-window rate limiter, keyed by client IP.
 *
 * Each IP gets `max` requests per `windowMs`. Over the limit, the request gets
 * a 429 and a Retry-After header. Counts are kept in memory, so on Vercel each
 * serverless instance counts separately; it limits abuse, it isn't an exact quota.
 */

export const rateLimit = ({ windowMs, max }) => {
  const clients = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || 'unknown';
    let client = clients.get(key);

    if (!client || now >= client.resetAt) {
      client = { count: 0, resetAt: now + windowMs };
      clients.set(key, client);
    }
    client.count += 1;

    // Drop expired entries now and then so the map doesn't grow forever.
    if (clients.size > 10_000) {
      clients.forEach((value, ip) => { if (now >= value.resetAt) clients.delete(ip); });
    }

    res.set('RateLimit-Limit', String(max));
    res.set('RateLimit-Remaining', String(Math.max(0, max - client.count)));

    if (client.count > max) {
      res.set('Retry-After', String(Math.ceil((client.resetAt - now) / 1000)));
      return res.status(429).json({ error: 'Too many requests, please slow down' });
    }
    next();
  };
};
