/**
 * Request Cache Utility
 * Caches API responses to reduce redundant requests
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface CacheConfig {
    ttl: number; // Time to live in milliseconds
    maxSize: number; // Maximum number of entries
}

const DEFAULT_CONFIG: CacheConfig = {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
};

class RequestCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private config: CacheConfig;

    constructor(config: Partial<CacheConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Generate cache key from request parameters
     */
    private generateKey(url: string, options?: RequestInit): string {
        const method = options?.method || 'GET';
        const body = options?.body ? JSON.stringify(options.body) : '';
        return `${method}:${url}:${body}`;
    }

    /**
     * Check if cache entry is valid
     */
    private isValid(entry: CacheEntry<any>): boolean {
        return Date.now() < entry.expiresAt;
    }

    /**
     * Clean up expired entries
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now >= entry.expiresAt) {
                this.cache.delete(key);
            }
        }

        // If still over max size, remove oldest entries
        if (this.cache.size > this.config.maxSize) {
            const entries = Array.from(this.cache.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp);
            
            const toRemove = entries.slice(0, this.cache.size - this.config.maxSize);
            for (const [key] of toRemove) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get cached data
     */
    get<T>(url: string, options?: RequestInit): T | null {
        this.cleanup();
        const key = this.generateKey(url, options);
        const entry = this.cache.get(key);

        if (entry && this.isValid(entry)) {
            return entry.data as T;
        }

        if (entry) {
            this.cache.delete(key);
        }

        return null;
    }

    /**
     * Set cache data
     */
    set<T>(url: string, data: T, options?: RequestInit, customTTL?: number): void {
        this.cleanup();
        const key = this.generateKey(url, options);
        const ttl = customTTL || this.config.ttl;

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl,
        });
    }

    /**
     * Clear cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Remove specific cache entry
     */
    delete(url: string, options?: RequestInit): void {
        const key = this.generateKey(url, options);
        this.cache.delete(key);
    }

    /**
     * Get cache size
     */
    size(): number {
        this.cleanup();
        return this.cache.size;
    }
}

// Global cache instance
export const requestCache = new RequestCache();

// Specialized caches for different use cases
export const aiResponseCache = new RequestCache({
    ttl: 10 * 60 * 1000, // 10 minutes for AI responses
    maxSize: 50,
});

export const imageCache = new RequestCache({
    ttl: 30 * 60 * 1000, // 30 minutes for images
    maxSize: 200,
});

export { RequestCache };
export type { CacheConfig };

