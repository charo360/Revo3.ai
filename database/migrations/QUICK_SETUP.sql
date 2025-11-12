-- QUICK SETUP: Copy and paste this entire script into Supabase SQL Editor
-- This will create all required tables for the content repurpose feature

-- 1. Repurposed Videos Table
CREATE TABLE IF NOT EXISTS repurposed_videos (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_video_id TEXT NOT NULL,
    original_video_url TEXT NOT NULL,
    original_video_title TEXT,
    original_video_duration NUMERIC NOT NULL,
    status TEXT NOT NULL,
    ml_analysis_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Viral Clips Table
CREATE TABLE IF NOT EXISTS viral_clips (
    id TEXT PRIMARY KEY,
    repurposed_video_id TEXT NOT NULL REFERENCES repurposed_videos(id) ON DELETE CASCADE,
    clip_url TEXT NOT NULL,
    clip_storage_path TEXT,
    start_time NUMERIC NOT NULL,
    end_time NUMERIC NOT NULL,
    duration NUMERIC NOT NULL,
    virality_score INTEGER NOT NULL,
    engagement_score INTEGER NOT NULL,
    title TEXT,
    description TEXT,
    thumbnail_url TEXT,
    transcript_snippet TEXT,
    platform_format TEXT NOT NULL,
    aspect_ratio TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ML Analyses Table
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

-- 4. Enable Row Level Security
ALTER TABLE repurposed_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_analyses ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Users can only access their own data)
CREATE POLICY "Users can manage their repurposed videos" ON repurposed_videos
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their viral clips" ON viral_clips
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM repurposed_videos
            WHERE repurposed_videos.id = viral_clips.repurposed_video_id
            AND repurposed_videos.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their ML analyses" ON ml_analyses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM repurposed_videos
            WHERE repurposed_videos.id = ml_analyses.repurposed_video_id
            AND repurposed_videos.user_id = auth.uid()
        )
    );

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_repurposed_videos_user_id ON repurposed_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_viral_clips_repurposed_video_id ON viral_clips(repurposed_video_id);
CREATE INDEX IF NOT EXISTS idx_ml_analyses_repurposed_video_id ON ml_analyses(repurposed_video_id);

-- Done! Your database is now ready for content repurposing 🚀
