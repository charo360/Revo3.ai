import { ImageAsset } from '../../types';

export const extractFramesFromVideo = (videoUrl: string, startTime: number, endTime: number, frameCount: number): Promise<ImageAsset[]> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        
        // Only set crossOrigin for external URLs, not for blob URLs
        if (!videoUrl.startsWith('blob:')) {
            video.crossOrigin = "anonymous";
        }
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const frames: ImageAsset[] = [];
        const interval = frameCount > 1 ? (endTime - startTime) / (frameCount - 1) : 0;

        let loaded = false;
        let framesExtracted = 0;
        let errorOccurred = false;

        const cleanup = () => {
            video.onloadedmetadata = null;
            video.onloadeddata = null;
            video.onseeked = null;
            video.onerror = null;
            video.src = '';
        };

        video.onloadedmetadata = () => {
            if (loaded || errorOccurred) return;
            console.log('[Frame Extraction] Video metadata loaded', {
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight
            });
        };

        video.onloadeddata = () => {
            if (loaded || errorOccurred) return;
            loaded = true;
            
            console.log('[Frame Extraction] Video data loaded, starting frame extraction');
            
            canvas.width = video.videoWidth || 1920;
            canvas.height = video.videoHeight || 1080;
            
            const seekNext = (index: number) => {
                if (index >= frameCount || errorOccurred) {
                    cleanup();
                    resolve(frames);
                    return;
                }
                const time = startTime + (index * interval);
                const seekTime = Math.min(time, video.duration || endTime);
                console.log(`[Frame Extraction] Seeking to ${seekTime.toFixed(2)}s (frame ${index + 1}/${frameCount})`);
                video.currentTime = seekTime;
            };
            
            video.onseeked = () => {
                if (frames.length >= frameCount || errorOccurred) return;
                
                try {
                    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    frames.push({
                        id: `frame_${Date.now()}_${framesExtracted}`,
                        url: dataUrl,
                        base64: dataUrl.split(',')[1],
                        mimeType: 'image/jpeg'
                    });
                    framesExtracted++;
                    console.log(`[Frame Extraction] Extracted frame ${framesExtracted}/${frameCount}`);
                    seekNext(framesExtracted);
                } catch (err) {
                    console.error('[Frame Extraction] Error drawing frame:', err);
                    errorOccurred = true;
                    cleanup();
                    reject(`Error extracting frame: ${err}`);
                }
            };

            seekNext(0);
        };
        
        video.onerror = (e) => {
            if (errorOccurred) return;
            errorOccurred = true;
            cleanup();
            console.error('[Frame Extraction] Video error:', {
                error: e,
                videoSrc: videoUrl.substring(0, 100),
                readyState: video.readyState,
                networkState: video.networkState,
                framesExtracted: framesExtracted,
                totalFrames: frameCount
            });
            
            // If we got at least some frames, return what we have instead of failing
            if (frames.length > 0) {
                console.warn(`[Frame Extraction] Partial success: extracted ${frames.length}/${frameCount} frames`);
                resolve(frames);
            } else {
                reject(new Error("Error loading video for frame extraction. Please ensure the video file is valid and accessible."));
            }
        };
        
        // Set source and start loading
        video.src = videoUrl;
        video.load();
        
        // Timeout after 30 seconds
        setTimeout(() => {
            if (!loaded && !errorOccurred) {
                errorOccurred = true;
                cleanup();
                reject(new Error("Video loading timeout. Please try a smaller video or check your connection."));
            }
        }, 30000);
    });
};
