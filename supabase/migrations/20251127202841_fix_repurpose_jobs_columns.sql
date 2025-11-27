-- Fix repurpose_jobs table - add all missing columns safely
DO $$ 
BEGIN
    -- Add video_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'repurpose_jobs' 
        AND column_name = 'video_id'
    ) THEN
        ALTER TABLE repurpose_jobs ADD COLUMN video_id TEXT;
        RAISE NOTICE 'Added video_id column';
    END IF;
    
    -- Add video_url if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'repurpose_jobs' 
        AND column_name = 'video_url'
    ) THEN
        ALTER TABLE repurpose_jobs ADD COLUMN video_url TEXT;
        RAISE NOTICE 'Added video_url column';
    END IF;
    
    -- Add options if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'repurpose_jobs' 
        AND column_name = 'options'
    ) THEN
        ALTER TABLE repurpose_jobs ADD COLUMN options JSONB NOT NULL DEFAULT '{}';
        RAISE NOTICE 'Added options column';
    END IF;
END $$;
