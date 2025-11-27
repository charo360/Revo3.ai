# FINAL FIX: Add Missing Columns to repurpose_jobs Table

## Problem
The `repurpose_jobs` table is missing required columns: `video_id`, `video_url`, and `options`.

## Solution
Run this SQL in your Supabase Dashboard → SQL Editor:

```sql
-- Add missing columns to repurpose_jobs
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
END $$;
```

## After Running SQL
1. Wait 5 seconds for schema cache to update
2. Run: `node check-table-schema.mjs` to verify
3. Run: `node test-repurpose-full.mjs` to test
