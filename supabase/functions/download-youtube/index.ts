/**
 * Supabase Edge Function: Download YouTube Video
 * 
 * Downloads YouTube videos server-side to bypass CORS restrictions
 * Uses yt-dlp or similar service to download videos
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { youtubeUrl } = await req.json();

    if (!youtubeUrl) {
      return new Response(
        JSON.stringify({ error: 'youtubeUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[YouTube Download] Downloading video:', youtubeUrl);

    // Use a YouTube download API service
    // Option 1: Use yt-dlp via a service (like RapidAPI)
    // Option 2: Use a public YouTube download API
    // Option 3: Use yt-dlp directly if available in Deno
    
    // For now, we'll use a public YouTube download API
    // In production, you'd want to use yt-dlp or a more reliable service
    const downloadApiUrl = `https://www.youtube.com/watch?v=${extractVideoId(youtubeUrl)}`;
    
    // Try to get video download URL using YouTube's API or a download service
    // Note: This is a simplified approach - in production use yt-dlp
    
    // For testing, we'll return a message indicating the video needs to be downloaded
    // In production, implement actual download logic here
    
    return new Response(
      JSON.stringify({
        message: 'YouTube download requires yt-dlp implementation',
        videoId: extractVideoId(youtubeUrl),
        note: 'For production, implement yt-dlp in this Edge Function to download videos'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[YouTube Download] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractVideoId(url: string): string {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : '';
}

