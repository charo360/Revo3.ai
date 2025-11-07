# Content Repurposing System Documentation

## Overview

The Content Repurposing System is a machine learning-powered solution that automatically transforms long videos into viral short clips. It uses advanced ML algorithms to identify the most engaging moments, generate optimized clips for multiple platforms, and store everything in a scalable database.

## Architecture

### Core Components

1. **ML Analysis Service** (`src/services/ml/viralMomentDetector.ts`)
   - Analyzes videos to identify viral moments
   - Uses Google Gemini AI for scene detection, visual analysis, and transcript analysis
   - Calculates virality scores based on multiple factors

2. **Video Processing Service** (`src/services/video/videoProcessor.ts`)
   - Uses FFmpeg.wasm for client-side video processing
   - Handles clipping, format conversion, aspect ratio changes
   - Generates thumbnails and extracts frames

3. **Repurpose Service** (`src/services/repurpose/repurposeService.ts`)
   - Orchestrates the entire repurposing pipeline
   - Coordinates ML analysis and video processing
   - Generates clips for multiple platforms

4. **Database Service** (`src/services/repurpose/repurposeDatabase.ts`)
   - Manages all database operations
   - Stores repurposed videos, clips, and ML analyses
   - Implements Row Level Security (RLS) for data privacy

5. **Queue Service** (`src/services/repurpose/repurposeQueue.ts`)
   - Manages job queue for asynchronous processing
   - Implements rate limiting and retry logic
   - Tracks job progress

## Database Schema

### Tables

1. **repurposed_videos**: Stores metadata about repurposed videos
2. **viral_clips**: Stores generated clips with virality scores
3. **ml_analyses**: Stores ML analysis results
4. **repurpose_jobs**: Manages processing jobs and queue

See `database/migrations/create_repurpose_tables.sql` for full schema.

## ML Algorithm

### Viral Moment Detection

The algorithm uses a multi-factor approach to identify viral moments:

1. **Visual Analysis**
   - Scene detection (action, dialogue, transition, hook, climax)
   - Visual complexity and motion level
   - Face detection and object recognition
   - Color and brightness analysis

2. **Audio Analysis**
   - Volume levels and peaks
   - Speech and music detection
   - Silence period detection
   - Sentiment analysis (if transcript available)

3. **Transcript Analysis**
   - Key phrase extraction
   - Hook detection
   - Topic identification
   - Sentiment scoring

4. **Engagement Prediction**
   - Combines all factors into engagement scores
   - Predicts viewer engagement for time windows
   - Identifies optimal clip boundaries

### Virality Score Calculation

```
Virality Score = Base Engagement Score (0-100)
                + Hook Boost (+10 if hook present)
                + Action Boost (+5 if action scene)
```

## Scalability Features

### 1. Rate Limiting
- Uses token bucket algorithm
- Limits API calls to prevent overwhelming services
- Separate rate limiters for different operations

### 2. Queue System
- Asynchronous job processing
- Prevents system overload
- Supports retry logic

### 3. Database Optimization
- Indexed queries for fast retrieval
- Row Level Security for data isolation
- Efficient data partitioning

### 4. Caching
- Caches ML analysis results
- Reuses processed frames
- Stores intermediate results

### 5. Batch Processing
- Processes multiple clips in parallel
- Limits concurrent operations
- Optimizes resource usage

## Usage

### Basic Usage

```typescript
import { repurposeVideo } from './services/repurpose/repurposeService';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const videoFile = // ... your video file
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
```

### Advanced Options

```typescript
const options: ClipGenerationOptions = {
    min_duration: 15,          // Minimum clip duration in seconds
    max_duration: 60,          // Maximum clip duration in seconds
    target_clip_count: 10,     // Number of clips to generate
    platforms: [               // Target platforms
        'youtube_shorts',
        'tiktok',
        'instagram_reels',
        'twitter'
    ],
    include_captions: true,    // Add captions to clips
    include_transitions: true, // Add transitions between scenes
    virality_threshold: 70,    // Minimum virality score (0-100)
    overlap_prevention: true,  // Prevent overlapping clips
};
```

## Setup

### 1. Install Dependencies

```bash
npm install @ffmpeg/ffmpeg @ffmpeg/util
```

### 2. Run Database Migration

Execute `database/migrations/create_repurpose_tables.sql` in your Supabase SQL editor.

### 3. Configure Environment Variables

Ensure you have:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

## Performance Considerations

### Video Processing
- FFmpeg.wasm processes videos in the browser
- For large videos (>500MB), consider server-side processing
- Video processing is CPU-intensive; consider Web Workers

### ML Analysis
- Frame extraction is optimized (max 60 frames)
- Images are optimized before sending to AI
- Rate limiting prevents API overload

### Database
- Indexes ensure fast queries
- RLS policies protect user data
- Efficient data structure for scalability

## Future Enhancements

1. **Server-Side Processing**: Move heavy processing to server
2. **GPU Acceleration**: Use GPU for faster video processing
3. **Advanced ML Models**: Train custom models for better accuracy
4. **Real-time Processing**: Stream processing for live videos
5. **Cloud Storage**: Integrate with cloud storage for clip storage
6. **Analytics**: Track clip performance and improve algorithms

## Troubleshooting

### FFmpeg Loading Issues
- Ensure stable internet connection for loading FFmpeg.wasm
- Check browser compatibility (modern browsers required)
- Consider using CDN for FFmpeg files

### ML Analysis Failures
- Check API key validity
- Verify video format compatibility
- Ensure sufficient API quota

### Database Errors
- Verify Supabase configuration
- Check RLS policies
- Ensure proper user authentication

## Support

For issues or questions, please refer to the main project documentation or contact support.

