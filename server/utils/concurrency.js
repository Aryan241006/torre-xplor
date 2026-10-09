/**
 * Like Promise.all over items.map(fn), but runs at most `limit` calls at a time.
 * Keeps the backend from flooding Torre with dozens of simultaneous requests.
 */
export const mapWithConcurrency = async (items, limit, fn) => {
  const results = new Array(items.length);
  let next = 0;

  const worker = async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index], index);
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
};
