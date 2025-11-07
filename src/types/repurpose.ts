// Type definitions for Content Repurposing System

export interface RepurposedVideo {
    id: string;
    user_id: string;
    original_video_id: string;
    original_video_url: string;
    original_video_title?: string;
    original_video_duration: number; // in seconds
    status: 'processing' | 'completed' | 'failed' | 'queued';
    created_at: string;
    updated_at: string;
    ml_analysis_id?: string;
    metadata?: RepurposeMetadata;
}

export interface RepurposeMetadata {
    video_format: string;
    resolution: string;
    file_size: number; // in bytes
    source_platform?: 'youtube' | 'vimeo' | 'zoom' | 'direct_upload' | 'google_drive' | 'other';
    source_url?: string;
}

export interface ViralClip {
    id: string;
    repurposed_video_id: string;
    clip_url: string;
    clip_storage_path: string;
    start_time: number; // in seconds
    end_time: number; // in seconds
    duration: number; // in seconds
    virality_score: number; // 0-100
    engagement_score: number; // 0-100
    title?: string;
    description?: string;
    thumbnail_url?: string;
    transcript_snippet?: string;
    platform_format: 'youtube_shorts' | 'tiktok' | 'instagram_reels' | 'twitter' | 'generic';
    aspect_ratio: '9:16' | '16:9' | '1:1' | '4:5';
    created_at: string;
    metadata?: ClipMetadata;
}

export interface ClipMetadata {
    frame_count: number;
    fps: number;
    resolution: string;
    file_size: number;
    audio_enabled: boolean;
    captions_enabled: boolean;
    transitions?: string[];
    effects?: string[];
}

export interface MLAnalysis {
    id: string;
    repurposed_video_id: string;
    analysis_version: string; // ML model version
    scene_segments: SceneSegment[];
    audio_analysis: AudioAnalysis;
    transcript_analysis?: TranscriptAnalysis;
    visual_features: VisualFeatures;
    engagement_predictions: EngagementPrediction[];
    viral_moments: ViralMoment[];
    created_at: string;
    processing_time_ms: number;
}

export interface SceneSegment {
    id: string;
    start_time: number;
    end_time: number;
    duration: number;
    scene_type: 'action' | 'dialogue' | 'transition' | 'hook' | 'climax' | 'conclusion';
    importance_score: number; // 0-1
    visual_complexity: number; // 0-1
    motion_level: number; // 0-1
    keyframes: string[]; // URLs to keyframe images
}

export interface AudioAnalysis {
    overall_volume: number; // 0-1
    speech_presence: number; // 0-1
    music_presence: number; // 0-1
    silence_periods: Array<{ start: number; end: number }>;
    peak_audio_moments: Array<{ time: number; intensity: number }>;
    sentiment_score?: number; // -1 to 1
    emotion_detection?: Array<{ time: number; emotion: string; confidence: number }>;
}

export interface TranscriptAnalysis {
    full_transcript?: string;
    sentences: TranscriptSentence[];
    key_phrases: Array<{ phrase: string; importance: number; timestamps: number[] }>;
    topics: Array<{ topic: string; confidence: number; timestamps: number[] }>;
    sentiment_scores: Array<{ time: number; sentiment: number }>; // -1 to 1
    hooks: Array<{ text: string; start_time: number; end_time: number; hook_score: number }>;
}

export interface TranscriptSentence {
    text: string;
    start_time: number;
    end_time: number;
    speaker?: string;
    confidence: number;
}

export interface VisualFeatures {
    dominant_colors: Array<{ color: string; percentage: number }>;
    brightness_levels: Array<{ time: number; brightness: number }>;
    contrast_levels: Array<{ time: number; contrast: number }>;
    face_detections: Array<{ time: number; count: number; confidence: number }>;
    object_detections?: Array<{ time: number; objects: Array<{ label: string; confidence: number }> }>;
    text_overlays?: Array<{ time: number; text: string; confidence: number }>;
}

export interface EngagementPrediction {
    time_window: { start: number; end: number };
    predicted_engagement: number; // 0-1
    factors: {
        visual_appeal: number;
        audio_appeal: number;
        content_quality: number;
        hook_potential: number;
    };
}

export interface ViralMoment {
    id: string;
    start_time: number;
    end_time: number;
    duration: number;
    virality_score: number; // 0-100
    confidence: number; // 0-1
    reasoning: string; // AI explanation of why this moment is viral-worthy
    clip_suggestions: Array<{
        start_time: number;
        end_time: number;
        optimal_duration: number;
        recommended_platforms: string[];
    }>;
}

export interface RepurposeJob {
    id: string;
    user_id: string;
    video_file?: File;
    video_url?: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number; // 0-100
    error_message?: string;
    repurposed_video_id?: string;
    created_at: string;
    updated_at: string;
}

export interface ClipGenerationOptions {
    min_duration: number; // minimum clip duration in seconds (default: 15)
    max_duration: number; // maximum clip duration in seconds (default: 60)
    target_clip_count: number; // desired number of clips (default: 10)
    platforms: Array<'youtube_shorts' | 'tiktok' | 'instagram_reels' | 'twitter'>;
    include_captions: boolean;
    include_transitions: boolean;
    virality_threshold: number; // minimum virality score (0-100, default: 70)
    overlap_prevention: boolean; // prevent clips from overlapping
}

export interface RepurposeResult {
    repurposed_video: RepurposedVideo;
    clips: ViralClip[];
    ml_analysis: MLAnalysis;
    statistics: {
        total_clips_generated: number;
        average_virality_score: number;
        processing_time_seconds: number;
        total_output_size: number; // bytes
    };
}

