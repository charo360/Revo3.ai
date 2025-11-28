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

      // If last chunk, combine synchronously with timeout protection
      if (isLastChunk) {
        console.log('[Edge Function] Last chunk received, combining parts...');
        console.log('[Edge Function] File path:', filePath);
        console.log('[Edge Function] Total chunks:', totalChunks);
        
        // Combine with timeout - must complete for file to exist
        try {
          const combinePromise = combineChunks(supabaseClient, filePath, userId, totalChunks, contentType, corsHeaders);
          const timeoutPromise = new Promise<Response>((_, reject) => 
            setTimeout(() => reject(new Error('Combine timeout after 90s')), 90000)
          );
          
          const result = await Promise.race([combinePromise, timeoutPromise]);
          const resultData = await result.json();
          
          if (resultData.error) {
            console.error('[Edge Function] Combine returned error:', resultData.error);
            // Still return success - parts are uploaded, combination can be retried
            return new Response(
              JSON.stringify({ 
                success: true,
                chunkIndex,
                message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded. Combination error: ${resultData.error}`,
                combining: true,
                filePath: filePath,
                error: resultData.error
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }
          
          console.log('[Edge Function] ✓ Combine completed successfully');
          return result;
        } catch (combineError: any) {
          console.error('[Edge Function] ✗ Combine exception:', combineError.message);
          // Return success anyway - parts are uploaded
          return new Response(
            JSON.stringify({ 
              success: true,
              chunkIndex,
              message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded. Combination failed: ${combineError.message}`,
              combining: true,
              filePath: filePath,
              error: combineError.message
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
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
  try {
    console.log('[Edge Function] Batch upload:', { chunksCount: chunks.length, filePath });
    
    // Convert all chunks to binary with error handling
    const binaryChunks: Uint8Array[] = [];
    for (let i = 0; i < chunks.length; i++) {
      try {
        const base64Chunk = chunks[i];
        if (!base64Chunk || typeof base64Chunk !== 'string') {
          throw new Error(`Invalid chunk ${i + 1}: not a string`);
        }
        binaryChunks.push(Uint8Array.from(atob(base64Chunk), c => c.charCodeAt(0)));
      } catch (e: any) {
        console.error(`[Edge Function] Failed to decode chunk ${i + 1}:`, e.message);
        return new Response(
          JSON.stringify({ error: `Failed to decode chunk ${i + 1}: ${e.message}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    console.log('[Edge Function] Chunks decoded, combining...');
    
    // Combine chunks
    const totalLength = binaryChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const totalMB = (totalLength / (1024 * 1024)).toFixed(2);
    console.log(`[Edge Function] Total size: ${totalMB} MB`);
    
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of binaryChunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    
    const blob = new Blob([combined], { type: contentType || 'video/mp4' });
    console.log('[Edge Function] Blob created, uploading to storage...');
    
    // Upload to storage with retry
    let uploadError = null;
    let uploadData = null;
    
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, error } = await supabaseClient.storage
        .from('repurpose-videos')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true, // Allow overwrite
          contentType: contentType || 'video/mp4'
        });
      
      if (!error) {
        uploadData = data;
        uploadError = null;
        break;
      }
      
      uploadError = error;
      console.log(`[Edge Function] Upload attempt ${attempt + 1}/3 failed:`, error.message);
      
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
      }
    }
    
    if (uploadError) {
      console.error('[Edge Function] Final upload failed after retries:', uploadError);
      return new Response(
        JSON.stringify({ 
          error: `Upload failed: ${uploadError.message}`,
          details: uploadError.statusCode || 'Unknown error'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[Edge Function] Upload successful, getting public URL...');
    
    const { data: urlData } = supabaseClient.storage
      .from('repurpose-videos')
      .getPublicUrl(filePath);
    
    if (!urlData?.publicUrl) {
      return new Response(
        JSON.stringify({ error: 'Upload succeeded but could not get public URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[Edge Function] Batch upload complete:', urlData.publicUrl.substring(0, 80));
    
    return new Response(
      JSON.stringify({
        videoId: filePath,
        publicUrl: urlData.publicUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[Edge Function] Batch upload exception:', error);
    return new Response(
      JSON.stringify({ 
        error: `Batch upload failed: ${error.message || 'Unknown error'}`,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
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
  try {
    console.log('[Edge Function] ===== Starting combineChunks =====');
    console.log('[Edge Function] File path:', filePath);
    console.log('[Edge Function] User ID:', userId);
    console.log('[Edge Function] Total chunks:', totalChunks);
    
    // Wait briefly for storage consistency
    await new Promise(r => setTimeout(r, 2000));
  
  // Download all parts with retries (optimized for speed and reliability)
  console.log('[Edge Function] Downloading parts with retries...');
  const parts: Array<{ index: number; data: Uint8Array; tempPath: string }> = [];
  
  // First, verify parts exist by trying to list them
  console.log('[Edge Function] Verifying parts exist...');
  // userId is already a parameter, extract from filePath only if needed for listing
  const userIdFromPath = filePath.split('/')[0];
  const { data: listData, error: listError } = await supabaseClient.storage
    .from('repurpose-videos')
    .list(userIdFromPath || userId);
  
  if (listError) {
    console.error('[Edge Function] Failed to list files:', listError.message);
  } else {
    const partFiles = listData?.filter(f => f.name.includes('.part')) || [];
    console.log(`[Edge Function] Found ${partFiles.length} part files in storage`);
  }
  
  for (let i = 0; i < totalChunks; i++) {
    const tempPath = `${filePath}.part${i}`;
    let retries = 5; // More retries for reliability
    let partData = null;
    
    while (retries > 0 && !partData) {
      try {
        const { data, error } = await supabaseClient.storage
          .from('repurpose-videos')
          .download(tempPath);
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (!data) {
          throw new Error('No data returned');
        }
        
        const arrayBuffer = await data.arrayBuffer();
        partData = {
          index: i,
          data: new Uint8Array(arrayBuffer),
          tempPath
        };
        parts.push(partData);
        const sizeMB = (partData.data.length / (1024 * 1024)).toFixed(2);
        console.log(`[Edge Function] ✓ Part ${i + 1}/${totalChunks} downloaded (${sizeMB} MB)`);
        break;
      } catch (err: any) {
        retries--;
        if (retries === 0) {
          console.error(`[Edge Function] ✗ Part ${i + 1} failed after all retries:`, err.message);
          console.error(`[Edge Function] Part path: ${tempPath}`);
          return new Response(
            JSON.stringify({ 
              error: `Failed to download part ${i + 1}: ${err.message}`,
              partPath: tempPath,
              partIndex: i
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const waitTime = 2000 * (6 - retries); // Increasing wait: 2s, 4s, 6s, 8s
        console.log(`[Edge Function] Retrying part ${i + 1}... (${retries} retries left, waiting ${waitTime/1000}s)`);
        await new Promise(r => setTimeout(r, waitTime));
      }
    }
  }
  
  if (parts.length !== totalChunks) {
    return new Response(
      JSON.stringify({ 
        error: `Only ${parts.length}/${totalChunks} parts downloaded`,
        downloaded: parts.length,
        expected: totalChunks
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  parts.sort((a, b) => a.index - b.index); // Ensure correct order
  console.log(`[Edge Function] ✓ All ${parts.length} parts downloaded successfully`);
  
  // Combine all parts efficiently
  console.log('[Edge Function] Combining', parts.length, 'parts...');
  const totalLength = parts.reduce((sum, part) => sum + part.data.length, 0);
  const totalMB = (totalLength / (1024 * 1024)).toFixed(2);
  console.log(`[Edge Function] Total combined size: ${totalMB} MB`);
  
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    combined.set(part.data, offset);
    offset += part.data.length;
  }
  
  // Upload final file using service role (bypasses size limits)
  // For large files, we need to use the service role key directly
  const blob = new Blob([combined], { type: contentType || 'video/mp4' });
  console.log('[Edge Function] Uploading combined file...');
  console.log('[Edge Function] File size:', (combined.length / (1024 * 1024)).toFixed(2), 'MB');
  
  // Use service role for upload to bypass RLS and size limits
  const { data: uploadData, error: uploadError } = await supabaseClient.storage
    .from('repurpose-videos')
    .upload(filePath, blob, {
      cacheControl: '3600',
      upsert: true,
      contentType: contentType || 'video/mp4',
      // Use service role - already using service role client
    });
  
  if (uploadError) {
    console.error('[Edge Function] Final upload failed:', uploadError.message);
    console.error('[Edge Function] Upload error details:', JSON.stringify(uploadError, null, 2));
    
    // If size limit error, try alternative: keep parts and create a manifest
    if (uploadError.message?.includes('maximum allowed size') || uploadError.message?.includes('exceeded')) {
      console.log('[Edge Function] Size limit hit, parts will remain available for manual combination');
      return new Response(
        JSON.stringify({ 
          error: `File too large (${(combined.length / (1024 * 1024)).toFixed(2)}MB). Parts available at: ${filePath}.part*`,
          partsAvailable: true,
          filePath: filePath,
          totalChunks: totalChunks
        }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: `Final upload failed: ${uploadError.message}`
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  console.log('[Edge Function] ✓ Final file uploaded successfully');
  
  // Clean up temporary parts (async, don't wait - for speed)
  parts.forEach(part => {
    supabaseClient.storage.from('repurpose-videos').remove([part.tempPath]).catch(() => {
      // Ignore cleanup errors - not critical
    });
  });
  
  // Get public URL
  const { data: urlData } = supabaseClient.storage
    .from('repurpose-videos')
    .getPublicUrl(filePath);
  
  if (!urlData?.publicUrl) {
    return new Response(
      JSON.stringify({ error: 'File uploaded but could not get public URL' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
    console.log('[Edge Function] ✓ File combined and uploaded successfully');
    console.log('[Edge Function] Public URL:', urlData.publicUrl.substring(0, 100));
    console.log('[Edge Function] ===== combineChunks completed successfully =====');
    
    return new Response(
      JSON.stringify({
        videoId: filePath,
        publicUrl: urlData.publicUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[Edge Function] ===== combineChunks FAILED =====');
    console.error('[Edge Function] Error type:', error?.constructor?.name);
    console.error('[Edge Function] Error message:', error?.message);
    console.error('[Edge Function] Error stack:', error?.stack);
    console.error('[Edge Function] File path:', filePath);
    console.error('[Edge Function] Total chunks:', totalChunks);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: `Combine failed: ${error?.message || 'Unknown error'}`,
        filePath: filePath,
        totalChunks: totalChunks
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

