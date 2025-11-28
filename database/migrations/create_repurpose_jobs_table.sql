-- Create repurpose_jobs table for queue management
CREATE TABLE IF NOT EXISTS repurpose_jobs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    video_url TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    error_message TEXT,
    result JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_repurpose_jobs_user_id ON repurpose_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_repurpose_jobs_status ON repurpose_jobs(status);
CREATE INDEX IF NOT EXISTS idx_repurpose_jobs_created_at ON repurpose_jobs(created_at DESC);

-- Enable RLS
ALTER TABLE repurpose_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own jobs
CREATE POLICY "Users can view their own jobs"
    ON repurpose_jobs FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can create their own jobs
CREATE POLICY "Users can create their own jobs"
    ON repurpose_jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own jobs
CREATE POLICY "Users can update their own jobs"
    ON repurpose_jobs FOR UPDATE
    USING (auth.uid() = user_id);

-- Create storage bucket for repurpose videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'repurpose-videos',
    'repurpose-videos',
    false,
    10737418240, -- 10GB limit
    ARRAY['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own videos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'repurpose-videos' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own videos"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'repurpose-videos' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own videos"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'repurpose-videos' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

