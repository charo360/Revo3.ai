/**
 * Retry Handler Utility
 * Implements exponential backoff for failed requests
 */

interface RetryConfig {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    retryableErrors?: (error: any) => boolean;
}

const defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    retryableErrors: (error: any) => {
        // Retry on network errors, timeouts, and 5xx errors
        if (error instanceof TypeError && error.message.includes('fetch')) return true;
        if (error.name === 'AbortError') return false; // Don't retry aborted requests
        if (error.status >= 500 && error.status < 600) return true;
        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') return true;
        return false;
    },
};

/**
 * Sleep utility
 */
const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Calculate delay with exponential backoff
 */
const calculateDelay = (attempt: number, config: RetryConfig): number => {
    const delay = Math.min(
        config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelayMs
    );
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.3 * delay;
    return delay + jitter;
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
): Promise<T> {
    const finalConfig = { ...defaultRetryConfig, ...config };
    let lastError: any;

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            // Check if error is retryable
            if (finalConfig.retryableErrors && !finalConfig.retryableErrors(error)) {
                throw error;
            }

            // Don't retry on last attempt
            if (attempt === finalConfig.maxRetries) {
                break;
            }

            // Calculate delay and wait
            const delay = calculateDelay(attempt, finalConfig);
            console.warn(`Request failed (attempt ${attempt + 1}/${finalConfig.maxRetries + 1}), retrying in ${delay}ms...`, error);
            await sleep(delay);
        }
    }

    throw lastError;
}

/**
 * Retry handler for fetch requests
 */
export async function fetchWithRetry(
    url: string,
    options: RequestInit = {},
    config: Partial<RetryConfig> = {}
): Promise<Response> {
    return retryWithBackoff(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });

            // Treat 5xx errors as retryable
            if (response.status >= 500 && response.status < 600) {
                throw new Error(`Server error: ${response.status}`);
            }

            return response;
        } finally {
            clearTimeout(timeoutId);
        }
    }, config);
}

export { RetryConfig };

