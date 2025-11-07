/**
 * Image Processing Utility
 * Handles image optimization, compression, and format conversion
 */

interface OptimizeOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxSizeKB?: number;
    format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

const DEFAULT_OPTIONS: Required<OptimizeOptions> = {
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 0.85,
    maxSizeKB: 500,
    format: 'image/jpeg',
};

/**
 * Compress image to reduce file size
 */
export async function optimizeImage(
    base64: string,
    mimeType: string,
    options: OptimizeOptions = {}
): Promise<{ base64: string; mimeType: string; sizeKB: number }> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions maintaining aspect ratio
            if (width > opts.maxWidth || height > opts.maxHeight) {
                const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height);
                width = width * ratio;
                height = height * ratio;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to target format
            const outputFormat = opts.format || (mimeType.startsWith('image/png') ? 'image/png' : 'image/jpeg');
            const outputQuality = outputFormat === 'image/png' ? undefined : opts.quality;

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Failed to compress image'));
                        return;
                    }

                    // Check if we need further compression
                    const sizeKB = blob.size / 1024;
                    if (sizeKB > opts.maxSizeKB && outputQuality && outputQuality > 0.5) {
                        // Recursively compress with lower quality
                        const reader = new FileReader();
                        reader.onload = async () => {
                            try {
                                const result = await optimizeImage(
                                    (reader.result as string).split(',')[1],
                                    outputFormat,
                                    { ...opts, quality: outputQuality - 0.1 }
                                );
                                resolve(result);
                            } catch (error) {
                                reject(error);
                            }
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    } else {
                        // Convert blob to base64
                        const reader = new FileReader();
                        reader.onload = () => {
                            const result = (reader.result as string).split(',')[1];
                            resolve({
                                base64: result,
                                mimeType: outputFormat,
                                sizeKB: sizeKB,
                            });
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    }
                },
                outputFormat,
                outputQuality
            );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = `data:${mimeType};base64,${base64}`;
    });
}

/**
 * Optimize image for AI API (smaller, faster processing)
 */
export async function optimizeImageForAI(
    base64: string,
    mimeType: string
): Promise<{ base64: string; mimeType: string; sizeKB: number }> {
    return optimizeImage(base64, mimeType, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        maxSizeKB: 300,
        format: 'image/jpeg',
    });
}

/**
 * Get image file size in KB
 */
export function getImageSizeKB(base64: string): number {
    // Approximate size: base64 is ~33% larger than binary
    return (base64.length * 0.75) / 1024;
}

export type { OptimizeOptions };

