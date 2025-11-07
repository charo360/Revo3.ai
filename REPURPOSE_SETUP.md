# Content Repurposing System - Setup Guide

## Overview

The Content Repurposing System uses machine learning to automatically identify viral moments in long videos and generate optimized short clips for various platforms (YouTube Shorts, TikTok, Instagram Reels, Twitter).

## Prerequisites

1. **Supabase Database**: Set up a Supabase project
2. **Environment Variables**: Configure API keys
3. **Dependencies**: Install required npm packages

## Setup Steps

### 1. Install Dependencies

```bash
npm install @ffmpeg/ffmpeg @ffmpeg/util
```

### 2. Database Setup

Run the SQL migration file in your Supabase SQL editor:

```sql
-- File: database/migrations/create_repurpose_tables.sql
```

This will create:
- `repurposed_videos` table
- `viral_clips` table
- `ml_analyses` table
- `repurpose_jobs` table
- Indexes for performance
- Row Level Security (RLS) policies

### 3. Environment Variables

Ensure you have the following in your `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Verify Setup

1. Start the development server: `npm run dev`
2. Navigate to `/platforms/repurpose` (must be authenticated)
3. Upload a video or provide a video URL
4. Configure options and generate clips

## Architecture

### ML Algorithm Flow

1. **Frame Extraction**: Sample frames from video (every 2 seconds, max 60 frames)
2. **Visual Analysis**: Analyze frames for scenes, colors, faces, objects
3. **Audio Analysis**: Detect volume peaks, speech, music (placeholder)
4. **Transcript Analysis**: Extract key phrases, hooks, sentiment (if available)
5. **Engagement Prediction**: Combine all factors to predict engagement
6. **Viral Moment Detection**: Identify moments with high viral potential
7. **Clip Generation**: Generate optimized clips for each platform

### Video Processing Flow

1. **FFmpeg Initialization**: Load FFmpeg.wasm in browser
2. **Video Clipping**: Extract clips based on viral moments
3. **Format Conversion**: Convert to MP4 with platform-specific settings
4. **Aspect Ratio Conversion**: Resize to 9:16, 16:9, 1:1, or 4:5
5. **Thumbnail Generation**: Generate thumbnails for each clip

### Database Flow

1. **Create Repurposed Video**: Store video metadata
2. **Save ML Analysis**: Store analysis results
3. **Save Clips**: Store generated clips with metadata
4. **Update Status**: Mark processing as completed

## Scalability Features

### 1. Rate Limiting
- Token bucket algorithm
- Separate limiters for different operations
- Prevents API overload

### 2. Queue System
- Asynchronous job processing
- Prevents system overload
- Supports retry logic

### 3. Image Optimization
- Optimizes frames before AI analysis
- Reduces API payload size
- Faster processing

### 4. Batch Processing
- Processes clips in batches
- Limits concurrent operations
- Prevents resource exhaustion

### 5. Database Optimization
- Indexed queries
- Efficient data structure
- Row Level Security

## Usage

### Basic Example

```typescript
import { repurposeVideo } from './services/repurpose/repurposeService';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const videoFile = // ... File object
const videoUrl = URL.createObjectURL(videoFile);

const result = await repurposeVideo(
    ai,
    videoFile,
    videoUrl,
    userId,
    {
        target_clip_count: 10,
        platforms: ['youtube_shorts', 'tiktok'],
        virality_threshold: 70,
    }
);

console.log(`Generated ${result.clips.length} clips`);
console.log(`Average virality score: ${result.statistics.average_virality_score}`);
```

### Advanced Options

```typescript
const options: ClipGenerationOptions = {
    min_duration: 15,          // Minimum clip duration (seconds)
    max_duration: 60,          // Maximum clip duration (seconds)
    target_clip_count: 10,     // Number of clips to generate
    platforms: [               // Target platforms
        'youtube_shorts',
        'tiktok',
        'instagram_reels',
        'twitter'
    ],
    include_captions: true,    // Add captions to clips
    include_transitions: true, // Add transitions
    virality_threshold: 70,    // Minimum virality score (0-100)
    overlap_prevention: true,  // Prevent overlapping clips
};
```

## Performance Considerations

### Video Processing
- FFmpeg.wasm runs in browser (CPU-intensive)
- For videos >500MB, consider server-side processing
- Processing time depends on video length and number of clips

### ML Analysis
- Frame extraction: ~1-2 seconds per frame
- AI analysis: ~5-10 seconds per analysis
- Total processing: ~30-60 seconds for a 10-minute video

### Database
- Queries are indexed for fast retrieval
- RLS policies ensure data security
- Efficient JSONB storage for analysis data

## Troubleshooting

### FFmpeg Loading Issues
- Ensure stable internet connection
- Check browser compatibility
- Clear browser cache if needed

### ML Analysis Failures
- Check API key validity
- Verify video format compatibility
- Ensure sufficient API quota

### Database Errors
- Verify Supabase configuration
- Check RLS policies
- Ensure proper authentication

### Performance Issues
- Reduce target_clip_count
- Increase virality_threshold
- Process videos in smaller batches

## Future Enhancements

1. **Server-Side Processing**: Move heavy processing to server
2. **GPU Acceleration**: Use GPU for faster processing
3. **Advanced ML Models**: Train custom models
4. **Real-time Processing**: Stream processing for live videos
5. **Cloud Storage**: Integrate with cloud storage
6. **Analytics**: Track clip performance

## Support

For issues or questions, refer to:
- `CONTENT_REPURPOSE.md` - Full documentation
- `SCALABILITY.md` - Scalability strategy
- Main project documentation

