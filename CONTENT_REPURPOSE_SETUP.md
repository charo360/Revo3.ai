# Content Repurpose Setup Guide

## Overview

The content repurpose feature has been refactored to use server-side processing with a queue system. This allows for:
- **No file size limits** - Videos of any size can be processed
- **Background processing** - Jobs run asynchronously on the server
- **Better performance** - Server-side FFmpeg processing is faster than browser
- **Scalability** - Queue system handles multiple jobs efficiently

## Architecture

### Components

1. **Client (Browser)**
   - `RepurposeModule.tsx` - Main UI component
   - `uploadService.ts` - Handles chunked video uploads
   - `repurposeQueue.ts` - Manages job creation and status polling

2. **Server (Supabase Edge Functions)**
   - `repurpose-video/index.ts` - Edge function for video processing
   - Processes videos using FFmpeg
   - Manages job queue in database

3. **Database**
   - `repurpose_jobs` table - Stores job status and results
   - `repurpose-videos` storage bucket - Stores uploaded videos

## Setup Instructions

### 1. Database Setup

Run the migration to create the necessary tables:

```sql
-- Run this in your Supabase SQL editor
\i database/migrations/create_repurpose_jobs_table.sql
```

Or manually execute the SQL from `database/migrations/create_repurpose_jobs_table.sql`

### 2. Storage Bucket

The migration creates a storage bucket automatically, but verify it exists:

1. Go to Supabase Dashboard → Storage
2. Check that `repurpose-videos` bucket exists
3. Verify policies are set correctly

### 3. Deploy Edge Function

Deploy the repurpose-video Edge Function:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy repurpose-video
```

### 4. Environment Variables

Ensure these are set in Supabase Dashboard → Settings → Edge Functions:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for admin operations)
- `GEMINI_API_KEY` - Google Gemini API key for AI analysis

### 5. Test the Setup

1. Upload a video in the Content Repurpose page
2. Check that it uploads successfully
3. Verify job is created in `repurpose_jobs` table
4. Monitor job status updates

## How It Works

### Upload Flow

1. User selects/upload video
2. Video is uploaded to Supabase Storage in chunks (for large files)
3. Upload progress is shown to user

### Processing Flow

1. Client creates a job via Edge Function
2. Job is stored in `repurpose_jobs` table with status `queued`
3. Edge Function processes video asynchronously:
   - Downloads video from storage
   - Extracts frames (optimized sampling)
   - Analyzes for viral moments (AI)
   - Generates clips (FFmpeg)
   - Uploads clips to storage
4. Job status is updated in database
5. Client polls for status updates
6. When complete, results are displayed

### Progress Updates

- **Upload Progress**: Real-time during video upload
- **Processing Progress**: Polled every 2 seconds from database
- **Status Messages**: Toast notifications at key milestones

## Optimization Features

### Frame Extraction
- Samples every 2-3 seconds (depending on video length)
- Maximum 40 frames (reduced from 60)
- Faster processing with minimal quality loss

### Chunked Uploads
- 5MB chunks for large files
- Progress tracking
- Automatic retry on failure

### Queue System
- Jobs processed asynchronously
- Status tracking in database
- Can handle multiple concurrent jobs

## Troubleshooting

### Job Stuck in "Processing"
- Check Edge Function logs in Supabase Dashboard
- Verify FFmpeg is available in Edge Function environment
- Check video format compatibility

### Upload Fails
- Verify storage bucket exists and has correct policies
- Check file size (should work for any size now)
- Verify user has proper permissions

### No Progress Updates
- Check database connection
- Verify polling is working (check browser console)
- Check Edge Function is deployed correctly

## Future Improvements

1. **WebSocket Updates**: Replace polling with WebSocket for real-time updates
2. **FFmpeg Integration**: Full FFmpeg.wasm or server-side FFmpeg implementation
3. **Video Transcoding**: Support more video formats
4. **Batch Processing**: Process multiple videos in parallel
5. **Priority Queue**: Prioritize certain jobs

## Notes

- The Edge Function currently has placeholder implementations for FFmpeg
- In production, you'll need to implement actual video processing
- Consider using a dedicated video processing service (e.g., Mux, Cloudinary) for production



