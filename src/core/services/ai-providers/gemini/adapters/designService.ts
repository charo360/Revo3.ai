import { GoogleGenAI, Part, Modality, GenerateContentResponse } from "@google/genai";
import { 
    ImageAsset, LogoState, ColorsState, PreferencesState, Platform, 
    TextState, DesignResult 
} from '../../../../../types';
import { PLATFORM_CONFIGS } from '../../../../../constants';
import { imageGenRateLimiter } from '../../../../infrastructure/rate-limiting';
import { retryWithBackoff } from '../../../../infrastructure/retry-handlers';
import { optimizeImageForAI } from '../../../../processors/image';
import { errorTracker } from '../../../../infrastructure/error-tracking';
import { performanceMonitor } from '../../../../infrastructure/performance-monitoring';

export const generateDesign = async (
    ai: GoogleGenAI, 
    images: ImageAsset[], 
    logo: LogoState, 
    colors: ColorsState, 
    preferences: PreferencesState, 
    platform: Platform, 
    transcript: string | null, 
    originalTitle: string, 
    currentText: TextState
): Promise<DesignResult[]> => {
    return performanceMonitor.measureFunction('generateDesign', async () => {
        try {
            // Rate limiting: Acquire permission before making API calls
            await imageGenRateLimiter.acquire(`generate-${platform}`);

            const platformConfig = PLATFORM_CONFIGS[platform];
            const originalYouTubeThumbnail = images.find(img => img.id.startsWith('yt_'));
            const userImages = images.filter(img => !img.id.startsWith('yt_'));

            let finalPrompt: string;
            const allImageParts: Part[] = [];

            // Optimize images before sending to API
            const optimizedImages = await Promise.all(
                userImages.map(async (img) => {
                    try {
                        const optimized = await optimizeImageForAI(img.base64, img.mimeType);
                        return { ...img, base64: optimized.base64, mimeType: optimized.mimeType };
                    } catch (error) {
                        console.warn('Failed to optimize image, using original:', error);
                        return img;
                    }
                })
            );

            // Optimize logo if present
            let optimizedLogo: LogoState = logo;
            if (logo.base64 && logo.mimeType) {
                try {
                    const optimized = await optimizeImageForAI(logo.base64, logo.mimeType);
                    optimizedLogo = { ...logo, base64: optimized.base64, mimeType: optimized.mimeType };
                } catch (error) {
                    console.warn('Failed to optimize logo, using original:', error);
                }
            }

            const logoPart: Part | null = (optimizedLogo.base64 && optimizedLogo.mimeType)
                ? { inlineData: { data: optimizedLogo.base64, mimeType: optimizedLogo.mimeType } }
                : null;
                
            optimizedImages.forEach(img => allImageParts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
            if (logoPart) allImageParts.push(logoPart);


            if (originalYouTubeThumbnail && platform === 'youtube_improve') {
                let transcriptContext = transcript ? `\n**Video Transcript Context (Summary):** "${transcript.substring(0, 4000)}..."` : '';
                let originalTitleContext = originalTitle ? `\n**Original Video Title:** "${originalTitle}"` : '';

                finalPrompt = `
            [START OF ABSOLUTE, NON-NEGOTIABLE TECHNICAL REQUIREMENTS]
            1.  **OUTPUT ASPECT RATIO:** The generated image's aspect ratio MUST BE EXACTLY 16:9. This is the single most important rule. Failure to produce a 16:9 image means the entire task has failed.
            2.  **OUTPUT FORMAT:** The final output must be a complete, final image, not a set of instructions or a description.
            [END OF ABSOLUTE, NON-NEGOTIABLE TECHNICAL REQUIREMENTS]

            ---

            **Persona:** Act as a hybrid of a top YouTube strategist and a master graphic designer. Your single-minded goal is to improve an existing YouTube thumbnail for maximum Click-Through Rate (CTR), while strictly adhering to the technical requirements above.

            **Guiding Philosophy: Surgical Improvement for Maximum CTR.** Your primary directive is NOT to create a completely new thumbnail, but to analyze and surgically *improve* the existing one.
            - **Analyze First:** Critically evaluate the original thumbnail. Identify its strengths (what to keep) and its specific weaknesses (what to change).
            - **Minimalism is Key:** If the design is already strong, make only minimal, high-impact changes. If only the text is weak, focus solely on that. If the composition is great but the colors are dull, just enhance the colors.
            - **Justify Every Change:** Every alteration must be directly justified by its potential to increase CTR. Do not change elements that are already working effectively.

            **Step 1: Deep Contextual Analysis**
            - **Analyze the Original Thumbnail:** Identify its strengths (e.g., compelling subject expression) and weaknesses (e.g., unreadable text, cluttered background, poor color contrast). Your improvement plan will target these weaknesses.
            - **Analyze Title & Transcript:** Synthesize this information to find the video's *emotional core*. What is the most surprising moment, the biggest promise, or the key question? The improved design must amplify this core hook.

            **Step 2: The Redesign - Strategic & Justified Changes**
            Based on your analysis, apply ONLY the necessary changes.
            - **Subject Integrity (NON-NEGOTIABLE):** The primary human subject or key object is SACRED. Preserve their likeness, expression, and posture. You are enhancing the scene *around* them.
            - **Targeted Improvements:**
                - **If Background is Weak:** Enhance it for drama or replace it with something that better tells the story.
                - **If Text is Weak:** Re-craft the text to be short, punchy, and emotionally charged. Render it with extreme readability (bold fonts, thick outlines, drop shadows).
                - **If Colors are Weak:** Re-grade the entire image for a more cohesive, eye-catching mood that makes the subject pop.
                - **If Composition is Weak:** Adjust framing, add subtle guides (arrows, circles), and use the subject's gaze to direct the viewer's eye towards the most important element.

            **Strict Rules & What to Avoid:**
            - **AVOID Unnecessary Changes:** If you analyze the thumbnail and determine it is already highly optimized, you have the authority to return a version with very minimal or even no changes. Confirm its quality in your thinking process.
            - **AVOID Over-Designing:** Do not add elements that don't serve a clear, CTR-focused purpose.
            - **AVOID THE "AI LOOK":** The final product must feel human-made. Use professional color grading, realistic lighting, and seamless blending. The final image should look like a high-quality, retouched photograph.

            **User Inputs to Guide Your Design:**
            ${originalTitleContext}
            ${transcriptContext}
            - **Vibe & Style to Execute:** ${preferences.style}
            - **Inspirational Color Palette:** Primary: ${colors.primary}, Secondary: ${colors.secondary}, Accent: ${colors.accent}.
            - **Desired Visual Drama Level:** ${preferences.drama}/5 (where 5 is maximum intensity).

            **Final Check:** Before outputting, verify again that the aspect ratio is exactly 16:9.
        `;
                
                // Optimize YouTube thumbnail
                let optimizedThumbnail = originalYouTubeThumbnail;
                try {
                    const optimized = await optimizeImageForAI(originalYouTubeThumbnail.base64, originalYouTubeThumbnail.mimeType);
                    optimizedThumbnail = { ...originalYouTubeThumbnail, base64: optimized.base64, mimeType: optimized.mimeType };
                } catch (error) {
                    console.warn('Failed to optimize YouTube thumbnail, using original:', error);
                }
                allImageParts.unshift({ inlineData: { data: optimizedThumbnail.base64, mimeType: optimizedThumbnail.mimeType } });

            } else if (platform === 'podcast') {
                const podcastSubtitle = currentText.subheadline ? `\n            *   **Tagline/Subtitle:** "${currentText.subheadline}"` : '';

                finalPrompt = `
            [START OF ABSOLUTE, NON-NEGOTIABLE TECHNICAL REQUIREMENTS]
            1.  **OUTPUT ASPECT RATIO:** The generated image's aspect ratio MUST BE EXACTLY 1:1 (SQUARE). This is the single most important rule. Failure to produce a 1:1 square image means the entire task has failed.
            2.  **TEXT RENDERING:** All text from the Creative Brief (Podcast Title, Host Name, Tagline) MUST be rendered directly and cleanly onto the final image.
            [END OF ABSOLUTE, NON-NEGOTIABLE TECHNICAL REQUIREMENTS]

            ---

            **Persona:** You are an award-winning Art Director specializing in branding for top-charting podcasts. You have a deep understanding of what makes a cover successful in a crowded marketplace. Your design philosophy is built on clarity, balance, and impact.

            **Core Objective:** Your mission is to create a visually arresting, scroll-stopping podcast cover that is instantly understandable and highly legible, even as a tiny thumbnail, while strictly adhering to the technical requirements above.

            **Design Philosophy & Non-Negotiable Rules:**

            1.  **INTELLIGENT COLOR & CONTRAST:** The provided color palette is your inspiration.
                *   **Apply Expert Color Theory:** Don't just place colors; create a professional, harmonious mood that matches the podcast's vibe.
                *   **Maximize Contrast:** Use the palette to create extreme contrast for ALL text. Every word must be perfectly readable against its background. This is non-negotiable.

            2.  **SINGLE, POWERFUL FOCAL POINT:** Simplicity wins.
                *   Identify or create ONE strong central image. This could be a dramatic photo of the host, a key object, or a powerful abstract/symbolic graphic.
                *   **Avoid Clutter:** A busy background will kill the design's impact at small sizes. Ensure the background supports the foreground elements without distracting from them.

            3.  **MASTER VISUAL HIERARCHY & BALANCE:** Every element must have a clear purpose and place.
                *   **Primary (The Hook):** The Podcast Title ("${currentText.headline}") must be the undeniable hero. Make it large, bold, and instantly readable.
                *   **Secondary (The Context):** The Key Visual (from user images or generated) must be compelling but should *support* the title, not fight it.
                *   **Tertiary (The Credit):** The Host Name ("${currentText.author}") and/or Tagline ("${currentText.subheadline}") must be smaller and placed thoughtfully. **Crucially, they must still be perfectly legible.** Achieve this by placing them in areas of lower visual complexity or giving them a subtle background element (like a soft bar or contrasted area) of their own.
                *   **Compositional Balance:** Arrange these elements in a professional, balanced layout. The final design must feel stable and intentional. Avoid cramming everything into one corner. Consider classic layouts like a strong centered alignment or a clean top/bottom split to create order.

            4.  **THE THUMBNAIL TEST:** Before finalizing, mentally shrink your design to 50x50 pixels. Is every line of text readable? Is the focal point clear? If not, the design fails. AVOID thin fonts, intricate details, and low-contrast color combinations.

            **User-Provided Creative Brief:**
            *   **Podcast Title:** "${currentText.headline}"
            *   **Host/Author Name:** "${currentText.author || 'Not provided'}"${podcastSubtitle}
            *   **Core Theme/Vibe:** "${preferences.style}"
            *   **Inspirational Color Palette:** Primary: ${colors.primary}, Secondary: ${colors.secondary}, Accent: ${colors.accent}.
            *   **Provided Visuals:** Use the attached images as the foundation for the key visual.
            *   **Logo:** If a logo is provided, integrate it subtly, perhaps in a corner (${logo.position}). Do not let it overpower the main title or visual.

            **Final Check:** Before outputting, verify again that the aspect ratio is exactly 1:1 (SQUARE).
        `;
            } else if (platform === 'tiktok') {
                const tiktokHeadline = currentText.headline ? `\n*   **Headline Hook:** "${currentText.headline}"` : '';

                finalPrompt = `
            [START OF ABSOLUTE, NON-NEGOTIABLE TECHNICAL REQUIREMENTS]
            1.  **OUTPUT ASPECT RATIO:** The generated image's aspect ratio MUST BE EXACTLY 9:16 (VERTICAL). This is the single most important rule. Failure to produce a 9:16 image means the entire task has failed.
            2.  **TEXT RENDERING:** A headline MUST be rendered directly and cleanly onto the final image. The text must be bold, trendy, and instantly readable on a mobile device.
            [END OF ABSOLUTE, NON-NEGOTIABLE TECHNICAL REQUIREMENTS]

            ---

            **Persona:** You are a top-tier TikTok/Shorts viral strategist and a brilliant motion graphic designer. You understand the psychology of the "For You" page and what makes a user stop scrolling in under a second.

            **Core Objective:** Your mission is to create a viral, scroll-stopping TikTok cover from the provided video frames or images. The cover must generate intense curiosity and promise high value, compelling users to watch the video. Strictly adhere to the technical requirements above.

            **Design Philosophy & Non-Negotiable Rules:**

            1.  **CURIOSITY GAP IS KING:** The design must not give everything away. It should pose a question, show the "before" of a transformation, or hint at a shocking outcome.
                *   **Analyze Frames/Images:** Identify the single most intriguing frame or image from the assets provided. This might be a frame with a peak emotional expression, a bizarre situation, or a moment right before a big reveal. This frame is your foundation.
                *   **Amplify the Hook:** Use text and graphic elements to amplify the hook of that single frame.

            2.  **TEXT IS A WEAPON:** TikTok text is not just information; it's a core visual element.
                *   **BIG, BOLD, NATIVE:** Use large, bold, sans-serif fonts that feel native to the TikTok app. Think fonts like TikTok Sans, or similar bold, clean styles. Use thick outlines or strong drop shadows for maximum readability against any background.
                *   **SHORT & PUNCHY:** The headline ("${currentText.headline}") should be very short (2-5 words is ideal). It must be emotionally charged and create urgency or curiosity.
                *   **SMART PLACEMENT:** Place text in the upper or lower thirds of the screen, avoiding the center where the user's thumb might be. Don't cover the main subject's face.

            3.  **VISUALS THAT POP:** The aesthetic must match the platform.
                *   **High Saturation & Contrast:** Colors should be vibrant and eye-catching. Increase saturation and contrast from the source frame to make it pop on a small screen.
                *   **Subtle, Trendy Graphics:** If appropriate, add minimal graphic elements like a simple arrow, a circle, or emoji to draw attention to the key subject, but do NOT over-clutter the design. The focus is the main image and the headline.

            4.  **THE 1-SECOND TEST:** Before finalizing, imagine seeing this cover for one second while scrolling. Does it make you stop? Does it make you curious? Is the text instantly readable? If not, the design fails. AVOID small text, complex layouts, and subtle color palettes.

            **User-Provided Creative Brief:**${tiktokHeadline}
            *   **Core Theme/Vibe:** "${preferences.style}"
            *   **Inspirational Color Palette:** Primary: ${colors.primary}, Secondary: ${colors.secondary}, Accent: ${colors.accent}.
            *   **Provided Video Frames/Images:** Analyze these assets to find the most compelling moment to use as the base for the cover.
            *   **Logo:** If a logo is provided, place it very subtly in a corner (${logo.position}). It should be small and not distracting.

            **Final Check:** Before outputting, verify again that the aspect ratio is exactly 9:16 (VERTICAL).
        `;
            } else {
                // Fallback for other platforms
                finalPrompt = `
            [START OF ABSOLUTE, NON-NEGOTIABLE TECHNICAL REQUIREMENTS]
            1.  **OUTPUT ASPECT RATIO:** The generated image's aspect ratio MUST BE EXACTLY ${platformConfig.aspectRatio}. This is the single most important rule. Failure to produce a ${platformConfig.aspectRatio} image means the entire task has failed.
            2.  **TEXT RENDERING:** All text from the Creative Brief (Headline, Subheadline) MUST be rendered directly and cleanly onto the final image.
            [END OF ABSOLUTE, NON-NEGOTIABLE TECHNICAL REQUIREMENTS]

            ---

            **Objective:** Create a compelling and high-quality design for a ${platformConfig.title}, strictly adhering to the technical requirements above.
            
            **Platform Specifics:** ${platformConfig.promptSnippet}

            **Creative Brief:**
            - Headline: "${currentText.headline}"
            - Subheadline: "${currentText.subheadline}"
            - **User-Provided Images:** Use the attached images as the primary visual focus.
            - **Logo:** If a logo is provided, integrate it at the ${logo.position.replace('-', ' ')}.
            - **Overall Vibe:** ${preferences.style}.
            - **Color Palette:** Primary: ${colors.primary}, Secondary: ${colors.secondary}, Accent: ${colors.accent}, Background: ${colors.background}.
            - **Visual Drama:** ${preferences.drama} out of 5.
            
            **Final Check:** Before outputting, verify again that the aspect ratio is exactly ${platformConfig.aspectRatio}.
        `;
            }
            
            // The 'gemini-2.5-flash-image' model does not support multiple candidates.
            // To generate multiple variations, we must call the API multiple times.
            // Use rate limiting and retry logic for each request
            const generationPromises: Promise<GenerateContentResponse>[] = [];

            for (let i = 0; i < preferences.variations; i++) {
                // Acquire rate limit permission for each variation
                await imageGenRateLimiter.acquire(`generate-${platform}-variation-${i}`);
                
                const promise = retryWithBackoff(
                    () => ai.models.generateContent({
                        model: 'gemini-2.5-flash-image',
                        contents: { parts: [{ text: finalPrompt }, ...allImageParts] },
                        config: {
                            responseModalities: [Modality.IMAGE],
                        },
                    }),
                    {
                        maxRetries: 2,
                        initialDelayMs: 2000,
                        retryableErrors: (error: any) => {
                            // Retry on rate limit errors (429) and server errors (5xx)
                            return error.status === 429 || (error.status >= 500 && error.status < 600);
                        },
                    }
                );
                generationPromises.push(promise);
            }

            // Process requests with limited concurrency to avoid overwhelming the API
            const MAX_CONCURRENT = 2;
            const responses: GenerateContentResponse[] = [];
            
            for (let i = 0; i < generationPromises.length; i += MAX_CONCURRENT) {
                const batch = generationPromises.slice(i, i + MAX_CONCURRENT);
                const batchResults = await Promise.all(batch);
                responses.push(...batchResults);
            }

            const results: DesignResult[] = [];
            for (const response of responses) {
                const candidate = response.candidates?.[0];
                if (candidate?.content?.parts) {
                    for (const part of candidate.content.parts) {
                        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                            results.push({
                                image: {
                                    id: `gen_${Date.now()}_${results.length}`,
                                    base64: part.inlineData.data,
                                    mimeType: part.inlineData.mimeType,
                                    url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
                                }
                            });
                            break;
                        }
                    }
                }
            }


            if (results.length === 0) {
                throw new Error("The model did not return any images. Please try adjusting your prompt or inputs.");
            }

            return results;
        } catch (error: any) {
            errorTracker.trackAiError('generateDesign', error, finalPrompt);
            throw error;
        }
    });
};

export const adaptImageForPlatform = async (
    ai: GoogleGenAI, 
    sourceImage: ImageAsset, 
    targetPlatform: Platform, 
    text: TextState, 
    logo: LogoState, 
    colors: ColorsState, 
    preferences: PreferencesState
): Promise<DesignResult[]> => {
    return performanceMonitor.measureFunction('adaptImageForPlatform', async () => {
        try {
            // Rate limiting
            await imageGenRateLimiter.acquire(`adapt-${targetPlatform}`);
    
            // Optimize source image
            let optimizedImage = sourceImage;
            try {
                const optimized = await optimizeImageForAI(sourceImage.base64, sourceImage.mimeType);
                optimizedImage = { ...sourceImage, base64: optimized.base64, mimeType: optimized.mimeType };
            } catch (error) {
                console.warn('Failed to optimize source image, using original:', error);
            }
            
            const targetConfig = PLATFORM_CONFIGS[targetPlatform];
            const prompt = `
        [START OF ABSOLUTE, NON-NEGOTIABLE TECHNICAL REQUIREMENTS]
        1.  **OUTPUT ASPECT RATIO:** The generated image's aspect ratio MUST BE EXACTLY ${targetConfig.aspectRatio}. This is the single most important rule. Failure to produce a ${targetConfig.aspectRatio} image means the entire task has failed.
        2.  **NO TEXT:** DO NOT render any text on the image. This is a background adaptation task only.
        [END OF ABSOLUTE, NON-NEGOTIABLE TECHNICAL REQUIREMENTS]

        ---

        **Objective:** Adapt the provided source image into a new background suitable for a ${targetConfig.title}, strictly adhering to the technical requirements above.
        
        **Adaptation Instructions:**
        1.  **Recompose, Do Not Recreate:** Maintain the original image's style, colors, and overall aesthetic. The goal is to rearrange the existing elements to fit the new aspect ratio, not to generate a new concept.
        2.  **Composition for Text:** Ensure the new composition has clear, visually balanced areas where text *could* be overlaid later.
        3.  **Platform Specifics:** ${targetConfig.promptSnippet}.
        
            **Final Check:** Before outputting, verify again that the aspect ratio is exactly ${targetConfig.aspectRatio}.
        `;

            const response = await retryWithBackoff(
                () => ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [
                        { inlineData: { data: optimizedImage.base64, mimeType: optimizedImage.mimeType } },
                        { text: prompt }
                    ]},
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

            const results: DesignResult[] = [];
            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64 = part.inlineData.data;
                        const mimeType = part.inlineData.mimeType;
                        results.push({
                            image: {
                                id: `adapt_${Date.now()}`,
                                base64,
                                mimeType,
                                url: `data:${mimeType};base64,${base64}`
                            }
                        });
                    }
                }
            }

            if (results.length === 0) {
                throw new Error("Adaptation failed: The model did not return an image.");
            }
            return results;
        } catch (error: any) {
            errorTracker.trackAiError('adaptImageForPlatform', error);
            throw error;
        }
    });
};
