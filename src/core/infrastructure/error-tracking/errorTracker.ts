/**
 * Error Tracking Utility
 * Centralized error tracking and logging for production monitoring
 */

interface ErrorContext {
    userId?: string;
    sessionId?: string;
    url?: string;
    userAgent?: string;
    timestamp?: string;
    [key: string]: any;
}

interface ErrorReport {
    message: string;
    stack?: string;
    context: ErrorContext;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'api' | 'ui' | 'auth' | 'ai' | 'network' | 'unknown';
}

class ErrorTracker {
    private enabled: boolean = true;
    private queue: ErrorReport[] = [];
    private maxQueueSize: number = 100;
    private flushInterval: number = 5000; // 5 seconds
    private flushTimer: NodeJS.Timeout | null = null;
    private endpoint: string | null = null;

    constructor() {
        // Check if we're in production
        this.enabled = import.meta.env.PROD;
        
        // Initialize endpoint (can be configured via env var)
        this.endpoint = import.meta.env.VITE_ERROR_TRACKING_ENDPOINT || null;

        // Start flush timer
        if (this.enabled) {
            this.startFlushTimer();
        }

        // Flush on page unload
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.flush();
            });
        }
    }

    /**
     * Start automatic flush timer
     */
    private startFlushTimer(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }

        this.flushTimer = setInterval(() => {
            this.flush();
        }, this.flushInterval);
    }

    /**
     * Generate session ID
     */
    private getSessionId(): string {
        let sessionId = sessionStorage.getItem('error-tracker-session-id');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('error-tracker-session-id', sessionId);
        }
        return sessionId;
    }

    /**
     * Get error context
     */
    private getContext(): ErrorContext {
        return {
            sessionId: this.getSessionId(),
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            timestamp: new Date().toISOString(),
            screenWidth: typeof window !== 'undefined' ? window.innerWidth : undefined,
            screenHeight: typeof window !== 'undefined' ? window.innerHeight : undefined,
            language: typeof navigator !== 'undefined' ? navigator.language : undefined,
        };
    }

    /**
     * Categorize error
     */
    private categorizeError(error: Error, context: ErrorContext): ErrorReport['category'] {
        const message = error.message.toLowerCase();
        const stack = error.stack?.toLowerCase() || '';

        if (message.includes('network') || message.includes('fetch') || message.includes('cors')) {
            return 'network';
        }
        if (message.includes('auth') || message.includes('unauthorized') || message.includes('login')) {
            return 'auth';
        }
        if (message.includes('api') || stack.includes('api') || context.url?.includes('/api')) {
            return 'api';
        }
        if (message.includes('ai') || message.includes('gemini') || message.includes('generate')) {
            return 'ai';
        }
        if (stack.includes('react') || message.includes('component')) {
            return 'ui';
        }

        return 'unknown';
    }

    /**
     * Determine error severity
     */
    private determineSeverity(error: Error, category: ErrorReport['category']): ErrorReport['severity'] {
        const message = error.message.toLowerCase();

        // Critical errors
        if (
            message.includes('cannot read') ||
            message.includes('cannot access') ||
            message.includes('undefined is not') ||
            category === 'auth' && message.includes('session expired')
        ) {
            return 'critical';
        }

        // High severity
        if (
            category === 'api' ||
            category === 'ai' ||
            message.includes('timeout') ||
            message.includes('failed')
        ) {
            return 'high';
        }

        // Medium severity
        if (category === 'network' || message.includes('warning')) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * Track error
     */
    trackError(error: Error | string, additionalContext: Partial<ErrorContext> = {}): void {
        if (!this.enabled) {
            return;
        }

        const errorObj = typeof error === 'string' ? new Error(error) : error;
        const context = { ...this.getContext(), ...additionalContext };

        // Try to get user ID from localStorage or context
        try {
            const userData = localStorage.getItem('sb-auth-token');
            if (userData) {
                const parsed = JSON.parse(userData);
                if (parsed.user?.id) {
                    context.userId = parsed.user.id;
                }
            }
        } catch (e) {
            // Ignore
        }

        const category = this.categorizeError(errorObj, context);
        const severity = this.determineSeverity(errorObj, category);

        const report: ErrorReport = {
            message: errorObj.message,
            stack: errorObj.stack,
            context,
            severity,
            category,
        };

        // Add to queue
        this.queue.push(report);

        // Log to console in development
        if (!import.meta.env.PROD) {
            console.error('Error tracked:', report);
        }

        // Prevent queue overflow
        if (this.queue.length > this.maxQueueSize) {
            this.queue.shift();
        }

        // Flush critical errors immediately
        if (severity === 'critical') {
            this.flush();
        }
    }

    /**
     * Track API error
     */
    trackApiError(url: string, method: string, status: number, error: Error | string): void {
        const errorObj = typeof error === 'string' ? new Error(error) : error;
        this.trackError(errorObj, {
            apiUrl: url,
            apiMethod: method,
            apiStatus: status,
        });
    }

    /**
     * Track AI error
     */
    trackAiError(operation: string, error: Error | string, prompt?: string): void {
        const errorObj = typeof error === 'string' ? new Error(error) : error;
        this.trackError(errorObj, {
            aiOperation: operation,
            aiPrompt: prompt?.substring(0, 200), // Limit prompt length
        });
    }

    /**
     * Track performance metric
     */
    trackPerformance(metricName: string, value: number, unit: string = 'ms'): void {
        if (!this.enabled) return;

        const context = this.getContext();
        const report: ErrorReport = {
            message: `Performance: ${metricName}`,
            context: {
                ...context,
                metricName,
                metricValue: value,
                metricUnit: unit,
            },
            severity: 'low',
            category: 'unknown',
        };

        this.queue.push(report);
    }

    /**
     * Flush error queue
     */
    async flush(): Promise<void> {
        if (this.queue.length === 0) {
            return;
        }

        const reports = [...this.queue];
        this.queue = [];

        // Send to endpoint if configured
        if (this.endpoint) {
            try {
                await fetch(this.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ errors: reports }),
                    keepalive: true, // Ensure request completes even if page unloads
                });
            } catch (error) {
                // Failed to send, re-queue critical errors
                const criticalErrors = reports.filter(r => r.severity === 'critical');
                this.queue.unshift(...criticalErrors);
                console.error('Failed to send error reports:', error);
            }
        } else {
            // Log to console if no endpoint configured
            if (import.meta.env.DEV) {
                console.group('Error Reports');
                reports.forEach(report => {
                    console.error(`[${report.severity.toUpperCase()}] ${report.category}:`, report);
                });
                console.groupEnd();
            }
        }
    }

    /**
     * Enable/disable error tracking
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        if (enabled) {
            this.startFlushTimer();
        } else if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
    }

    /**
     * Set error tracking endpoint
     */
    setEndpoint(endpoint: string): void {
        this.endpoint = endpoint;
    }

    /**
     * Get error queue (for debugging)
     */
    getQueue(): ErrorReport[] {
        return [...this.queue];
    }

    /**
     * Clear error queue
     */
    clearQueue(): void {
        this.queue = [];
    }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// Export types
export type { ErrorReport, ErrorContext };

