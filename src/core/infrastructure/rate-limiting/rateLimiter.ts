/**
 * Rate Limiter Utility
 * Prevents API abuse and ensures fair resource usage
 */

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

interface RequestQueue {
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timestamp: number;
}

class RateLimiter {
    private requests: Map<string, number[]> = new Map();
    private queue: Map<string, RequestQueue[]> = new Map();
    private processing: Map<string, boolean> = new Map();

    constructor(private config: RateLimitConfig) {}

    /**
     * Check if a request can be made
     */
    private canMakeRequest(key: string): boolean {
        const now = Date.now();
        const requests = this.requests.get(key) || [];
        
        // Remove requests outside the time window
        const validRequests = requests.filter(timestamp => now - timestamp < this.config.windowMs);
        this.requests.set(key, validRequests);

        return validRequests.length < this.config.maxRequests;
    }

    /**
     * Add request timestamp
     */
    private addRequest(key: string): void {
        const requests = this.requests.get(key) || [];
        requests.push(Date.now());
        this.requests.set(key, requests);
    }

    /**
     * Process queued requests
     */
    private async processQueue(key: string): Promise<void> {
        if (this.processing.get(key)) return;
        this.processing.set(key, true);

        while (true) {
            const queue = this.queue.get(key) || [];
            if (queue.length === 0) {
                this.processing.set(key, false);
                break;
            }

            if (this.canMakeRequest(key)) {
                const { resolve, reject, timestamp } = queue.shift()!;
                this.addRequest(key);
                
                try {
                    resolve(undefined);
                } catch (error) {
                    reject(error);
                }
            } else {
                // Wait before processing next request
                const oldestRequest = this.requests.get(key)?.[0] || Date.now();
                const waitTime = this.config.windowMs - (Date.now() - oldestRequest);
                if (waitTime > 0) {
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }
    }

    /**
     * Acquire permission to make a request
     */
    async acquire(key: string = 'default'): Promise<void> {
        if (this.canMakeRequest(key)) {
            this.addRequest(key);
            return;
        }

        // Queue the request
        return new Promise((resolve, reject) => {
            const queue = this.queue.get(key) || [];
            queue.push({ resolve, reject, timestamp: Date.now() });
            this.queue.set(key, queue);
            this.processQueue(key);
        });
    }

    /**
     * Reset rate limit for a key
     */
    reset(key: string): void {
        this.requests.delete(key);
        this.queue.delete(key);
        this.processing.delete(key);
    }

    /**
     * Get current request count for a key
     */
    getCount(key: string): number {
        const now = Date.now();
        const requests = this.requests.get(key) || [];
        return requests.filter(timestamp => now - timestamp < this.config.windowMs).length;
    }
}

// Default rate limiter: 10 requests per second per key
export const defaultRateLimiter = new RateLimiter({
    maxRequests: 10,
    windowMs: 1000,
});

// AI API rate limiter: 5 requests per 10 seconds (more restrictive)
export const aiRateLimiter = new RateLimiter({
    maxRequests: 5,
    windowMs: 10000,
});

// Image generation rate limiter: 2 requests per 30 seconds (very restrictive)
export const imageGenRateLimiter = new RateLimiter({
    maxRequests: 2,
    windowMs: 30000,
});

export { RateLimiter };
export type { RateLimitConfig };

