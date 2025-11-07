/**
 * Video Processing Service using FFmpeg.wasm
 * 
 * This service handles:
 * - Video clipping/trimming
 * - Format conversion
 * - Aspect ratio conversion (9:16 for shorts, etc.)
 * - Resolution adjustment
 * - Audio extraction and processing
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { ClipMetadata } from '../../../types/repurpose';

// FFmpeg instance (singleton)
let ffmpegInstance: FFmpeg | null = null;
let isFFmpegLoaded = false;

/**
 * Initialize FFmpeg
 */
async function getFFmpeg(): Promise<FFmpeg> {
    if (ffmpegInstance && isFFmpegLoaded) {
        return ffmpegInstance;
    }

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = new FFmpeg();
    
    // Load FFmpeg core
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpegInstance = ffmpeg;
    isFFmpegLoaded = true;
    
    return ffmpeg;
}

/**
 * Process video file: clip, resize, convert format
 */
export async function processVideoClip(
    videoFile: File | Blob,
    startTime: number,
    endTime: number,
    options: {
        outputFormat?: 'mp4' | 'webm';
        aspectRatio?: '9:16' | '16:9' | '1:1' | '4:5';
        resolution?: { width: number; height: number };
        fps?: number;
        includeAudio?: boolean;
    } = {}
): Promise<{ blob: Blob; metadata: ClipMetadata }> {
    const ffmpeg = await getFFmpeg();
    const inputFileName = 'input.mp4';
    const outputFileName = `output.${options.outputFormat || 'mp4'}`;
    
    try {
        // Write input file to FFmpeg filesystem
        const videoData = await fetchFile(videoFile);
        await ffmpeg.writeFile(inputFileName, videoData);
        
        // Build FFmpeg command
        const duration = endTime - startTime;
        
        // Calculate output resolution based on aspect ratio
        let outputWidth = options.resolution?.width || 1080;
        let outputHeight = options.resolution?.height || 1920;
        
        if (options.aspectRatio === '9:16') {
            // Vertical (Shorts, TikTok, Reels)
            outputWidth = 1080;
            outputHeight = 1920;
        } else if (options.aspectRatio === '16:9') {
            // Horizontal
            outputWidth = 1920;
            outputHeight = 1080;
        } else if (options.aspectRatio === '1:1') {
            // Square
            outputWidth = 1080;
            outputHeight = 1080;
        } else if (options.aspectRatio === '4:5') {
            // Instagram portrait
            outputWidth = 1080;
            outputHeight = 1350;
        }
        
        const fps = options.fps || 30;
        
        // Build filter complex for cropping/resizing to maintain aspect ratio
        const filterComplex = `[0:v]scale=${outputWidth}:${outputHeight}:force_original_aspect_ratio=increase,crop=${outputWidth}:${outputHeight}[v]`;
        
        const args = [
            '-i', inputFileName,
            '-ss', startTime.toString(),
            '-t', duration.toString(),
            '-filter_complex', filterComplex,
            '-map', '[v]',
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '23',
            '-r', fps.toString(),
        ];
        
        if (options.includeAudio !== false) {
            args.push('-map', '0:a?', '-c:a', 'aac', '-b:a', '128k');
        }
        
        args.push(
            '-movflags', '+faststart',
            '-pix_fmt', 'yuv420p',
            outputFileName
        );
        
        // Execute FFmpeg
        await ffmpeg.exec(args);
        
        // Read output file
        const outputData = await ffmpeg.readFile(outputFileName);
        const blob = new Blob([outputData], { type: `video/${options.outputFormat || 'mp4'}` });
        
        // Clean up
        await ffmpeg.deleteFile(inputFileName);
        await ffmpeg.deleteFile(outputFileName);
        
        // Get metadata
        const metadata: ClipMetadata = {
            frame_count: Math.ceil(duration * fps),
            fps,
            resolution: `${outputWidth}x${outputHeight}`,
            file_size: blob.size,
            audio_enabled: options.includeAudio !== false,
            captions_enabled: false,
        };
        
        return { blob, metadata };
    } catch (error: any) {
        console.error('Error processing video clip:', error);
        throw new Error(`Failed to process video clip: ${error.message}`);
    }
}

/**
 * Get video metadata (duration, resolution, etc.)
 */
export async function getVideoMetadata(videoFile: File | Blob): Promise<{
    duration: number;
    width: number;
    height: number;
    fps: number;
    bitrate: number;
    codec: string;
}> {
    const url = URL.createObjectURL(videoFile);
    const video = document.createElement('video');
    video.src = url;
    
    return new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
            URL.revokeObjectURL(url);
            resolve({
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight,
                fps: 30, // Default, would need actual detection
                bitrate: 0, // Would need actual detection
                codec: 'h264' // Default
            });
        };
        video.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load video metadata'));
        };
    });
}

/**
 * Generate thumbnail from video at specific timestamp
 */
export async function generateThumbnail(
    videoFile: File | Blob,
    timestamp: number,
    width: number = 640,
    height: number = 360
): Promise<Blob> {
    const ffmpeg = await getFFmpeg();
    const inputFileName = 'input.mp4';
    const outputFileName = 'thumbnail.jpg';
    
    try {
        const videoData = await fetchFile(videoFile);
        await ffmpeg.writeFile(inputFileName, videoData);
        
        await ffmpeg.exec([
            '-i', inputFileName,
            '-ss', timestamp.toString(),
            '-vframes', '1',
            '-vf', `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`,
            '-q:v', '2',
            outputFileName
        ]);
        
        const thumbnailData = await ffmpeg.readFile(outputFileName);
        const blob = new Blob([thumbnailData], { type: 'image/jpeg' });
        
        await ffmpeg.deleteFile(inputFileName);
        await ffmpeg.deleteFile(outputFileName);
        
        return blob;
    } catch (error: any) {
        console.error('Error generating thumbnail:', error);
        throw new Error(`Failed to generate thumbnail: ${error.message}`);
    }
}

/**
 * Extract frames from video at specific timestamps
 */
export async function extractFramesAtTimes(
    videoFile: File | Blob,
    timestamps: number[]
): Promise<{ timestamp: number; blob: Blob }[]> {
    const ffmpeg = await getFFmpeg();
    const inputFileName = 'input.mp4';
    
    try {
        const videoData = await fetchFile(videoFile);
        await ffmpeg.writeFile(inputFileName, videoData);
        
        const frames: { timestamp: number; blob: Blob }[] = [];
        
        for (const timestamp of timestamps) {
            const outputFileName = `frame_${timestamp}.jpg`;
            
            await ffmpeg.exec([
                '-i', inputFileName,
                '-ss', timestamp.toString(),
                '-vframes', '1',
                '-q:v', '2', // High quality
                outputFileName
            ]);
            
            const frameData = await ffmpeg.readFile(outputFileName);
            const blob = new Blob([frameData], { type: 'image/jpeg' });
            frames.push({ timestamp, blob });
            
            await ffmpeg.deleteFile(outputFileName);
        }
        
        await ffmpeg.deleteFile(inputFileName);
        
        return frames;
    } catch (error: any) {
        console.error('Error extracting frames:', error);
        throw new Error(`Failed to extract frames: ${error.message}`);
    }
}

/**
 * Convert video URL to File/Blob
 */
export async function videoUrlToBlob(videoUrl: string): Promise<Blob> {
    try {
        const response = await fetch(videoUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }
        return await response.blob();
    } catch (error: any) {
        console.error('Error converting video URL to blob:', error);
        throw new Error(`Failed to convert video URL to blob: ${error.message}`);
    }
}

