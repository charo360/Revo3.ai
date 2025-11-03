import { ImageAsset } from '../types';

export const extractFramesFromVideo = (videoUrl: string, startTime: number, endTime: number, frameCount: number): Promise<ImageAsset[]> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = videoUrl;
        video.muted = true;
        video.crossOrigin = "anonymous"; // Important for canvas operations
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const frames: ImageAsset[] = [];
        const interval = frameCount > 1 ? (endTime - startTime) / (frameCount - 1) : 0;

        let loaded = false;
        let framesExtracted = 0;

        video.onloadeddata = () => {
            if (loaded) return;
            loaded = true;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const seekNext = (index: number) => {
                if (index >= frameCount) {
                    resolve(frames);
                    return;
                }
                const time = startTime + (index * interval);
                video.currentTime = Math.min(time, video.duration);
            };
            
            video.onseeked = () => {
                if (frames.length >= frameCount) return;
                
                context?.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                frames.push({
                    id: `frame_${Date.now()}_${framesExtracted}`,
                    url: dataUrl,
                    base64: dataUrl.split(',')[1],
                    mimeType: 'image/jpeg'
                });
                framesExtracted++;
                seekNext(framesExtracted);
            };

            seekNext(0);
        };
        
        video.onerror = () => reject("Error loading video for frame extraction.");
        video.load();
    });
};
