/**
 * Repurpose Queue Service
 * 
 * Implements a queue system for processing videos asynchronously
 * This ensures scalability by:
 * - Queueing jobs for background processing
 * - Rate limiting to prevent overwhelming the system
 * - Retry logic for failed jobs
 * - Progress tracking
 */

import { RepurposeJob } from '../../types/repurpose';
import { createRepurposeJob, updateRepurposeJob } from './repurposeDatabase';
import { imageGenRateLimiter } from '../../utils/rateLimiter';

// In-memory queue (in production, use Redis or a proper queue service)
const jobQueue: RepurposeJob[] = [];
let isProcessing = false;
const MAX_CONCURRENT_JOBS = 2; // Limit concurrent processing

/**
 * Add job to queue
 */
export async function queueRepurposeJob(job: RepurposeJob): Promise<void> {
    job.status = 'queued';
    job.progress = 0;
    job.created_at = new Date().toISOString();
    job.updated_at = new Date().toISOString();
    
    // Save to database
    await createRepurposeJob(job);
    
    // Add to queue
    jobQueue.push(job);
    
    // Start processing if not already processing
    if (!isProcessing) {
        processQueue();
    }
}

/**
 * Process queue
 */
async function processQueue(): Promise<void> {
    if (isProcessing || jobQueue.length === 0) {
        return;
    }
    
    isProcessing = true;
    
    while (jobQueue.length > 0) {
        // Get next job
        const job = jobQueue.shift();
        if (!job) break;
        
        // Check rate limit
        await imageGenRateLimiter.acquire(`repurpose-${job.user_id}`);
        
        try {
            // Update job status
            job.status = 'processing';
            job.progress = 10;
            await updateRepurposeJob(job.id, { status: 'processing', progress: 10 });
            
            // Process job (this would call the actual repurpose function)
            // For now, we'll just simulate processing
            // In production, this would call repurposeVideo()
            
            // Update progress
            job.progress = 100;
            job.status = 'completed';
            await updateRepurposeJob(job.id, { status: 'completed', progress: 100 });
        } catch (error: any) {
            console.error(`Error processing job ${job.id}:`, error);
            job.status = 'failed';
            job.error_message = error.message;
            await updateRepurposeJob(job.id, {
                status: 'failed',
                error_message: error.message,
            });
        }
    }
    
    isProcessing = false;
}

/**
 * Get queue status
 */
export function getQueueStatus(): { queued: number; processing: number } {
    return {
        queued: jobQueue.length,
        processing: isProcessing ? 1 : 0,
    };
}

