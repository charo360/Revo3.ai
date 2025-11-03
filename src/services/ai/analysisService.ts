import { GoogleGenAI, Part, Type, Modality } from "@google/genai";
import { ImageAsset, AnalysisResult } from '../../types';
import { VIBE_STYLES } from '../../constants';

export const extractFacesFromImage = async (
    ai: GoogleGenAI, 
    sourceImage: ImageAsset
): Promise<ImageAsset[]> => {
    const prompt = "Detect all human faces in the provided image. For each face found, create a new image that is a clean cutout of just the head and shoulders, with the background completely removed and transparent. Output each cutout as a separate PNG image.";

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [
            { inlineData: { data: sourceImage.base64, mimeType: sourceImage.mimeType } },
            { text: prompt }
        ]},
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const results: ImageAsset[] = [];
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                const base64 = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                results.push({
                    id: `face_${Date.now()}_${results.length}`,
                    base64,
                    mimeType,
                    url: `data:${mimeType};base64,${base64}`
                });
            }
        }
    }
    
    if (results.length === 0) {
        throw new Error("The model did not find any faces or failed to return cutouts.");
    }
    return results;
};

export const analyzeVideoAndSuggestStyles = async (
    ai: GoogleGenAI, 
    frames: ImageAsset[]
): Promise<AnalysisResult> => {
    const imageParts: Part[] = frames.map(frame => ({
        inlineData: { data: frame.base64, mimeType: frame.mimeType }
    }));
    
    const prompt = `
        Analyze the following video frames. Based on the visual content, mood, and subject matter, provide:
        1. A suggested "Vibe & Style" from this list: ${VIBE_STYLES.join(', ')}.
        2. A cohesive 4-color palette (primary, secondary, accent, background) in hex format. The colors should be harmonious and reflect the overall feel of the video.

        Your response MUST be a valid JSON object in the following format, and nothing else:
        {
          "suggestedStyle": "Style Name",
          "suggestedColors": {
            "primary": "#XXXXXX",
            "secondary": "#XXXXXX",
            "accent": "#XXXXXX",
            "background": "#XXXXXX"
          }
        }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, ...imageParts] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    suggestedStyle: { type: Type.STRING },
                    suggestedColors: {
                        type: Type.OBJECT,
                        properties: {
                            primary: { type: Type.STRING },
                            secondary: { type: Type.STRING },
                            accent: { type: Type.STRING },
                            background: { type: Type.STRING },
                        },
                        required: ["primary", "secondary", "accent", "background"]
                    }
                },
                required: ["suggestedStyle", "suggestedColors"]
            }
        }
    });
    
    try {
        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString);
        
        if (!VIBE_STYLES.includes(parsedJson.suggestedStyle)) {
            parsedJson.suggestedStyle = VIBE_STYLES[0];
        }

        return parsedJson as AnalysisResult;

    } catch(e) {
        console.error("Failed to parse analysis from AI:", e);
        throw new Error("The AI returned an invalid format for style analysis.");
    }
};
