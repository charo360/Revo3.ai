-- Add options column if it doesn't exist
ALTER TABLE repurpose_jobs 
ADD COLUMN IF NOT EXISTS options JSONB NOT NULL DEFAULT '{}';
