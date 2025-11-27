-- Add options column to repurpose_jobs if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repurpose_jobs' 
        AND column_name = 'options'
    ) THEN
        ALTER TABLE repurpose_jobs 
        ADD COLUMN options JSONB NOT NULL DEFAULT '{}';
    END IF;
END $$;
