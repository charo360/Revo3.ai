# YouTube Video Download Instructions

To test the viral clip generation with the YouTube video:
https://www.youtube.com/watch?v=C53N3SdD4Cs

## Quick Test (Manual Download)

1. **Download the video:**
   - Visit: https://www.youtube.com/watch?v=C53N3SdD4Cs
   - Use a YouTube downloader (like yt-dlp, 4K Video Downloader, etc.)
   - Save as `test-video.mp4` in the project root

2. **Run the test:**
   ```bash
   node test-youtube-repurpose.mjs
   ```

## Production Implementation

For production, you should implement YouTube download in an Edge Function using:

1. **yt-dlp** (recommended):
   - Add yt-dlp to your Edge Function
   - Use it to download videos server-side
   - Bypasses CORS restrictions

2. **YouTube Download API Service:**
   - Use a service like RapidAPI's YouTube Downloader
   - Or build your own using yt-dlp

3. **Current Status:**
   - Edge Function skeleton created: `supabase/functions/download-youtube/index.ts`
   - Needs yt-dlp implementation for full functionality

## Test Script Features

The test script (`test-youtube-repurpose.mjs`) will:
- ✅ Download/load the video
- ✅ Upload to Supabase Storage
- ✅ Create a repurpose job
- ✅ Poll for completion
- ✅ Display generated viral clips with:
  - Title and description
  - Virality scores
  - Time ranges
  - Hashtags
  - Captions

## Next Steps

1. Download the video manually for testing
2. Run the test script
3. Review the generated viral clip
4. Implement yt-dlp in Edge Function for production
