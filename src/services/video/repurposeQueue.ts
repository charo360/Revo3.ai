/**
 * Repurpose Queue Service
 * Manages video repurposing jobs with status polling
 */

import { supabase } from '../../lib/supabase';

export interface RepurposeJob {
  id: string;
  user_id: string;
  video_id: string;
  video_url: string;
  options: any;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  error_message?: string;
  result?: any;
  created_at: string;
  updated_at: string;
}

const POLL_INTERVAL = 2000; // Poll every 2 seconds

/**
 * Create a repurpose job
 */
export async function createRepurposeJob(
  userId: string,
  videoId: string,
  videoUrl: string,
  options: any
): Promise<string> {
  console.log('[Queue] Creating repurpose job:', { userId, videoId, videoUrl, options });
  
  // Call Supabase Edge Function
  const { data, error } = await supabase.functions.invoke('repurpose-video', {
    body: {
      action: 'create_job',
      userId,
      videoId,
      videoUrl, // Make sure videoUrl is included
      options
    }
  });

  if (error) {
    console.error('[Queue] Error creating job:', error);
    throw new Error(`Failed to create job: ${error.message}`);
  }

  console.log('[Queue] Job creation response:', data);

  if (!data || !data.jobId) {
    throw new Error('Invalid response from server: missing jobId');
  }

  return data.jobId;
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<RepurposeJob> {
  // First try to get from database directly (faster)
  const { data: dbData, error: dbError } = await supabase
    .from('repurpose_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (!dbError && dbData) {
    return dbData as RepurposeJob;
  }

  // Fallback to Edge Function
  const { data, error } = await supabase.functions.invoke('repurpose-video', {
    body: {
      action: 'get_status',
      jobId
    }
  });

  if (error) {
    throw new Error(`Failed to get job status: ${error.message}`);
  }

  return data as RepurposeJob;
}

/**
 * Poll job status until completion
 */
export async function pollJobStatus(
  jobId: string,
  onProgress?: (job: RepurposeJob) => void,
  onComplete?: (job: RepurposeJob) => void,
  onError?: (error: Error) => void
): Promise<RepurposeJob> {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const job = await getJobStatus(jobId);
        
        onProgress?.(job);

        if (job.status === 'completed') {
          onComplete?.(job);
          resolve(job);
          return;
        }

        if (job.status === 'failed' || job.status === 'cancelled') {
          const error = new Error(job.error_message || 'Job failed');
          onError?.(error);
          reject(error);
          return;
        }

        // Continue polling
        setTimeout(poll, POLL_INTERVAL);
      } catch (error: any) {
        onError?.(error);
        reject(error);
      }
    };

    poll();
  });
}

/**
 * Cancel a job
 */
export async function cancelJob(jobId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('repurpose-video', {
    body: {
      action: 'cancel_job',
      jobId
    }
  });

  if (error) {
    throw new Error(`Failed to cancel job: ${error.message}`);
  }
}

