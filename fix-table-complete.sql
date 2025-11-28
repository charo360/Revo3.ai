-- Fix repurpose_jobs table - add all missing columns
DO $$ 
BEGIN
    -- Add video_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repurpose_jobs' AND column_name = 'video_id'
    ) THEN
        ALTER TABLE repurpose_jobs ADD COLUMN video_id TEXT;
    END IF;
    
    -- Add video_url if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repurpose_jobs' AND column_name = 'video_url'
    ) THEN
        ALTER TABLE repurpose_jobs ADD COLUMN video_url TEXT;
    END IF;
    
    -- Add options if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repurpose_jobs' AND column_name = 'options'
    ) THEN
        ALTER TABLE repurpose_jobs ADD COLUMN options JSONB NOT NULL DEFAULT '{}';
    END IF;
    
    -- Make video_id and video_url NOT NULL if they have data
    -- (We'll do this carefully)
    IF EXISTS (SELECT 1 FROM repurpose_jobs WHERE video_id IS NULL LIMIT 1) THEN
        -- Table has rows, we can't make it NOT NULL yet
        NULL;
    ELSE
        -- Table is empty, we can make it NOT NULL
        ALTER TABLE repurpose_jobs ALTER COLUMN video_id SET NOT NULL;
        ALTER TABLE repurpose_jobs ALTER COLUMN video_url SET NOT NULL;
    END IF;
END $$;
