/**
 * Database Service for Content Repurposing
 * 
 * Handles all database operations for repurposed videos, clips, and ML analysis
 */

import { supabase } from '../../lib/supabase';
import { 
    RepurposedVideo, 
    ViralClip, 
    MLAnalysis,
    RepurposeJob 
} from '../../types/repurpose';
import { toast } from 'react-toastify';

/**
 * Save repurposed video to database
 */
export async function saveRepurposedVideo(video: RepurposedVideo): Promise<void> {
    try {
        const { error } = await supabase
            .from('repurposed_videos')
            .upsert({
                id: video.id,
                user_id: video.user_id,
                original_video_id: video.original_video_id,
                original_video_url: video.original_video_url,
                original_video_title: video.original_video_title,
                original_video_duration: video.original_video_duration,
                status: video.status,
                created_at: video.created_at,
                updated_at: video.updated_at,
                ml_analysis_id: video.ml_analysis_id,
                metadata: video.metadata,
            }, {
                onConflict: 'id'
            });

        if (error) {
            throw error;
        }
    } catch (error: any) {
        console.error('Error saving repurposed video:', error);
        throw new Error(`Failed to save repurposed video: ${error.message}`);
    }
}

/**
 * Save viral clips to database
 */
export async function saveViralClips(clips: ViralClip[]): Promise<void> {
    try {
        const clipsData = clips.map(clip => ({
            id: clip.id,
            repurposed_video_id: clip.repurposed_video_id,
            clip_url: clip.clip_url,
            clip_storage_path: clip.clip_storage_path,
            start_time: clip.start_time,
            end_time: clip.end_time,
            duration: clip.duration,
            virality_score: clip.virality_score,
            engagement_score: clip.engagement_score,
            title: clip.title,
            description: clip.description,
            thumbnail_url: clip.thumbnail_url,
            transcript_snippet: clip.transcript_snippet,
            platform_format: clip.platform_format,
            aspect_ratio: clip.aspect_ratio,
            created_at: clip.created_at,
            metadata: clip.metadata,
        }));

        const { error } = await supabase
            .from('viral_clips')
            .upsert(clipsData, {
                onConflict: 'id'
            });

        if (error) {
            throw error;
        }
    } catch (error: any) {
        console.error('Error saving viral clips:', error);
        throw new Error(`Failed to save viral clips: ${error.message}`);
    }
}

/**
 * Save ML analysis to database
 */
export async function saveMLAnalysis(analysis: MLAnalysis): Promise<void> {
    try {
        const { error } = await supabase
            .from('ml_analyses')
            .upsert({
                id: analysis.id,
                repurposed_video_id: analysis.repurposed_video_id,
                analysis_version: analysis.analysis_version,
                scene_segments: analysis.scene_segments,
                audio_analysis: analysis.audio_analysis,
                transcript_analysis: analysis.transcript_analysis,
                visual_features: analysis.visual_features,
                engagement_predictions: analysis.engagement_predictions,
                viral_moments: analysis.viral_moments,
                created_at: analysis.created_at,
                processing_time_ms: analysis.processing_time_ms,
            }, {
                onConflict: 'id'
            });

        if (error) {
            throw error;
        }
    } catch (error: any) {
        console.error('Error saving ML analysis:', error);
        throw new Error(`Failed to save ML analysis: ${error.message}`);
    }
}

/**
 * Get repurposed video by ID
 */
export async function getRepurposedVideo(id: string): Promise<RepurposedVideo | null> {
    try {
        const { data, error } = await supabase
            .from('repurposed_videos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Not found
            }
            throw error;
        }

        return data as RepurposedVideo;
    } catch (error: any) {
        console.error('Error getting repurposed video:', error);
        throw new Error(`Failed to get repurposed video: ${error.message}`);
    }
}

/**
 * Get viral clips for a repurposed video
 */
export async function getViralClips(repurposedVideoId: string): Promise<ViralClip[]> {
    try {
        const { data, error } = await supabase
            .from('viral_clips')
            .select('*')
            .eq('repurposed_video_id', repurposedVideoId)
            .order('virality_score', { ascending: false });

        if (error) {
            throw error;
        }

        return (data || []) as ViralClip[];
    } catch (error: any) {
        console.error('Error getting viral clips:', error);
        throw new Error(`Failed to get viral clips: ${error.message}`);
    }
}

/**
 * Get ML analysis for a repurposed video
 */
export async function getMLAnalysis(repurposedVideoId: string): Promise<MLAnalysis | null> {
    try {
        const { data, error } = await supabase
            .from('ml_analyses')
            .select('*')
            .eq('repurposed_video_id', repurposedVideoId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Not found
            }
            throw error;
        }

        return data as MLAnalysis;
    } catch (error: any) {
        console.error('Error getting ML analysis:', error);
        throw new Error(`Failed to get ML analysis: ${error.message}`);
    }
}

/**
 * Get all repurposed videos for a user
 */
export async function getUserRepurposedVideos(userId: string): Promise<RepurposedVideo[]> {
    try {
        const { data, error } = await supabase
            .from('repurposed_videos')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return (data || []) as RepurposedVideo[];
    } catch (error: any) {
        console.error('Error getting user repurposed videos:', error);
        throw new Error(`Failed to get user repurposed videos: ${error.message}`);
    }
}

/**
 * Create repurpose job
 */
export async function createRepurposeJob(job: RepurposeJob): Promise<void> {
    try {
        const { error } = await supabase
            .from('repurpose_jobs')
            .insert({
                id: job.id,
                user_id: job.user_id,
                video_url: job.video_url,
                status: job.status,
                progress: job.progress,
                error_message: job.error_message,
                repurposed_video_id: job.repurposed_video_id,
                created_at: job.created_at,
                updated_at: job.updated_at,
            });

        if (error) {
            throw error;
        }
    } catch (error: any) {
        console.error('Error creating repurpose job:', error);
        throw new Error(`Failed to create repurpose job: ${error.message}`);
    }
}

/**
 * Update repurpose job
 */
export async function updateRepurposeJob(
    jobId: string,
    updates: Partial<RepurposeJob>
): Promise<void> {
    try {
        const { error } = await supabase
            .from('repurpose_jobs')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', jobId);

        if (error) {
            throw error;
        }
    } catch (error: any) {
        console.error('Error updating repurpose job:', error);
        throw new Error(`Failed to update repurpose job: ${error.message}`);
    }
}

