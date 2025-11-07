/**
 * Performance Monitoring Utility
 * Tracks and reports performance metrics
 */

interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: number;
    url?: string;
}

interface PerformanceObserver {
    name: string;
    observer: PerformanceObserver | null;
    callback: (entry: PerformanceEntry) => void;
}

class PerformanceMonitor {
    private metrics: PerformanceMetric[] = [];
    private maxMetrics: number = 100;
    private enabled: boolean = true;
    private observers: Map<string, PerformanceObserver> = new Map();

    constructor() {
        this.enabled = typeof window !== 'undefined' && 'performance' in window;
        
        if (this.enabled) {
            this.initializeObservers();
            this.trackPageLoad();
        }
    }

    /**
     * Initialize performance observers
     */
    private initializeObservers(): void {
        // Track Largest Contentful Paint (LCP)
        this.observeMetric('largest-contentful-paint', (entry: any) => {
            this.recordMetric('lcp', entry.renderTime || entry.loadTime, 'ms');
        });

        // Track First Input Delay (FID)
        this.observeMetric('first-input', (entry: any) => {
            this.recordMetric('fid', entry.processingStart - entry.startTime, 'ms');
        });

        // Track Cumulative Layout Shift (CLS)
        let clsValue = 0;
        this.observeMetric('layout-shift', (entry: any) => {
            if (!entry.hadRecentInput) {
                clsValue += entry.value;
                this.recordMetric('cls', clsValue, 'score');
            }
        });

        // Track Long Tasks
        if ('PerformanceObserver' in window) {
            try {
                const observer = new (window as any).PerformanceObserver((list: PerformanceEntryList) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            this.recordMetric('long-task', entry.duration, 'ms', {
                                name: entry.name,
                            });
                        }
                    }
                });
                observer.observe({ entryTypes: ['measure', 'navigation'] });
            } catch (e) {
                // Long Tasks API not supported
            }
        }
    }

    /**
     * Observe a performance metric
     */
    private observeMetric(
        entryType: string,
        callback: (entry: PerformanceEntry) => void
    ): void {
        if (!('PerformanceObserver' in window)) {
            return;
        }

        try {
            const observer = new PerformanceObserver((list: PerformanceEntryList) => {
                for (const entry of list.getEntries()) {
                    callback(entry);
                }
            });

            observer.observe({ entryTypes: [entryType] as PerformanceEntryType[] });

            this.observers.set(entryType, {
                name: entryType,
                observer: observer as any,
                callback,
            });
        } catch (e) {
            // Metric not supported
            console.warn(`Performance metric ${entryType} not supported`);
        }
    }

    /**
     * Track page load performance
     */
    private trackPageLoad(): void {
        if (typeof window === 'undefined') return;

        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                
                if (navigation) {
                    // Time to First Byte (TTFB)
                    this.recordMetric('ttfb', navigation.responseStart - navigation.requestStart, 'ms');

                    // DOM Content Loaded
                    this.recordMetric('dom-content-loaded', navigation.domContentLoadedEventEnd - navigation.navigationStart, 'ms');

                    // Load Complete
                    this.recordMetric('load-complete', navigation.loadEventEnd - navigation.navigationStart, 'ms');

                    // DNS Lookup
                    this.recordMetric('dns-lookup', navigation.domainLookupEnd - navigation.domainLookupStart, 'ms');

                    // TCP Connection
                    this.recordMetric('tcp-connection', navigation.connectEnd - navigation.connectStart, 'ms');
                }

                // Resource timing
                const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
                resources.forEach((resource: PerformanceResourceTiming) => {
                    if (resource.initiatorType === 'script' || resource.initiatorType === 'link') {
                        this.recordMetric(`resource-${resource.initiatorType}`, resource.duration, 'ms', {
                            name: resource.name,
                            size: resource.transferSize,
                        });
                    }
                });
            }, 0);
        });
    }

    /**
     * Record a performance metric
     */
    recordMetric(
        name: string,
        value: number,
        unit: string = 'ms',
        metadata: Record<string, any> = {}
    ): void {
        if (!this.enabled) return;

        const metric: PerformanceMetric = {
            name,
            value: Math.round(value * 100) / 100, // Round to 2 decimal places
            unit,
            timestamp: Date.now(),
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            ...metadata,
        };

        this.metrics.push(metric);

        // Prevent overflow
        if (this.metrics.length > this.maxMetrics) {
            this.metrics.shift();
        }

        // Log in development
        if (import.meta.env.DEV) {
            console.log(`[Performance] ${name}: ${value}${unit}`, metadata);
        }
    }

    /**
     * Measure function execution time
     */
    async measureFunction<T>(
        name: string,
        fn: () => Promise<T> | T
    ): Promise<T> {
        const start = performance.now();
        try {
            const result = await fn();
            const duration = performance.now() - start;
            this.recordMetric(`fn-${name}`, duration, 'ms');
            return result;
        } catch (error) {
            const duration = performance.now() - start;
            this.recordMetric(`fn-${name}-error`, duration, 'ms');
            throw error;
        }
    }

    /**
     * Start a performance mark
     */
    mark(name: string): void {
        if (this.enabled && typeof performance !== 'undefined') {
            performance.mark(name);
        }
    }

    /**
     * Measure between two marks
     */
    measure(name: string, startMark: string, endMark?: string): void {
        if (this.enabled && typeof performance !== 'undefined') {
            try {
                if (endMark) {
                    performance.measure(name, startMark, endMark);
                } else {
                    performance.measure(name, startMark);
                }
                
                const measure = performance.getEntriesByName(name)[0];
                if (measure) {
                    this.recordMetric(name, measure.duration, 'ms');
                }
            } catch (e) {
                // Mark not found
            }
        }
    }

    /**
     * Get all metrics
     */
    getMetrics(): PerformanceMetric[] {
        return [...this.metrics];
    }

    /**
     * Get metrics by name
     */
    getMetricsByName(name: string): PerformanceMetric[] {
        return this.metrics.filter(m => m.name === name);
    }

    /**
     * Get latest metric by name
     */
    getLatestMetric(name: string): PerformanceMetric | null {
        const metrics = this.getMetricsByName(name);
        return metrics.length > 0 ? metrics[metrics.length - 1] : null;
    }

    /**
     * Clear all metrics
     */
    clearMetrics(): void {
        this.metrics = [];
    }

    /**
     * Get Core Web Vitals
     */
    getCoreWebVitals(): {
        lcp?: number;
        fid?: number;
        cls?: number;
        ttfb?: number;
    } {
        return {
            lcp: this.getLatestMetric('lcp')?.value,
            fid: this.getLatestMetric('fid')?.value,
            cls: this.getLatestMetric('cls')?.value,
            ttfb: this.getLatestMetric('ttfb')?.value,
        };
    }

    /**
     * Report metrics to endpoint
     */
    async reportMetrics(endpoint: string): Promise<void> {
        if (this.metrics.length === 0) return;

        try {
            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    metrics: this.metrics,
                    coreWebVitals: this.getCoreWebVitals(),
                    timestamp: Date.now(),
                }),
                keepalive: true,
            });
        } catch (error) {
            console.error('Failed to report performance metrics:', error);
        }
    }

    /**
     * Enable/disable monitoring
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

