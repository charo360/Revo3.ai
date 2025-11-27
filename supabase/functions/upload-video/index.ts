/**
 * Supabase Edge Function: Upload Large Video
 * 
 * Handles large file uploads that exceed Supabase Storage's 50MB limit
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Parse request
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('[Edge Function] JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { filePath, userId, chunks, fileName, contentType, chunkIndex, totalChunks, isLastChunk } = body;

    // Support both batch and parallel chunk uploads
    if (chunks && Array.isArray(chunks) && chunks.length > 0 && chunkIndex === undefined) {
      // Batch upload (all chunks at once) - for smaller files
      return await handleBatchUpload(supabaseClient, filePath, userId, chunks, fileName, contentType, corsHeaders);
    }
    
    // Parallel chunk upload (one chunk per request)
    if (chunkIndex === undefined || totalChunks === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: chunkIndex, totalChunks, or chunks array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const chunkData = chunks && chunks.length > 0 ? chunks[0] : body.chunk;
    if (!chunkData) {
      return new Response(
        JSON.stringify({ error: 'Missing chunk data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Edge Function] Processing chunk ${chunkIndex + 1}/${totalChunks} for ${filePath}`);

    // Decode base64 chunk with error handling
    let binaryChunk: Uint8Array;
    try {
      binaryChunk = Uint8Array.from(atob(chunkData), c => c.charCodeAt(0));
    } catch (e) {
      return new Response(
        JSON.stringify({ error: `Failed to decode chunk ${chunkIndex + 1}: ${e.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const blob = new Blob([binaryChunk], { type: contentType || 'video/mp4' });
    const tempPath = `${filePath}.part${chunkIndex}`;
    
    try {
      // Upload chunk part
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('repurpose-videos')
        .upload(tempPath, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: contentType || 'video/mp4'
        });
      
      if (uploadError) {
        console.error('[Edge Function] Chunk upload error:', uploadError);
        // If file already exists (upsert), that's okay
        if (uploadError.message?.includes('already exists') || uploadError.statusCode === '23505') {
          console.log('[Edge Function] Chunk already exists, continuing...');
        } else {
          return new Response(
            JSON.stringify({ error: `Chunk ${chunkIndex + 1} upload failed: ${uploadError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // If last chunk, combine immediately
      if (isLastChunk) {
        console.log('[Edge Function] Last chunk received, combining parts...');
        return await combineChunks(supabaseClient, filePath, userId, totalChunks, contentType, corsHeaders);
      }

      // Return success for intermediate chunks
      return new Response(
        JSON.stringify({ 
          success: true, 
          chunkIndex,
          message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded successfully`
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (uploadError: any) {
      console.error('[Edge Function] Upload exception:', uploadError);
      return new Response(
        JSON.stringify({ 
          error: `Chunk upload failed: ${uploadError.message || 'Unknown error'}`,
          chunkIndex,
          details: uploadError.stack
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('[Edge Function] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Handle batch upload (all chunks at once - for smaller files)
async function handleBatchUpload(
  supabaseClient: any,
  filePath: string,
  userId: string,
  chunks: string[],
  fileName: string,
  contentType: string,
  corsHeaders: any
): Promise<Response> {
  console.log('[Edge Function] Batch upload:', { chunksCount: chunks.length });
  
  // Convert all chunks to binary
  const binaryChunks: Uint8Array[] = [];
  for (const base64Chunk of chunks) {
    binaryChunks.push(Uint8Array.from(atob(base64Chunk), c => c.charCodeAt(0)));
  }
  
  // Combine chunks
  const totalLength = binaryChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of binaryChunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }
  
  const blob = new Blob([combined], { type: contentType || 'video/mp4' });
  
  // Upload to storage
  const { data, error } = await supabaseClient.storage
    .from('repurpose-videos')
    .upload(filePath, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: contentType || 'video/mp4'
    });
  
  if (error) {
    return new Response(
      JSON.stringify({ error: `Upload failed: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const { data: urlData } = supabaseClient.storage
    .from('repurpose-videos')
    .getPublicUrl(filePath);
  
  return new Response(
    JSON.stringify({
      videoId: filePath,
      publicUrl: urlData.publicUrl
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Combine all chunk parts into final file (with retry and error handling)
async function combineChunks(
  supabaseClient: any,
  filePath: string,
  userId: string,
  totalChunks: number,
  contentType: string,
  corsHeaders: any
): Promise<Response> {
  console.log('[Edge Function] Combining', totalChunks, 'chunks into final file...');
  
  // Wait a bit to ensure all chunks are written
  await new Promise(r => setTimeout(r, 2000));
  
  // Download all parts in parallel (load balancing: parallel I/O)
  const downloadPromises = [];
  for (let i = 0; i < totalChunks; i++) {
    const tempPath = `${filePath}.part${i}`;
    downloadPromises.push(
      supabaseClient.storage
        .from('repurpose-videos')
        .download(tempPath)
        .then(({ data, error }: any) => {
          if (error) throw new Error(`Part ${i + 1}: ${error.message}`);
          return data.arrayBuffer().then((ab: ArrayBuffer) => ({
            index: i,
            data: new Uint8Array(ab),
            tempPath
          }));
        })
    );
  }
  
  let parts: Array<{ index: number; data: Uint8Array; tempPath: string }>;
  try {
    parts = await Promise.all(downloadPromises);
    parts.sort((a, b) => a.index - b.index); // Ensure correct order
  } catch (err: any) {
    console.error('[Edge Function] Failed to download parts:', err);
    return new Response(
      JSON.stringify({ error: `Failed to download parts: ${err.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Combine all parts efficiently
  const totalLength = parts.reduce((sum, part) => sum + part.data.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    combined.set(part.data, offset);
    offset += part.data.length;
  }
  
  // Upload final file with retry
  const blob = new Blob([combined], { type: contentType || 'video/mp4' });
  let uploadError = null;
  
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabaseClient.storage
      .from('repurpose-videos')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: contentType || 'video/mp4'
      });
    
    if (!error) {
      uploadError = null;
      break;
    }
    
    uploadError = error;
    if (attempt < 2) {
      console.log(`[Edge Function] Retry ${attempt + 1}/3 for final upload...`);
      await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  
  if (uploadError) {
    return new Response(
      JSON.stringify({ error: `Final upload failed: ${uploadError.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Clean up temporary parts (async, don't wait)
  const cleanupPromises = parts.map(part =>
    supabaseClient.storage.from('repurpose-videos').remove([part.tempPath]).catch(() => {})
  );
  Promise.all(cleanupPromises).then(() => {
    console.log('[Edge Function] Temporary parts cleaned up');
  });
  
  // Get public URL
  const { data: urlData } = supabaseClient.storage
    .from('repurpose-videos')
    .getPublicUrl(filePath);
  
  console.log('[Edge Function] File combined and uploaded successfully');
  
  return new Response(
    JSON.stringify({
      videoId: filePath,
      publicUrl: urlData.publicUrl
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

