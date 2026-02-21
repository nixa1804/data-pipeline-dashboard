interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

setInterval(() => {
  const now = Date.now();
  for (const [key, window] of store) {
    if (now > window.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param id       
 * @param limit    
 * @param windowMs 
 */
export function rateLimit(
  id: string,
  limit = 60,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(id);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + windowMs;
    store.set(id, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  return {
    success: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}
