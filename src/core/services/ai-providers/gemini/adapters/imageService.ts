import { GoogleGenAI, Part, Modality } from "@google/genai";
import { ImageAsset, ImagenAspectRatio } from '../../../../../types';
import { imageGenRateLimiter } from '../../../../infrastructure/rate-limiting';
import { retryWithBackoff } from '../../../../infrastructure/retry-handlers';
import { optimizeImageForAI } from '../../../../processors/image';
import { errorTracker } from '../../../../infrastructure/error-tracking';
import { performanceMonitor } from '../../../../infrastructure/performance-monitoring';

export const generateImage = async (
    ai: GoogleGenAI, 
    prompt: string, 
    negativePrompt: string, 
    aspectRatio: ImagenAspectRatio
): Promise<ImageAsset | null> => {
    return performanceMonitor.measureFunction('generateImage', async () => {
        try {
            // Rate limiting
            await imageGenRateLimiter.acquire('generate-image');

            const fullPrompt = `${prompt} --no ${negativePrompt}`;

            const response = await retryWithBackoff(
                () => ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: fullPrompt,
                    config: {
                        numberOfImages: 1,
                        aspectRatio: aspectRatio,
                        outputMimeType: 'image/png'
                    }
                }),
                {
                    maxRetries: 2,
                    initialDelayMs: 2000,
                    retryableErrors: (error: any) => {
                        return error.status === 429 || (error.status >= 500 && error.status < 600);
                    },
                }
            );

            if (response.generatedImages && response.generatedImages.length > 0) {
                const genImage = response.generatedImages[0];
                const base64 = genImage.image.imageBytes;
                const mimeType = genImage.image.mimeType;
                const url = `data:${mimeType};base64,${base64}`;
                return { id: `gen_img_${Date.now()}`, url, base64, mimeType };
            }
            return null;
        } catch (error: any) {
            errorTracker.trackAiError('generateImage', error, prompt);
            throw error;
        }
    });
};

export const editImage = async (
    ai: GoogleGenAI, 
    originalImage: ImageAsset, 
    prompt: string, 
    mask: ImageAsset | null
): Promise<ImageAsset> => {
    return performanceMonitor.measureFunction('editImage', async () => {
        try {
            // Rate limiting
            await imageGenRateLimiter.acquire('edit-image');

            // Optimize images before sending
            let optimizedOriginal = originalImage;
            try {
                const optimized = await optimizeImageForAI(originalImage.base64, originalImage.mimeType);
                optimizedOriginal = { ...originalImage, base64: optimized.base64, mimeType: optimized.mimeType };
            } catch (error) {
                console.warn('Failed to optimize original image, using original:', error);
            }

            const parts: Part[] = [
                { inlineData: { data: optimizedOriginal.base64, mimeType: optimizedOriginal.mimeType } },
            ];
            
            let finalPrompt = prompt;

            if (mask) {
                // Optimize mask
                let optimizedMask = mask;
                try {
                    const optimized = await optimizeImageForAI(mask.base64, mask.mimeType);
                    optimizedMask = { ...mask, base64: optimized.base64, mimeType: optimized.mimeType };
                } catch (error) {
                    console.warn('Failed to optimize mask, using original:', error);
                }
                parts.push({ inlineData: { data: optimizedMask.base64, mimeType: optimizedMask.mimeType } });
                finalPrompt = `Using the provided mask (the second image) where the white area indicates the region to modify, apply the following instruction: "${prompt}". Only change the content within the white masked area and seamlessly blend it with the rest of the image. The black area of the mask should remain completely unchanged.`;
            }
            
            parts.push({ text: finalPrompt });

            const response = await retryWithBackoff(
                () => ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts },
                    config: {
                        responseModalities: [Modality.IMAGE],
                    },
                }),
                {
                    maxRetries: 2,
                    initialDelayMs: 2000,
                    retryableErrors: (error: any) => {
                        return error.status === 429 || (error.status >= 500 && error.status < 600);
                    },
                }
            );
            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                        const base64 = part.inlineData.data;
                        const mimeType = part.inlineData.mimeType;
                        const url = `data:${mimeType};base64,${base64}`;
                        return { ...originalImage, base64, url, id: `edit_${originalImage.id}` };
                    }
                }
            }
            throw new Error("Image editing failed to return an image.");
        } catch (error: any) {
            errorTracker.trackAiError('editImage', error, prompt);
            throw error;
        }
    });
};

export const upscaleImage = async (ai: GoogleGenAI, image: ImageAsset): Promise<ImageAsset> => {
    // Placeholder for a real upscale API call. For now, we simulate it.
    await new Promise(res => setTimeout(res, 1500));
    // In a real scenario, you'd send the image.base64 to an upscale model/API
    // and receive a new, higher-resolution base64 string.
    console.log("Upscaling image:", image.id);
    return { ...image }; // Returning the same image for now.
};
