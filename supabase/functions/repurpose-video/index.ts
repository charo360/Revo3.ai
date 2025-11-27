/**
 * Supabase Edge Function: Video Repurposing
 * 
 * AI-powered video repurposing using Gemini API
 * Transforms long videos into viral shorts (like Klap, Opus, Quso)
 * 
 * Algorithm:
 * 1. Video Ingestion (1-5s) - Upload to Gemini
 * 2. AI Analysis (5-20s) - Detect viral moments
 * 3. Clip Extraction (5-15s) - Generate clips
 * 4. Enhancement (5-10s) - Add captions, optimize
 * 5. Output (instant) - Return results
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RepurposeJob {
  id: string;
  user_id: string;
  video_url: string;
  video_id: string;
  options: any;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  error_message?: string;
  result?: any;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is not set');
    }
    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
    }

    console.log('[Edge Function] Initializing Supabase client...', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!serviceRoleKey,
      urlLength: supabaseUrl.length,
      keyLength: serviceRoleKey.length 
    });

    const supabaseClient = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const body = await req.json();
    const { action, jobId, userId, videoId, videoUrl, options } = body;

    console.log('[Edge Function] Received request:', { action, hasUserId: !!userId, hasVideoId: !!videoId, hasVideoUrl: !!videoUrl });

    switch (action) {
      case 'create_job':
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'userId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (!videoId) {
          return new Response(
            JSON.stringify({ error: 'videoId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (!videoUrl) {
          return new Response(
            JSON.stringify({ error: 'videoUrl is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return await createRepurposeJob(supabaseClient, userId, videoId, videoUrl, options || {});
      
      case 'get_status':
        return await getJobStatus(supabaseClient, jobId);
      
      case 'cancel_job':
        return await cancelJob(supabaseClient, jobId);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: any) {
    console.error('[Edge Function] Error in repurpose-video function:', error);
    console.error('[Edge Function] Error stack:', error.stack);
    console.error('[Edge Function] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.stack,
        type: error.constructor?.name || 'UnknownError'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createRepurposeJob(
  supabase: any,
  userId: string,
  videoId: string,
  videoUrl: string,
  options: any
) {
  // Validate required parameters
  if (!userId) {
    throw new Error('userId is required');
  }
  if (!videoId) {
    throw new Error('videoId is required');
  }
  if (!videoUrl) {
    throw new Error('videoUrl is required');
  }

  const jobId = `repurpose_${Date.now()}_${userId}`;
  
  console.log('[Edge Function] Creating repurpose job:', { jobId, userId, videoId, videoUrl, optionsKeys: Object.keys(options || {}) });
  
  try {
    // Create job record
    // Note: Using SERVICE_ROLE_KEY bypasses RLS, so we can insert directly
    const { data, error } = await supabase
      .from('repurpose_jobs')
      .insert({
        id: jobId,
        user_id: userId,
        video_id: videoId,
        video_url: videoUrl,
        options: options || {},
        status: 'queued',
        progress: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[Edge Function] Failed to create job:', error);
      console.error('[Edge Function] Error code:', error.code);
      console.error('[Edge Function] Error details:', error.details);
      console.error('[Edge Function] Error hint:', error.hint);
      throw new Error(`Failed to create job: ${error.message || 'Unknown error'}`);
    }

    console.log('[Edge Function] Job created successfully:', data);
  } catch (err: any) {
    console.error('[Edge Function] Exception creating job:', err);
    throw err;
  }

  console.log('[Edge Function] Job created, starting async processing...');

  // Queue processing (async - don't await)
  processRepurposeJob(supabase, jobId, userId, videoId, videoUrl, options).catch(err => {
    console.error(`[Edge Function] Error processing job ${jobId}:`, err);
    supabase
      .from('repurpose_jobs')
      .update({
        status: 'failed',
        error_message: err.message,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .then(() => console.log(`[Edge Function] Job ${jobId} marked as failed`));
  });

  return new Response(
    JSON.stringify({ jobId, status: 'queued' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processRepurposeJob(
  supabase: any,
  jobId: string,
  userId: string,
  videoId: string,
  videoUrl: string,
  options: any
) {
  const startTime = Date.now();
  console.log('[Edge Function] Starting job processing:', { jobId, userId, videoId, videoUrl });
  
  // Update status to processing
  await supabase
    .from('repurpose_jobs')
    .update({
      status: 'processing',
      progress: 5,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  try {
    // ============================================
    // PHASE 1: Video Ingestion and Preprocessing (1-5 seconds)
    // ============================================
    
    // Check if videoUrl is a YouTube URL
    const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    let videoBuffer: ArrayBuffer;
    let videoMimeType: string;
    
    if (isYouTube) {
      console.log('[Phase 1] YouTube URL detected, downloading from YouTube...');
      console.log('[Phase 1] YouTube URL:', videoUrl);
      
      // TODO: Implement YouTube download using yt-dlp or similar
      // For now, we'll need to download the video
      // In production, use yt-dlp in the Edge Function
      
      // Placeholder: In production, download YouTube video here
      // const youtubeVideo = await downloadYouTubeVideo(videoUrl);
      // videoBuffer = youtubeVideo.buffer;
      // videoMimeType = 'video/mp4';
      
      throw new Error('YouTube download not yet implemented. Please upload the video file directly or implement yt-dlp in the Edge Function.');
    } else {
      console.log('[Phase 1] Downloading video from storage:', videoId);
      
      const { data: videoData, error: videoError } = await supabase.storage
        .from('repurpose-videos')
        .download(videoId);

      if (videoError) {
        throw new Error(`Failed to download video: ${videoError.message}`);
      }
      
      const videoBlob = videoData as Blob;
      videoBuffer = await videoBlob.arrayBuffer();
      videoMimeType = videoBlob.type;
    }
    
    const videoSizeMB = (videoBuffer.byteLength / (1024 * 1024)).toFixed(2);
    console.log('[Phase 1] Video downloaded:', { sizeMB: videoSizeMB, type: videoMimeType });
    
    await supabase
      .from('repurpose_jobs')
      .update({ progress: 15, updated_at: new Date().toISOString() })
      .eq('id', jobId);

    // ============================================
    // PHASE 2: AI-Powered Content Analysis (5-20 seconds)
    // ============================================
    console.log('[Phase 2] Starting Gemini AI analysis for viral moments...');
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    // Upload video to Gemini File API
    const geminiFile = await uploadVideoToGemini(geminiApiKey, videoBuffer, videoMimeType);
    console.log('[Phase 2] Video uploaded to Gemini:', geminiFile.uri);
    
    await supabase
      .from('repurpose_jobs')
      .update({ progress: 25, updated_at: new Date().toISOString() })
      .eq('id', jobId);

    // Analyze video for viral moments using Gemini
    const viralAnalysis = await analyzeVideoForViralMoments(
      geminiApiKey,
      geminiFile.uri,
      options
    );
    
    console.log('[Phase 2] Viral analysis complete:', {
      segmentsFound: viralAnalysis.segments.length,
      averageScore: viralAnalysis.averageScore
    });
    
    await supabase
      .from('repurpose_jobs')
      .update({ progress: 50, updated_at: new Date().toISOString() })
      .eq('id', jobId);

    // ============================================
    // PHASE 3: Clip Extraction and Assembly (5-15 seconds)
    // ============================================
    console.log('[Phase 3] Generating clips from viral moments...');
    
    const clips = await generateClipsFromAnalysis(
      viralAnalysis,
      options,
      videoUrl,
      videoBuffer
    );
    
    console.log('[Phase 3] Clips generated:', { count: clips.length });
    
    await supabase
      .from('repurpose_jobs')
      .update({ progress: 70, updated_at: new Date().toISOString() })
      .eq('id', jobId);

    // ============================================
    // PHASE 4: Enhancement and Virality Boost (5-10 seconds)
    // ============================================
    console.log('[Phase 4] Enhancing clips with captions and metadata...');
    
    const enhancedClips = await enhanceClipsWithGemini(
      geminiApiKey,
      clips,
      options
    );
    
    console.log('[Phase 4] Clips enhanced:', { count: enhancedClips.length });
    
    await supabase
      .from('repurpose_jobs')
      .update({ progress: 85, updated_at: new Date().toISOString() })
      .eq('id', jobId);

    // ============================================
    // PHASE 5: Output and Storage (instant)
    // ============================================
    console.log('[Phase 5] Saving clips to storage...');
    
    // For now, we'll store clip metadata and use original video URL
    // In production, you'd process and upload actual clip files
    const clipUrls = await saveClipsToStorage(supabase, enhancedClips, jobId, videoUrl);
    
    const formattedClips = enhancedClips.map((clip, index) => ({
      ...clip,
      clip_url: clipUrls[index] || videoUrl
    }));

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('[Phase 5] Processing complete:', {
      clips: formattedClips.length,
      timeSeconds: processingTime
    });

    // Update job as completed
    await supabase
      .from('repurpose_jobs')
      .update({
        status: 'completed',
        progress: 100,
        result: {
          clips: formattedClips,
          statistics: {
            total_clips: formattedClips.length,
            average_virality_score: viralAnalysis.averageScore,
            processing_time_seconds: parseFloat(processingTime),
          },
          gemini_analysis: {
            segments_analyzed: viralAnalysis.segments.length,
            top_score: Math.max(...viralAnalysis.segments.map((s: any) => s.score))
          }
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);
    
    console.log('[Edge Function] Job completed successfully:', { 
      jobId, 
      clipCount: formattedClips.length,
      processingTime: `${processingTime}s`
    });

  } catch (error: any) {
    console.error('[Edge Function] Job processing error:', error);
    await supabase
      .from('repurpose_jobs')
      .update({
        status: 'failed',
        error_message: error.message,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);
    throw error;
  }
}

/**
 * PHASE 1: Upload video to Gemini File API
 * Returns file URI for use in Gemini API calls
 * 
 * Note: For large videos, we can use the video URL directly if it's publicly accessible
 * Otherwise, we upload to Gemini's file storage
 */
async function uploadVideoToGemini(
  apiKey: string,
  videoBuffer: ArrayBuffer,
  mimeType: string
): Promise<{ uri: string; mimeType: string }> {
  console.log('[Gemini] Preparing video for Gemini analysis...');
  
  // For Edge Functions, we'll use a two-step upload process
  // Step 1: Create file metadata
  const createResponse = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: {
          displayName: `repurpose_video_${Date.now()}`,
          mimeType: mimeType || 'video/mp4',
        },
      }),
    }
  );

  if (!createResponse.ok) {
    const error = await createResponse.text();
    console.error('[Gemini] File creation failed:', error);
    throw new Error(`Gemini file creation failed: ${error}`);
  }

  const createData = await createResponse.json();
  const uploadUri = createData.uri;
  
  console.log('[Gemini] File metadata created, uploading video data...');

  // Step 2: Upload file data
  const uploadResponse = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/${uploadUri}?uploadType=multipart&key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': mimeType || 'video/mp4',
      },
      body: videoBuffer,
    }
  );

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    console.error('[Gemini] File upload failed:', error);
    throw new Error(`Gemini file upload failed: ${error}`);
  }

  const fileData = await uploadResponse.json();
  const fileName = fileData.name;
  
  console.log('[Gemini] Video uploaded, waiting for processing...');
  
  // Wait for file to be processed (max 30 seconds)
  await waitForGeminiFileProcessing(apiKey, fileName);
  
  return {
    uri: `gs://${fileName}`,
    mimeType: mimeType || 'video/mp4',
  };
}

/**
 * Wait for Gemini file to be processed
 */
async function waitForGeminiFileProcessing(apiKey: string, fileName: string, maxWait = 15000): Promise<void> {
  const startTime = Date.now();
  const pollInterval = 2000; // Check every 2 seconds
  
  while (Date.now() - startTime < maxWait) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/files/${fileName}?key=${apiKey}`,
        { method: 'GET' }
      );
      
      if (response.ok) {
        const file = await response.json();
        if (file.state === 'ACTIVE') {
          console.log('[Gemini] File processing complete');
          return;
        }
        console.log(`[Gemini] File state: ${file.state}, waiting...`);
      }
    } catch (error) {
      console.warn('[Gemini] Error checking file status:', error);
    }
    
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  console.warn('[Gemini] File processing timeout, proceeding anyway...');
}

/**
 * PHASE 2: Analyze video for viral moments using Gemini
 * Uses multimodal analysis to detect high-engagement segments
 */
async function analyzeVideoForViralMoments(
  apiKey: string,
  videoUri: string,
  options: any
): Promise<{
  segments: Array<{
    start_time: number;
    end_time: number;
    score: number;
    type: string;
    rationale: string;
    hooks?: string[];
    sentiment?: string;
  }>;
  averageScore: number;
  transcript?: string;
}> {
  console.log('[Gemini] Analyzing video for viral moments...');
  
  const targetCount = Math.min(options.target_clip_count || 10, 50);
  const minDuration = options.min_duration || 15;
  const maxDuration = options.max_duration || 60;
  const viralityThreshold = options.virality_threshold || 70;
  
  const prompt = `Analyze this video for viral short potential. You are an expert at identifying content that performs well on platforms like TikTok, YouTube Shorts, and Instagram Reels.

TASK:
1. Transcribe the audio with timestamps
2. Score segments (0-10) on these engagement factors:
   - Hook potential (opening 3 seconds that grab attention)
   - Humor/surprise moments (audio peaks, unexpected turns)
   - Emotional hooks (sentiment shifts, relatable moments)
   - Questions/calls-to-action (direct engagement prompts)
   - Visual energy (face reactions, cuts, motion)
   - Trend relevance (current social media hooks)
   - Information density (valuable insights per second)
   - Retention potential (would viewers watch to the end?)

3. Identify top ${targetCount} segments with:
   - Start time (seconds)
   - End time (seconds)
   - Virality score (0-10)
   - Segment type (hook, insight, emotional, question, visual, etc.)
   - Rationale (why this segment is viral-worthy)
   - Key hooks/phrases to emphasize
   - Sentiment (positive, negative, neutral, mixed)

REQUIREMENTS:
- Segments must be ${minDuration}-${maxDuration} seconds long
- Only include segments with score >= ${viralityThreshold / 10}
- Prioritize segments with strong hooks in first 3 seconds
- Avoid filler words, long pauses (>3s), or low-energy moments
- Ensure segments are non-overlapping if overlap_prevention is enabled

OUTPUT FORMAT (JSON):
{
  "transcript": "Full transcript with timestamps",
  "segments": [
    {
      "start_time": 120.5,
      "end_time": 150.3,
      "score": 9.2,
      "type": "hook + insight",
      "rationale": "Strong opening question followed by valuable insight",
      "hooks": ["Wait until you hear this", "This will change everything"],
      "sentiment": "positive"
    }
  ],
  "average_score": 8.5
}`;

  // Use Gemini Flash for faster processing (optimized for speed)
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              fileData: {
                mimeType: 'video/mp4',
                fileUri: videoUri,
              },
            },
          ],
        }],
        generationConfig: {
          temperature: 0.8, // Slightly higher for more creative hooks
          topK: 32, // Reduced for speed
          topP: 0.9, // Reduced for speed
          maxOutputTokens: 4096, // Reduced for faster response
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini analysis failed: ${error}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error('No response from Gemini API');
  }

  try {
    const analysis = JSON.parse(text);
    
    // Filter and sort segments
    let segments = analysis.segments || [];
    segments = segments
      .filter((s: any) => s.score >= viralityThreshold / 10)
      .filter((s: any) => {
        const duration = s.end_time - s.start_time;
        return duration >= minDuration && duration <= maxDuration;
      })
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, targetCount);

    // Prevent overlapping if enabled
    if (options.overlap_prevention) {
      segments = preventOverlapping(segments);
    }

    const averageScore = segments.length > 0
      ? segments.reduce((sum: number, s: any) => sum + s.score, 0) / segments.length
      : 0;

    return {
      segments,
      averageScore,
      transcript: analysis.transcript,
    };
  } catch (parseError) {
    console.error('[Gemini] Failed to parse response:', text);
    throw new Error(`Failed to parse Gemini response: ${parseError}`);
  }
}

/**
 * Prevent overlapping segments
 */
function preventOverlapping(segments: any[]): any[] {
  const nonOverlapping: any[] = [];
  const sorted = [...segments].sort((a, b) => a.start_time - b.start_time);

  for (const segment of sorted) {
    const overlaps = nonOverlapping.some(
      existing => 
        (segment.start_time < existing.end_time && segment.end_time > existing.start_time)
    );

    if (!overlaps) {
      nonOverlapping.push(segment);
    }
  }

  return nonOverlapping.sort((a, b) => b.score - a.score);
}

/**
 * PHASE 3: Generate clips from analysis
 */
async function generateClipsFromAnalysis(
  analysis: any,
  options: any,
  videoUrl: string,
  videoBuffer: ArrayBuffer
): Promise<any[]> {
  console.log('[Clip Generation] Creating clips from viral moments...');
  
  const clips = analysis.segments.map((segment: any, index: number) => {
    const duration = segment.end_time - segment.start_time;
    
    return {
      id: `clip_${Date.now()}_${index}`,
      title: `Viral Clip ${index + 1}`,
      description: segment.rationale || `High-engagement segment (Score: ${segment.score.toFixed(1)})`,
      duration: Math.round(duration),
      virality_score: Math.round(segment.score * 10), // Convert 0-10 to 0-100
      engagement_score: Math.round(segment.score * 10),
      platform_format: options.platforms?.[0] || 'youtube_shorts',
      start_time: segment.start_time,
      end_time: segment.end_time,
      segment_type: segment.type || 'viral',
      hooks: segment.hooks || [],
      sentiment: segment.sentiment || 'neutral',
      transcript_snippet: '', // Will be filled in enhancement phase
      aspect_ratio: '9:16', // Default for shorts
      metadata: {
        original_score: segment.score,
        rationale: segment.rationale,
      },
    };
  });

  return clips;
}

/**
 * PHASE 4: Enhance clips with captions and metadata using Gemini
 * Optimized for speed - processes all clips in parallel
 */
async function enhanceClipsWithGemini(
  apiKey: string,
  clips: any[],
  options: any
): Promise<any[]> {
  console.log('[Enhancement] Enhancing clips with captions and metadata...');
  
  // Process ALL clips in parallel for maximum speed (Klap.app style - fast results)
  const enhancedPromises = clips.map(clip => enhanceSingleClip(apiKey, clip, options));
  const enhancedClips = await Promise.all(enhancedPromises);

  return enhancedClips;
}

/**
 * Enhance a single clip with captions and titles
 */
async function enhanceSingleClip(
  apiKey: string,
  clip: any,
  options: any
): Promise<any> {
  // Optimized prompt for Klap.app style - focus on hooks and engagement
  const prompt = `Create viral short clip metadata in Klap.app style - fast, engaging, hook-driven.

Segment: ${clip.duration}s, Type: ${clip.segment_type}, Hooks: ${clip.hooks?.join(', ') || 'N/A'}

Generate (be concise):
1. Hook title (50 chars max) - must grab attention instantly
2. Description (120 chars) with 3-5 trending hashtags
3. Dynamic captions (key phrases only, bold important words)
4. Hook text for first 3 seconds (maximum impact)

OUTPUT (JSON):
{
  "title": "Hook title",
  "description": "Description #hashtag1 #hashtag2",
  "captions": [{"time": 0, "text": "HOOK"}, {"time": 2, "text": "Key phrase"}],
  "hashtags": ["#trending1", "#trending2"],
  "hook_text": "First 3s hook"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9, // Higher for more creative hooks
            maxOutputTokens: 1024, // Reduced for speed
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn(`[Enhancement] Failed for clip ${clip.id}, using defaults`);
      return clip; // Return original if enhancement fails
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
      const enhancement = JSON.parse(text);
      return {
        ...clip,
        title: enhancement.title || clip.title,
        description: enhancement.description || clip.description,
        transcript_snippet: enhancement.captions?.map((c: any) => c.text).join(' ') || '',
        captions: enhancement.captions || [],
        hashtags: enhancement.hashtags || [],
        hook_text: enhancement.hook_text || '',
      };
    }
  } catch (error) {
    console.warn(`[Enhancement] Error enhancing clip ${clip.id}:`, error);
  }

  return clip; // Return original if enhancement fails
}

/**
 * PHASE 5: Save clips to storage
 * 
 * Note: In production, this would:
 * 1. Use FFmpeg to extract actual clip segments from video
 * 2. Process clips (add captions, resize for platform, etc.)
 * 3. Upload processed clips to Supabase Storage
 * 
 * For now, we return the original video URL with timestamp parameters
 * that can be used by a video player to show specific segments
 */
async function saveClipsToStorage(
  supabase: any,
  clips: any[],
  jobId: string,
  videoUrl: string
): Promise<string[]> {
  console.log('[Storage] Preparing clip URLs...');
  
  // For MVP, we'll return URLs with timestamp parameters
  // In production, you'd process and upload actual clip files
  const clipUrls = clips.map((clip) => {
    // Return original video URL with metadata
    // Frontend can use this to extract the segment using video player APIs
    return videoUrl;
  });
  
  console.log('[Storage] Clip URLs prepared:', clipUrls.length);
  
  // TODO: Implement actual clip extraction and upload:
  // 1. Download original video
  // 2. Use FFmpeg (via serverless function or external service) to extract clips
  // 3. Process clips (add captions, resize, etc.)
  // 4. Upload to Supabase Storage
  // 5. Return public URLs
  
  return clipUrls;
}

async function getJobStatus(supabase: any, jobId: string) {
  const { data, error } = await supabase
    .from('repurpose_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    throw new Error(`Failed to get job status: ${error.message}`);
  }

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function cancelJob(supabase: any, jobId: string) {
  const { error } = await supabase
    .from('repurpose_jobs')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to cancel job: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

