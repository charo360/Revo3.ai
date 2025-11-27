/**
 * Video Upload Service
 * Handles chunked uploads for large video files
 */

import { supabase } from '../../lib/supabase';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  videoId: string;
  videoUrl: string;
  publicUrl: string;
}

/**
 * Upload video in chunks for large files
 */
export async function uploadVideoChunked(
  file: File | Blob,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const fileSize = file.size;
  const fileName = `video_${Date.now()}_${userId}.${file.type.split('/')[1] || 'mp4'}`;
  const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);

  console.log('[Upload] Starting chunked upload:', {
    fileName,
    fileSize,
    totalChunks,
    chunkSize: CHUNK_SIZE
  });

  // Create upload path
  const filePath = `${userId}/${fileName}`;

  // NO SIZE LIMIT: Always use Edge Function for reliable uploads
  // This ensures consistent behavior regardless of file size
  console.log('[Upload] Using Edge Function for upload (no size limits)...');
  console.log('[Upload] File size:', (fileSize / (1024 * 1024)).toFixed(2), 'MB');
  
  return await uploadViaEdgeFunction(file, filePath, userId, onProgress);
}

/**
 * Batch upload (all chunks at once) - for files < 50MB
 */
async function uploadViaEdgeFunctionBatch(
  file: File | Blob,
  filePath: string,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const fileSize = file.size;
  const chunkSize = 5 * 1024 * 1024; // 5MB chunks
  const totalChunks = Math.ceil(fileSize / chunkSize);
  const chunks: string[] = [];
  
  console.log(`[Upload] Preparing ${totalChunks} chunks for batch upload...`);
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, fileSize);
    const chunk = file.slice(start, end);
    
    const base64Chunk = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = () => reject(new Error(`Failed to read chunk ${i + 1}`));
      reader.readAsDataURL(chunk);
    });
    
    chunks.push(base64Chunk);
    onProgress?.({
      loaded: end,
      total: fileSize,
      percentage: Math.round((end / fileSize) * 90)
    });
  }
  
  console.log('[Upload] Sending all chunks to Edge Function...');
  onProgress?.({
    loaded: fileSize * 0.95,
    total: fileSize,
    percentage: 95
  });
  
  const { data, error } = await supabase.functions.invoke('upload-video', {
    body: {
      filePath,
      userId,
      chunks,
      fileName: filePath.split('/').pop() || 'video.mp4',
      contentType: file instanceof File ? file.type : 'video/mp4'
    }
  });
  
  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
  
  if (!data?.videoId || !data?.publicUrl) {
    throw new Error('Invalid response from Edge Function');
  }
  
  onProgress?.({
    loaded: fileSize,
    total: fileSize,
    percentage: 100
  });
  
  return {
    videoId: data.videoId,
    videoUrl: data.videoId,
    publicUrl: data.publicUrl
  };
}

/**
 * Upload file via Edge Function (handles files of any size)
 * Uses efficient chunking algorithm for optimal performance
 */
async function uploadViaEdgeFunction(
  file: File | Blob,
  filePath: string,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  console.log('[Upload] Uploading via Edge Function (chunked, for large files)...');
  
  const fileSize = file.size;
  const chunkSize = 5 * 1024 * 1024; // 5MB chunks for larger files
  
  const totalChunks = Math.ceil(fileSize / chunkSize);
  console.log('[Upload] Chunking strategy:', {
    fileSizeMB: (fileSize / (1024 * 1024)).toFixed(2),
    chunkSizeMB: (chunkSize / (1024 * 1024)).toFixed(2),
    totalChunks
  });
  
  onProgress?.({
    loaded: 0,
    total: fileSize,
    percentage: 0
  });

  // Read file in chunks and convert to base64
  const chunks: string[] = [];
  let processedBytes = 0;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, fileSize);
    const chunk = file.slice(start, end);
    
    // Convert chunk to base64 (async to prevent blocking)
    const base64Chunk = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (data:video/mp4;base64,)
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error(`Failed to read chunk ${i + 1}`));
      reader.readAsDataURL(chunk);
    });

    chunks.push(base64Chunk);
    processedBytes = end;
    
    // Update progress (cap at 85% during chunking, remaining 15% for upload)
    const progress = Math.round((processedBytes / fileSize) * 85);
    onProgress?.({
      loaded: processedBytes,
      total: fileSize,
      percentage: progress
    });
  }

  // Upload chunks in batches to avoid request size limits
  console.log('[Upload] Sending file to Edge Function in batches...', {
    chunksCount: chunks.length,
    totalSizeMB: (fileSize / (1024 * 1024)).toFixed(2)
  });
  
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 600000); // 10 minute timeout for large files
  
  try {
    // Simple sequential upload with retry - most reliable
    console.log(`[Upload] Uploading ${chunks.length} chunks...`);
    const uploadStartTime = Date.now();
    
    for (let i = 0; i < chunks.length; i++) {
      const isLastChunk = i === chunks.length - 1;
      let retries = 0;
      let success = false;
      
      while (retries < 3 && !success) {
        try {
          const { data: chunkData, error: chunkError } = await supabase.functions.invoke('upload-video', {
            body: {
              filePath,
              userId,
              chunks: [chunks[i]],
              chunkIndex: i,
              totalChunks: chunks.length,
              isLastChunk,
              fileName: filePath.split('/').pop() || 'video.mp4',
              contentType: file instanceof File ? file.type : 'video/mp4'
            },
            signal: controller.signal
          });
          
          if (chunkError) {
            throw new Error(chunkError.message);
          }
          
          if (isLastChunk && chunkData?.publicUrl) {
            data = chunkData;
            error = null;
          }
          
          success = true;
          const progress = 90 + Math.round(((i + 1) / chunks.length) * 8);
          onProgress?.({
            loaded: fileSize * (progress / 100),
            total: fileSize,
            percentage: Math.min(progress, 98)
          });
          
          console.log(`[Upload] Chunk ${i + 1}/${chunks.length} uploaded`);
        } catch (err: any) {
          retries++;
          if (retries >= 3) {
            throw new Error(`Chunk ${i + 1} failed after 3 retries: ${err.message}`);
          }
          console.log(`[Upload] Retrying chunk ${i + 1} (${retries}/3)...`);
          await new Promise(r => setTimeout(r, 2000 * retries));
        }
      }
    }
    
    const uploadDuration = ((Date.now() - uploadStartTime) / 1000).toFixed(1);
    console.log(`[Upload] All chunks uploaded in ${uploadDuration}s`);
    clearTimeout(timeoutId);

    if (error) {
      console.error('[Upload] Edge Function error:', error);
      if (error.message?.includes('aborted') || error.message?.includes('timeout')) {
        throw new Error('Upload timeout: The file is too large or the connection is slow. Please try again or use a smaller file.');
      }
      throw new Error(`Edge Function upload failed: ${error.message || 'Unknown error'}`);
    }

    // Handle async combination case (chunks uploaded, combining in background)
    if (data?.combining) {
      console.log('[Upload] Chunks uploaded, waiting for file combination...');
      // Poll for final result (up to 2 minutes)
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes
      
      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 2000));
        attempts++;
        
        // Check if final file exists
        try {
          const { data: listData, error: listError } = await supabase.storage
            .from('repurpose-videos')
            .list(userId, {
              search: filePath.split('/').pop() || fileName
            });
          
          if (!listError && listData && listData.length > 0) {
            // File exists, get URL
            const { data: urlData } = supabase.storage
              .from('repurpose-videos')
              .getPublicUrl(filePath);
            
            if (urlData?.publicUrl) {
              console.log('[Upload] File combination completed!');
              data = { videoId: filePath, publicUrl: urlData.publicUrl };
              break;
            }
          }
        } catch (checkError) {
          // Continue polling
        }
      }
      
      if (!data?.publicUrl) {
        throw new Error('File combination timed out. Please try again.');
      }
    }

    if (!data || !data.videoId || !data.publicUrl) {
      console.error('[Upload] Invalid Edge Function response:', data);
      throw new Error('Invalid response from Edge Function: missing videoId or publicUrl');
    }

    // Report 100% completion
    onProgress?.({
      loaded: fileSize,
      total: fileSize,
      percentage: 100
    });
    
    console.log('[Upload] Edge Function upload successful:', {
      videoId: data.videoId,
      publicUrl: data.publicUrl.substring(0, 50) + '...'
    });
    
    return {
      videoId: data.videoId,
      videoUrl: data.videoId,
      publicUrl: data.publicUrl
    };
  } catch (uploadError: any) {
    clearTimeout(timeoutId);
    if (uploadError.name === 'AbortError' || uploadError.message?.includes('timeout')) {
      throw new Error('Upload timeout: The file upload is taking too long. Please try again or contact support.');
    }
    throw uploadError;
  }
}

/**
 * Upload video from URL (downloads first, then uploads)
 */
export async function uploadVideoFromUrl(
  url: string,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  console.log('[Upload] Downloading video from URL:', url);

  // Fetch video
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch video: ${response.statusText}`);
  }

  const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Failed to get response reader');
  }

  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    receivedBytes += value.length;

    if (contentLength > 0) {
      onProgress?.({
        loaded: receivedBytes,
        total: contentLength,
        percentage: Math.round((receivedBytes / contentLength) * 100)
      });
    }
  }

  // Combine chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  // Create blob and upload
  const blob = new Blob([combined], { type: 'video/mp4' });
  return uploadVideoChunked(blob, userId, onProgress);
}

