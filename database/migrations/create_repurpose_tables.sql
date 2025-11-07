-- Database Schema for Content Repurposing System
-- Run this migration in your Supabase SQL editor

-- Repurposed Videos Table
CREATE TABLE IF NOT EXISTS repurposed_videos (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_video_id TEXT NOT NULL,
    original_video_url TEXT NOT NULL,
    original_video_title TEXT,
    original_video_duration NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed', 'queued')),
    ml_analysis_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Viral Clips Table
CREATE TABLE IF NOT EXISTS viral_clips (
    id TEXT PRIMARY KEY,
    repurposed_video_id TEXT NOT NULL REFERENCES repurposed_videos(id) ON DELETE CASCADE,
    clip_url TEXT NOT NULL,
    clip_storage_path TEXT,
    start_time NUMERIC NOT NULL,
    end_time NUMERIC NOT NULL,
    duration NUMERIC NOT NULL,
    virality_score INTEGER NOT NULL CHECK (virality_score >= 0 AND virality_score <= 100),
    engagement_score INTEGER NOT NULL CHECK (engagement_score >= 0 AND engagement_score <= 100),
    title TEXT,
    description TEXT,
    thumbnail_url TEXT,
    transcript_snippet TEXT,
    platform_format TEXT NOT NULL CHECK (platform_format IN ('youtube_shorts', 'tiktok', 'instagram_reels', 'twitter', 'generic')),
    aspect_ratio TEXT NOT NULL CHECK (aspect_ratio IN ('9:16', '16:9', '1:1', '4:5')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ML Analyses Table
CREATE TABLE IF NOT EXISTS ml_analyses (
    id TEXT PRIMARY KEY,
    repurposed_video_id TEXT NOT NULL REFERENCES repurposed_videos(id) ON DELETE CASCADE,
    analysis_version TEXT NOT NULL,
    scene_segments JSONB NOT NULL,
    audio_analysis JSONB NOT NULL,
    transcript_analysis JSONB,
    visual_features JSONB NOT NULL,
    engagement_predictions JSONB NOT NULL,
    viral_moments JSONB NOT NULL,
    processing_time_ms INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repurpose Jobs Table (for queue management)
CREATE TABLE IF NOT EXISTS repurpose_jobs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    error_message TEXT,
    repurposed_video_id TEXT REFERENCES repurposed_videos(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_repurposed_videos_user_id ON repurposed_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_repurposed_videos_status ON repurposed_videos(status);
CREATE INDEX IF NOT EXISTS idx_repurposed_videos_created_at ON repurposed_videos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_viral_clips_repurposed_video_id ON viral_clips(repurposed_video_id);
CREATE INDEX IF NOT EXISTS idx_viral_clips_virality_score ON viral_clips(virality_score DESC);
CREATE INDEX IF NOT EXISTS idx_viral_clips_platform_format ON viral_clips(platform_format);

CREATE INDEX IF NOT EXISTS idx_ml_analyses_repurposed_video_id ON ml_analyses(repurposed_video_id);

CREATE INDEX IF NOT EXISTS idx_repurpose_jobs_user_id ON repurpose_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_repurpose_jobs_status ON repurpose_jobs(status);
CREATE INDEX IF NOT EXISTS idx_repurpose_jobs_created_at ON repurpose_jobs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE repurposed_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE repurpose_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users can view their own repurposed videos"
    ON repurposed_videos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own repurposed videos"
    ON repurposed_videos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own repurposed videos"
    ON repurposed_videos FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own viral clips"
    ON viral_clips FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM repurposed_videos
            WHERE repurposed_videos.id = viral_clips.repurposed_video_id
            AND repurposed_videos.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own viral clips"
    ON viral_clips FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM repurposed_videos
            WHERE repurposed_videos.id = viral_clips.repurposed_video_id
            AND repurposed_videos.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own ML analyses"
    ON ml_analyses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM repurposed_videos
            WHERE repurposed_videos.id = ml_analyses.repurposed_video_id
            AND repurposed_videos.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own ML analyses"
    ON ml_analyses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM repurposed_videos
            WHERE repurposed_videos.id = ml_analyses.repurposed_video_id
            AND repurposed_videos.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own repurpose jobs"
    ON repurpose_jobs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own repurpose jobs"
    ON repurpose_jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own repurpose jobs"
    ON repurpose_jobs FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to update updated_at
CREATE TRIGGER update_repurposed_videos_updated_at
    BEFORE UPDATE ON repurposed_videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repurpose_jobs_updated_at
    BEFORE UPDATE ON repurpose_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

