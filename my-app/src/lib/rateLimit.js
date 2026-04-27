const WINDOW_MS = 60 * 1000; // 1 minute sliding window
const MAX_REQUESTS = 20;

// In-memory store: ip -> array of request timestamps within the window.
// For production, replace this Map with a Redis client (e.g. ioredis) so the
// limit is enforced across multiple server instances.
const store = new Map();

export function rateLimit(ip) {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const timestamps = (store.get(ip) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  store.set(ip, timestamps);

  // Probabilistic cleanup so the Map doesn't grow unbounded.
  // On ~1% of requests, evict IPs whose entire history has expired.
  if (Math.random() < 0.01) {
    for (const [key, val] of store.entries()) {
      if (val.every((t) => t <= windowStart)) store.delete(key);
    }
  }

  return { allowed: true, remaining: MAX_REQUESTS - timestamps.length };
}
