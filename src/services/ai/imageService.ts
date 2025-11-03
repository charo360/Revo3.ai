import { GoogleGenAI, Part, Modality } from "@google/genai";
import { ImageAsset, ImagenAspectRatio } from '../../types';

export const generateImage = async (
    ai: GoogleGenAI, 
    prompt: string, 
    negativePrompt: string, 
    aspectRatio: ImagenAspectRatio
): Promise<ImageAsset | null> => {
    const fullPrompt = `${prompt} --no ${negativePrompt}`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
            numberOfImages: 1,
            aspectRatio: aspectRatio,
            outputMimeType: 'image/png'
        }
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const genImage = response.generatedImages[0];
        const base64 = genImage.image.imageBytes;
        const mimeType = genImage.image.mimeType;
        const url = `data:${mimeType};base64,${base64}`;
        return { id: `gen_img_${Date.now()}`, url, base64, mimeType };
    }
    return null;
};

export const editImage = async (
    ai: GoogleGenAI, 
    originalImage: ImageAsset, 
    prompt: string, 
    mask: ImageAsset | null
): Promise<ImageAsset> => {
    const parts: Part[] = [
        { inlineData: { data: originalImage.base64, mimeType: originalImage.mimeType } },
    ];
    
    let finalPrompt = prompt;

    if (mask) {
        parts.push({ inlineData: { data: mask.base64, mimeType: mask.mimeType } });
        finalPrompt = `Using the provided mask (the second image) where the white area indicates the region to modify, apply the following instruction: "${prompt}". Only change the content within the white masked area and seamlessly blend it with the rest of the image. The black area of the mask should remain completely unchanged.`;
    }
    
    parts.push({ text: finalPrompt });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
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
};

export const upscaleImage = async (ai: GoogleGenAI, image: ImageAsset): Promise<ImageAsset> => {
    // Placeholder for a real upscale API call. For now, we simulate it.
    await new Promise(res => setTimeout(res, 1500));
    // In a real scenario, you'd send the image.base64 to an upscale model/API
    // and receive a new, higher-resolution base64 string.
    console.log("Upscaling image:", image.id);
    return { ...image }; // Returning the same image for now.
};
