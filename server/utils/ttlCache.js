/**
 * Small in-memory cache where entries expire after a fixed time.
 *
 * On Vercel each serverless instance has its own memory, so this cache is
 * per-instance and is lost when the instance shuts down. That's fine for
 * reducing repeated calls to Torre; it is not a shared or persistent store.
 */
export class TtlCache {
  constructor({ ttlMs, maxEntries }) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.entries = new Map();
  }

  get(key) {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value) {
    // Map keeps insertion order, so the first key is the oldest entry.
    if (this.entries.size >= this.maxEntries) {
      this.entries.delete(this.entries.keys().next().value);
    }
    this.entries.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}
