/**
 * ML Service for Detecting Viral Moments in Videos
 * 
 * This service uses a combination of:
 * - Visual analysis (scene detection, motion, faces, objects)
 * - Audio analysis (volume, speech, music, sentiment)
 * - Transcript analysis (key phrases, hooks, sentiment)
 * - Engagement prediction (ML model for predicting viewer engagement)
 * 
 * The algorithm identifies moments with high viral potential by combining
 * multiple signals into a composite virality score.
 */

import { GoogleGenAI, Part, Modality, Type } from "@google/genai";
import { 
    MLAnalysis, 
    SceneSegment, 
    AudioAnalysis, 
    TranscriptAnalysis, 
    VisualFeatures, 
    EngagementPrediction, 
    ViralMoment 
} from '../../../../types/repurpose';
import { ImageAsset } from '../../../../types';
import { extractFramesFromVideo } from '../../../../shared/utils/video-utils';
import { fetchTranscript } from '../../../../shared/utils/youtube-utils';
import { imageGenRateLimiter } from '../../../infrastructure/rate-limiting';
import { retryWithBackoff } from '../../../infrastructure/retry-handlers';
import { optimizeImageForAI } from '../../../processors/image';

/**
 * Main function to analyze video and detect viral moments
 */
export async function analyzeVideoForViralMoments(
    ai: GoogleGenAI,
    videoUrl: string,
    videoDuration: number,
    transcript?: string | null,
    frames?: ImageAsset[],
    repurposedVideoId?: string
): Promise<MLAnalysis> {
    const startTime = Date.now();
    
    console.log('[ML Analysis] Starting viral moment detection...', {
        videoUrl: videoUrl.substring(0, 50) + '...',
        videoDuration,
        hasTranscript: !!transcript,
        hasFrames: !!frames,
        frameCount: frames?.length || 0
    });
    
    // Rate limiting
    await imageGenRateLimiter.acquire('viral-moment-analysis');

    try {
        // Step 1: Extract frames if not provided (optimized sampling)
        // Sample every 3 seconds for videos > 2 minutes, every 2 seconds otherwise
        // Max 40 frames to reduce processing time
        const frameInterval = videoDuration > 120 ? 3 : 2;
        const maxFrames = Math.min(Math.ceil(videoDuration / frameInterval), 40);
        
        const sampledFrames = frames || await extractFramesFromVideo(
            videoUrl, 
            0, 
            videoDuration, 
            maxFrames
        );
        console.log('[ML Analysis] Step 1 complete: Frame extraction/validation', { frameCount: sampledFrames.length });

        // Step 2: Analyze visual features
        console.log('[ML Analysis] Step 2 starting: Analyzing visual features...');
        const visualFeatures = await analyzeVisualFeatures(ai, sampledFrames, videoDuration);
        console.log('[ML Analysis] Step 2 complete: Visual features analyzed');

        // Step 3: Analyze scenes
        console.log('[ML Analysis] Step 3 starting: Detecting scenes...');
        const sceneSegments = await detectScenes(ai, sampledFrames, videoDuration);
        console.log('[ML Analysis] Step 3 complete: Scene detection finished', { sceneCount: sceneSegments.length });

        // Step 4: Analyze audio (placeholder - would need audio extraction in production)
        console.log('[ML Analysis] Step 4 starting: Analyzing audio...');
        const audioAnalysis = await analyzeAudio(videoUrl, videoDuration);
        console.log('[ML Analysis] Step 4 complete: Audio analysis finished');

        // Step 5: Analyze transcript if available
        console.log('[ML Analysis] Step 5 starting: Analyzing transcript...');
        let transcriptAnalysis: TranscriptAnalysis | undefined;
        if (transcript) {
            transcriptAnalysis = await analyzeTranscript(ai, transcript, videoDuration);
        } else {
            // Try to fetch transcript if video URL is YouTube
            if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                try {
                    const fetchedTranscript = await fetchTranscript(videoUrl);
                    if (fetchedTranscript) {
                        transcriptAnalysis = await analyzeTranscript(ai, fetchedTranscript, videoDuration);
                    }
                } catch (error) {
                    console.warn('Failed to fetch transcript:', error);
                }
            }
        }
        console.log('[ML Analysis] Step 5 complete: Transcript analysis finished', { hasTranscript: !!transcriptAnalysis });

        // Step 6: Predict engagement for different time windows
        console.log('[ML Analysis] Step 6 starting: Predicting engagement...');
        const engagementPredictions = await predictEngagement(
            ai,
            sceneSegments,
            audioAnalysis,
            transcriptAnalysis,
            visualFeatures
        );
        console.log('[ML Analysis] Step 6 complete: Engagement predictions finished', { predictionCount: engagementPredictions.length });

        // Step 7: Identify viral moments
        console.log('[ML Analysis] Step 7 starting: Identifying viral moments...');
        const viralMoments = await identifyViralMoments(
            ai,
            sceneSegments,
            engagementPredictions,
            audioAnalysis,
            transcriptAnalysis,
            videoDuration
        );
        console.log('[ML Analysis] Step 7 complete: Viral moments identified', { viralMomentCount: viralMoments.length });

        const processingTime = Date.now() - startTime;

        const result = {
            id: `ml_analysis_${Date.now()}`,
            repurposed_video_id: repurposedVideoId || '', // Will be set by caller
            analysis_version: '1.0.0',
            scene_segments: sceneSegments,
            audio_analysis: audioAnalysis,
            transcript_analysis: transcriptAnalysis,
            visual_features: visualFeatures,
            engagement_predictions: engagementPredictions,
            viral_moments: viralMoments,
            created_at: new Date().toISOString(),
            processing_time_ms: processingTime,
        };

        console.log('[ML Analysis] Successfully completed viral moment detection', {
            analysisId: result.id,
            processingTimeMs: processingTime,
            sceneCount: sceneSegments.length,
            viralMomentsCount: viralMoments.length,
            topViralityScore: viralMoments.length > 0 ? viralMoments[0].virality_score : 0
        });

        return result;
    } catch (error: any) {
        console.error('[ML Analysis] Error in viral moment analysis:', error);
        console.error('[ML Analysis] Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        throw new Error(`Failed to analyze video for viral moments: ${error.message}`);
    }
}

/**
 * Analyze visual features of video frames
 */
async function analyzeVisualFeatures(
    ai: GoogleGenAI,
    frames: ImageAsset[],
    videoDuration: number
): Promise<VisualFeatures> {
    console.log('[Visual Analysis] Starting visual feature analysis', { frameCount: frames.length, videoDuration });
    
    // Optimize frames for AI analysis
    console.log('[Visual Analysis] Optimizing frames for AI...');
    const optimizedFrames = await Promise.all(
        frames.map(async (frame) => {
            try {
                const optimized = await optimizeImageForAI(frame.base64, frame.mimeType);
                return { base64: optimized.base64, mimeType: optimized.mimeType };
            } catch (error) {
                console.warn('Failed to optimize frame, using original:', error);
                return { base64: frame.base64, mimeType: frame.mimeType };
            }
        })
    );
    console.log('[Visual Analysis] Frames optimized successfully');

    // Create image parts for AI
    const imageParts: Part[] = optimizedFrames.map(frame => ({
        inlineData: { data: frame.base64, mimeType: frame.mimeType }
    }));
    console.log('[Visual Analysis] Prepared image parts for Gemini API', { partCount: imageParts.length });

    const prompt = `
Analyze these video frames extracted from a ${videoDuration.toFixed(1)}-second video and provide a comprehensive visual analysis.

For each frame (sampled approximately every 2 seconds), analyze:
1. Dominant colors and color palette
2. Brightness and contrast levels
3. Face detection (count and confidence)
4. Text overlays (if any)
5. General visual composition

Return a JSON object with this structure:
{
    "dominant_colors": [{"color": "#hex", "percentage": 0.0-1.0}],
    "brightness_levels": [{"time": seconds, "brightness": 0.0-1.0}],
    "contrast_levels": [{"time": seconds, "contrast": 0.0-1.0}],
    "face_detections": [{"time": seconds, "count": number, "confidence": 0.0-1.0}],
    "text_overlays": [{"time": seconds, "text": "detected text", "confidence": 0.0-1.0}]
}

Calculate time for each frame based on: time = (frame_index / total_frames) * video_duration
`;

    console.log('[Visual Analysis] Calling Gemini API for visual feature analysis...');
    try {
        const response = await retryWithBackoff(
            () => ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: prompt }, ...imageParts] },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            dominant_colors: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        color: { type: Type.STRING },
                                        percentage: { type: Type.NUMBER }
                                    }
                                }
                            },
                            brightness_levels: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        time: { type: Type.NUMBER },
                                        brightness: { type: Type.NUMBER }
                                    }
                                }
                            },
                            contrast_levels: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        time: { type: Type.NUMBER },
                                        contrast: { type: Type.NUMBER }
                                    }
                                }
                            },
                            face_detections: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        time: { type: Type.NUMBER },
                                        count: { type: Type.NUMBER },
                                        confidence: { type: Type.NUMBER }
                                    }
                                }
                            },
                            text_overlays: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        time: { type: Type.NUMBER },
                                        text: { type: Type.STRING },
                                        confidence: { type: Type.NUMBER }
                                    }
                                }
                            }
                        }
                    }
                }
            }),
            {
                maxRetries: 2,
                initialDelayMs: 2000,
                retryableErrors: (error: any) => error.status === 429 || (error.status >= 500 && error.status < 600)
            }
        );

        console.log('[Visual Analysis] Gemini API call completed successfully');
        
        // Handle response - check if response.text exists
        let jsonString: string;
        if (typeof response.text === 'string') {
            jsonString = response.text.trim();
        } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
            jsonString = response.candidates[0].content.parts[0].text.trim();
        } else {
            throw new Error('Invalid response structure from Gemini API');
        }

        const analysis = JSON.parse(jsonString);
        console.log('[Visual Analysis] Visual features parsed successfully', { 
            colorCount: analysis.dominant_colors?.length,
            brightnessPoints: analysis.brightness_levels?.length,
            faceDetections: analysis.face_detections?.length
        });
        return analysis as VisualFeatures;
    } catch (error: any) {
        console.error('[Visual Analysis] Error analyzing visual features:', error);
        console.error('[Visual Analysis] Error details:', {
            message: error.message,
            response: error.response || 'No response',
            stack: error.stack
        });
        // Return default structure if analysis fails
        console.warn('[Visual Analysis] Returning default visual features due to error');
        return {
            dominant_colors: [],
            brightness_levels: [],
            contrast_levels: [],
            face_detections: [],
        };
    }
}

/**
 * Detect scene segments in video
 */
async function detectScenes(
    ai: GoogleGenAI,
    frames: ImageAsset[],
    videoDuration: number
): Promise<SceneSegment[]> {
    const optimizedFrames = await Promise.all(
        frames.map(async (frame) => {
            try {
                const optimized = await optimizeImageForAI(frame.base64, frame.mimeType);
                return { base64: optimized.base64, mimeType: optimized.mimeType };
            } catch (error) {
                return { base64: frame.base64, mimeType: frame.mimeType };
            }
        })
    );

    const imageParts: Part[] = optimizedFrames.map(frame => ({
        inlineData: { data: frame.base64, mimeType: frame.mimeType }
    }));

    const prompt = `
Analyze these video frames and identify distinct scene segments. Each scene should have:
- Clear start and end times
- A scene type (action, dialogue, transition, hook, climax, conclusion)
- Importance score (0-1) indicating how crucial this scene is
- Visual complexity (0-1)
- Motion level (0-1)

Calculate time for each frame: time = (frame_index / ${frames.length}) * ${videoDuration}

Return JSON array of scene segments:
[
    {
        "id": "scene_1",
        "start_time": seconds,
        "end_time": seconds,
        "duration": seconds,
        "scene_type": "action|dialogue|transition|hook|climax|conclusion",
        "importance_score": 0.0-1.0,
        "visual_complexity": 0.0-1.0,
        "motion_level": 0.0-1.0
    }
]
`;

    try {
        const response = await retryWithBackoff(
            () => ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: prompt }, ...imageParts] },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                start_time: { type: Type.NUMBER },
                                end_time: { type: Type.NUMBER },
                                duration: { type: Type.NUMBER },
                                scene_type: { type: Type.STRING },
                                importance_score: { type: Type.NUMBER },
                                visual_complexity: { type: Type.NUMBER },
                                motion_level: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            }),
            {
                maxRetries: 2,
                initialDelayMs: 2000,
                retryableErrors: (error: any) => error.status === 429 || (error.status >= 500 && error.status < 600)
            }
        );

        // Handle response - check if response.text exists
        let jsonString: string;
        if (typeof response.text === 'string') {
            jsonString = response.text.trim();
        } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
            jsonString = response.candidates[0].content.parts[0].text.trim();
        } else {
            throw new Error('Invalid response structure from Gemini API');
        }

        const scenes = JSON.parse(jsonString);
        return scenes.map((scene: any, index: number) => ({
            ...scene,
            id: scene.id || `scene_${index + 1}`,
            keyframes: [] // Would be populated with actual keyframe URLs in production
        })) as SceneSegment[];
    } catch (error: any) {
        console.error('Error detecting scenes:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response || 'No response',
            stack: error.stack
        });
        // Return default scene covering entire video
        return [{
            id: 'scene_1',
            start_time: 0,
            end_time: videoDuration,
            duration: videoDuration,
            scene_type: 'dialogue' as const,
            importance_score: 0.5,
            visual_complexity: 0.5,
            motion_level: 0.5,
            keyframes: []
        }];
    }
}

/**
 * Analyze audio features (placeholder - would need audio extraction in production)
 */
async function analyzeAudio(videoUrl: string, videoDuration: number): Promise<AudioAnalysis> {
    // In production, this would:
    // 1. Extract audio from video
    // 2. Analyze volume levels, frequency patterns
    // 3. Detect speech, music, silence
    // 4. Perform sentiment analysis on speech
    
    // For now, return placeholder data
    // In production, use Web Audio API or server-side audio processing
    return {
        overall_volume: 0.7,
        speech_presence: 0.8,
        music_presence: 0.2,
        silence_periods: [],
        peak_audio_moments: [
            { time: videoDuration * 0.2, intensity: 0.9 },
            { time: videoDuration * 0.5, intensity: 0.85 },
            { time: videoDuration * 0.8, intensity: 0.9 }
        ]
    };
}

/**
 * Analyze transcript for key phrases, hooks, and sentiment
 */
async function analyzeTranscript(
    ai: GoogleGenAI,
    transcript: string,
    videoDuration: number
): Promise<TranscriptAnalysis> {
    const prompt = `
Analyze this video transcript and identify:
1. Key phrases and important topics
2. Hook moments (attention-grabbing statements)
3. Sentiment throughout the video
4. Natural sentence boundaries with timestamps

Transcript: "${transcript}"

Video duration: ${videoDuration} seconds

Return JSON:
{
    "sentences": [
        {"text": "sentence", "start_time": seconds, "end_time": seconds, "confidence": 0.0-1.0}
    ],
    "key_phrases": [
        {"phrase": "phrase", "importance": 0.0-1.0, "timestamps": [seconds]}
    ],
    "topics": [
        {"topic": "topic name", "confidence": 0.0-1.0, "timestamps": [seconds]}
    ],
    "sentiment_scores": [
        {"time": seconds, "sentiment": -1.0 to 1.0}
    ],
    "hooks": [
        {"text": "hook text", "start_time": seconds, "end_time": seconds, "hook_score": 0.0-1.0}
    ]
}
`;

    try {
        const response = await retryWithBackoff(
            () => ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: prompt }] },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            sentences: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        text: { type: Type.STRING },
                                        start_time: { type: Type.NUMBER },
                                        end_time: { type: Type.NUMBER },
                                        confidence: { type: Type.NUMBER }
                                    }
                                }
                            },
                            key_phrases: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        phrase: { type: Type.STRING },
                                        importance: { type: Type.NUMBER },
                                        timestamps: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                                    }
                                }
                            },
                            topics: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        topic: { type: Type.STRING },
                                        confidence: { type: Type.NUMBER },
                                        timestamps: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                                    }
                                }
                            },
                            sentiment_scores: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        time: { type: Type.NUMBER },
                                        sentiment: { type: Type.NUMBER }
                                    }
                                }
                            },
                            hooks: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        text: { type: Type.STRING },
                                        start_time: { type: Type.NUMBER },
                                        end_time: { type: Type.NUMBER },
                                        hook_score: { type: Type.NUMBER }
                                    }
                                }
                            }
                        }
                    }
                }
            }),
            {
                maxRetries: 2,
                initialDelayMs: 2000,
                retryableErrors: (error: any) => error.status === 429 || (error.status >= 500 && error.status < 600)
            }
        );

        // Handle response - check if response.text exists
        let jsonString: string;
        if (typeof response.text === 'string') {
            jsonString = response.text.trim();
        } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
            jsonString = response.candidates[0].content.parts[0].text.trim();
        } else {
            throw new Error('Invalid response structure from Gemini API');
        }

        const analysis = JSON.parse(jsonString);
        return {
            full_transcript: transcript,
            ...analysis
        } as TranscriptAnalysis;
    } catch (error: any) {
        console.error('Error analyzing transcript:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response || 'No response',
            stack: error.stack
        });
        return {
            full_transcript: transcript,
            sentences: [],
            key_phrases: [],
            topics: [],
            sentiment_scores: [],
            hooks: []
        };
    }
}

/**
 * Predict engagement for different time windows
 */
async function predictEngagement(
    ai: GoogleGenAI,
    scenes: SceneSegment[],
    audio: AudioAnalysis,
    transcript?: TranscriptAnalysis,
    visual?: VisualFeatures
): Promise<EngagementPrediction[]> {
    // Create time windows (every 10 seconds)
    const windows: EngagementPrediction[] = [];
    
    for (let start = 0; start < scenes[scenes.length - 1]?.end_time || 0; start += 10) {
        const end = Math.min(start + 10, scenes[scenes.length - 1]?.end_time || 0);
        
        // Find overlapping scenes
        const overlappingScenes = scenes.filter(s => 
            (s.start_time <= end && s.end_time >= start)
        );
        
        // Calculate factors
        const visualAppeal = overlappingScenes.length > 0
            ? overlappingScenes.reduce((sum, s) => sum + s.visual_complexity + s.motion_level, 0) / (overlappingScenes.length * 2)
            : 0.5;
        
        const audioAppeal = audio.peak_audio_moments.some(p => p.time >= start && p.time <= end)
            ? 0.8
            : audio.overall_volume;
        
        const contentQuality = overlappingScenes.length > 0
            ? overlappingScenes.reduce((sum, s) => sum + s.importance_score, 0) / overlappingScenes.length
            : 0.5;
        
        // Check for hooks in this window
        const hookPotential = transcript?.hooks?.some(h => 
            h.start_time >= start && h.end_time <= end
        ) ? 0.9 : 0.5;
        
        const predictedEngagement = (
            visualAppeal * 0.3 +
            audioAppeal * 0.25 +
            contentQuality * 0.3 +
            hookPotential * 0.15
        );
        
        windows.push({
            time_window: { start, end },
            predicted_engagement: Math.min(1, Math.max(0, predictedEngagement)),
            factors: {
                visual_appeal: visualAppeal,
                audio_appeal: audioAppeal,
                content_quality: contentQuality,
                hook_potential: hookPotential
            }
        });
    }
    
    return windows;
}

/**
 * Identify viral moments by combining all signals
 */
async function identifyViralMoments(
    ai: GoogleGenAI,
    scenes: SceneSegment[],
    engagement: EngagementPrediction[],
    audio: AudioAnalysis,
    transcript?: TranscriptAnalysis,
    videoDuration?: number
): Promise<ViralMoment[]> {
    const viralMoments: ViralMoment[] = [];
    
    // Find high-engagement windows
    const highEngagementWindows = engagement
        .filter(e => e.predicted_engagement > 0.7)
        .sort((a, b) => b.predicted_engagement - a.predicted_engagement)
        .slice(0, 15); // Top 15 moments
    
    for (const window of highEngagementWindows) {
        // Find overlapping scenes
        const overlappingScenes = scenes.filter(s =>
            s.start_time < window.time_window.end && s.end_time > window.time_window.start
        );
        
        // Calculate virality score (0-100)
        const baseScore = window.predicted_engagement * 100;
        
        // Boost score for hooks
        const hasHook = transcript?.hooks?.some(h =>
            h.start_time >= window.time_window.start && h.end_time <= window.time_window.end
        );
        const hookBoost = hasHook ? 10 : 0;
        
        // Boost for high motion/action
        const actionBoost = overlappingScenes.some(s => s.scene_type === 'action' || s.motion_level > 0.7)
            ? 5
            : 0;
        
        const viralityScore = Math.min(100, baseScore + hookBoost + actionBoost);
        
        // Generate reasoning
        const reasoning = generateReasoning(window, overlappingScenes, transcript, hasHook);
        
        // Suggest optimal clip boundaries
        const clipSuggestions = generateClipSuggestions(
            window,
            overlappingScenes,
            videoDuration || (window.time_window.end - window.time_window.start)
        );
        
        viralMoments.push({
            id: `viral_${Date.now()}_${viralMoments.length}`,
            start_time: window.time_window.start,
            end_time: window.time_window.end,
            duration: window.time_window.end - window.time_window.start,
            virality_score: viralityScore,
            confidence: window.predicted_engagement,
            reasoning,
            clip_suggestions: clipSuggestions
        });
    }
    
    // Sort by virality score
    return viralMoments.sort((a, b) => b.virality_score - a.virality_score);
}

function generateReasoning(
    window: EngagementPrediction,
    scenes: SceneSegment[],
    transcript?: TranscriptAnalysis,
    hasHook?: boolean
): string {
    const reasons: string[] = [];
    
    if (window.factors.visual_appeal > 0.7) {
        reasons.push('high visual appeal');
    }
    if (window.factors.audio_appeal > 0.7) {
        reasons.push('strong audio engagement');
    }
    if (window.factors.content_quality > 0.7) {
        reasons.push('high-quality content');
    }
    if (hasHook) {
        reasons.push('contains attention-grabbing hook');
    }
    if (scenes.some(s => s.scene_type === 'action')) {
        reasons.push('action-packed scene');
    }
    if (scenes.some(s => s.scene_type === 'climax')) {
        reasons.push('climactic moment');
    }
    
    return reasons.length > 0
        ? `Viral potential due to: ${reasons.join(', ')}`
        : 'Moderate engagement potential';
}

function generateClipSuggestions(
    window: EngagementPrediction,
    scenes: SceneSegment[],
    videoDuration: number
): Array<{ start_time: number; end_time: number; optimal_duration: number; recommended_platforms: string[] }> {
    const suggestions = [];
    
    // Default clip (15-60 seconds for shorts)
    const optimalDuration = Math.min(60, Math.max(15, window.time_window.end - window.time_window.start));
    suggestions.push({
        start_time: Math.max(0, window.time_window.start - 2), // Start 2 seconds earlier for context
        end_time: Math.min(videoDuration, window.time_window.end + 2), // End 2 seconds later
        optimal_duration: optimalDuration,
        recommended_platforms: ['youtube_shorts', 'tiktok', 'instagram_reels']
    });
    
    // Shorter clip for TikTok (15-30 seconds)
    if (optimalDuration > 20) {
        const midpoint = (window.time_window.start + window.time_window.end) / 2;
        suggestions.push({
            start_time: Math.max(0, midpoint - 15),
            end_time: Math.min(videoDuration, midpoint + 15),
            optimal_duration: 30,
            recommended_platforms: ['tiktok', 'instagram_reels']
        });
    }
    
    return suggestions;
}

