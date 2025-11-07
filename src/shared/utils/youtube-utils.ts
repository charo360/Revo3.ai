import { fetchWithRetry } from '../../core/infrastructure/retry-handlers';
import { defaultRateLimiter } from '../../core/infrastructure/rate-limiting';
import { errorTracker } from '../../core/infrastructure/error-tracking';
import { performanceMonitor } from '../../core/infrastructure/performance-monitoring';

export const fetchTranscript = async (videoUrl: string): Promise<string | null> => {
    return performanceMonitor.measureFunction('fetchTranscript', async () => {
        try {
            // Rate limiting for external API calls
            await defaultRateLimiter.acquire('youtube-transcript');

        const transcriptServiceUrl = `https://yt-trans.vercel.app/api/transcript?videoUrl=${encodeURIComponent(videoUrl)}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(transcriptServiceUrl)}`;

        // Use retry logic for fetching transcript
        const response = await fetchWithRetry(proxyUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        }, {
            maxRetries: 2,
            initialDelayMs: 1000,
            retryableErrors: (error: any) => {
                // Retry on network errors and 5xx errors, but not 4xx (client errors)
                return error.status >= 500 || error.status === 429;
            },
        });

        if (!response.ok) {
            // Don't retry on 404 or other client errors
            if (response.status === 404) {
                console.warn('Transcript not available for this video');
                return null;
            }
            console.warn(`Transcript fetch failed with status: ${response.status}`);
            return null;
        }
        
        const responseText = await response.text();
        try {
            const transcriptData = JSON.parse(responseText);
            if (Array.isArray(transcriptData) && transcriptData.length > 0) {
                return transcriptData.map(item => item.text).join(' ');
            }
            return null;
        } catch (jsonError) {
            console.warn("Failed to parse transcript response as JSON, it may be an HTML error page.", jsonError);
            return null;
        }
        } catch (e: any) {
            // Handle specific error types
            if (e.name === 'AbortError') {
                console.warn('Transcript fetch timed out');
            } else {
                console.error("Error fetching transcript:", e);
            }
            errorTracker.trackApiError(transcriptServiceUrl, 'GET', 0, e);
            return null;
        }
    });
};
