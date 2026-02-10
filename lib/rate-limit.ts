interface RateLimitEntry {
    timestamps: number[];
}

interface RateLimitOptions {
    limit?: number;
    windowMs?: number;
}

interface RateLimitResult {
    success: boolean;
    remaining: number;
}

interface RateLimiter {
    check: (ip: string) => RateLimitResult;
}

const DEFAULT_LIMIT = 20;
const DEFAULT_WINDOW_MS = 60 * 1000; // 60 seconds
const CLEANUP_INTERVAL_MS = 60 * 1000; // run cleanup every 60 seconds

export function rateLimit(options: RateLimitOptions = {}): RateLimiter {
    const limit = options.limit ?? DEFAULT_LIMIT;
    const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;

    const requests = new Map<string, RateLimitEntry>();

    // Periodically clean up expired entries to prevent memory leaks
    const cleanup = () => {
        const now = Date.now();
        const cutoff = now - windowMs;

        for (const [ip, entry] of requests) {
            // Remove timestamps outside the current window
            entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

            // Remove the entry entirely if no timestamps remain
            if (entry.timestamps.length === 0) {
                requests.delete(ip);
            }
        }
    };

    setInterval(cleanup, CLEANUP_INTERVAL_MS);

    const check = (ip: string): RateLimitResult => {
        const now = Date.now();
        const cutoff = now - windowMs;

        const entry = requests.get(ip);

        if (!entry) {
            requests.set(ip, { timestamps: [now] });
            return { success: true, remaining: limit - 1 };
        }

        // Keep only timestamps within the sliding window
        entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

        if (entry.timestamps.length >= limit) {
            return { success: false, remaining: 0 };
        }

        entry.timestamps.push(now);
        const remaining = limit - entry.timestamps.length;

        return { success: true, remaining };
    };

    return { check };
}
