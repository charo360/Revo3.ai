import React, { useState, FC, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { toast } from 'react-toastify';
import {
    Platform, ImageAsset, VideoAsset, LogoState, TextState, ColorsState, 
    PreferencesState, DesignResult, AnalysisResult, AssistantMessage, 
    EditorState, EditableElement, ImagenAspectRatio, VeoAspectRatio
} from './types';
import { VIBE_STYLES, PLATFORM_CONFIGS } from './constants';
import { 
    generateDesign, adaptImageForPlatform, generateImage, editImage, 
    upscaleImage, analyzeVideoAndSuggestStyles, extractFacesFromImage, 
    getAssistantResponse 
} from './core/services/ai-providers/gemini';
import { extractFramesFromVideo } from './shared/utils/video-utils';
import { loadPreferences, savePreferences, loadEditorState, saveEditorState, clearEditorState } from './shared/utils/storage-utils';
import { Header } from './components/layout/Header';
import { Canvas } from './components/layout/Canvas';
// Sidebar will be imported from components/modules/Sidebar
import { Sidebar } from './components/modules/Sidebar';
import { MagicStudioModal } from './components/modals/MagicStudioModal';
import { PreviewModal } from './components/modals/PreviewModal';
import { AssistantPanel } from './components/modals/AssistantPanel';
import { Editor } from './components/modals/Editor';
import { RepurposeModule } from './features/content-repurpose/components/RepurposeModule';
import { CreditManagement } from './components/dashboard/CreditManagement';
import { useAuth } from './contexts/AuthContext';
import { hasEnoughCredits, deductCredits, CREDITS_PER_GENERATION } from './services/payments/creditService';

declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        readonly aistudio: AIStudio;
    }
}

interface AppProps {
    initialPlatform?: Platform;
    onPlatformChange?: (platform: Platform) => void;
}

export const App: FC<AppProps> = ({ initialPlatform = 'youtube_improve', onPlatformChange }) => {
    const { user } = useAuth();
    // Input state
    const [platform, setPlatform] = useState<Platform>(initialPlatform);
    
    // Update platform when initialPlatform prop changes
    useEffect(() => {
        setPlatform(initialPlatform);
    }, [initialPlatform]);
    
    // Handle platform change
    const handlePlatformChange = (newPlatform: Platform) => {
        setPlatform(newPlatform);
        if (onPlatformChange) {
            onPlatformChange(newPlatform);
        }
    };
    
    const [images, setImages] = useState<ImageAsset[]>([]);
    const [videoAsset, setVideoAsset] = useState<VideoAsset | null>(null);
    const [trimTimes, setTrimTimes] = useState({ start: 0, end: 1 });
    const [cutoutAssets, setCutoutAssets] = useState<ImageAsset[]>([]);
    const [isExtractingFaces, setIsExtractingFaces] = useState(false);
    const [text, setText] = useState<TextState>({
        headline: '', headlineFont: 'Inter', headlineSize: 48, headlineWeight: 'bold', headlineItalic: false, headlineColor: '#FFFFFF',
        subheadline: '', subheadlineFont: 'Inter', subheadlineSize: 24, subheadlineWeight: 'normal', subheadlineItalic: false, subheadlineColor: '#FFFFFF',
        author: ''
    });
    const [logo, setLogo] = useState<LogoState>({
        url: null, base64: null, mimeType: null,
        size: 10, position: 'bottom-right', opacity: 1,
    });
    const [youtubeTranscript, setYoutubeTranscript] = useState<string | null>(null);
    const [originalYoutubeTitle, setOriginalYoutubeTitle] = useState<string>('');

    // Load preferences from localStorage
    const prefs = loadPreferences();
    const [colors, setColors] = useState<ColorsState>(prefs.colors);
    const [preferences, setPreferences] = useState<PreferencesState>(prefs.preferences);
    
    // App status state
    const [results, setResults] = useState<DesignResult[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [editingImage, setEditingImage] = useState<ImageAsset | null>(null);
    const [editorState, setEditorState] = useState<EditorState | null>(null);
    const [previewingImage, setPreviewingImage] = useState<ImageAsset | null>(null);

    // AI Assistant State
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const [isAssistantProcessing, setIsAssistantProcessing] = useState(false);
    const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([
        { id: 1, sender: 'ai', text: "Hello! I'm your AI design assistant. How can I help you? You can ask me to change text, colors, or even suggest ideas." }
    ]);

    // Mobile Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Get API key from environment variables
    // vite.config.ts defines process.env.API_KEY from GEMINI_API_KEY env var at build time
    // The define option in vite.config.ts replaces process.env.API_KEY with the actual value
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - process.env.API_KEY is defined in vite.config.ts via define option
    const apiKey = process.env.API_KEY || 
                   import.meta.env.VITE_GEMINI_API_KEY || 
                   import.meta.env.GEMINI_API_KEY || 
                   '';
    const ai = useRef<GoogleGenAI>(new GoogleGenAI({ apiKey }));
    
    // Save preferences to localStorage on change
    useEffect(() => {
        savePreferences(colors, preferences);
    }, [preferences, colors]);

    // Check for a saved editor session on initial load
    useEffect(() => {
        const savedState = loadEditorState();
        if (savedState) {
            if (window.confirm("You have a saved editor project. Would you like to restore it?")) {
                setEditorState(savedState);
            } else {
                clearEditorState();
            }
        }
    }, []);

    const handleGenerate = async () => {
        if (isGenerating) {
            console.log('[Generate] Already generating, ignoring click');
            return;
        }

        // Check if API key is available
        // vite.config.ts defines process.env.API_KEY via define option, replacing it at build time
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - process.env.API_KEY is defined in vite.config.ts via define option
        const currentApiKey = process.env.API_KEY || 
                              import.meta.env.VITE_GEMINI_API_KEY || 
                              import.meta.env.GEMINI_API_KEY || 
                              '';
        
        console.log('[Generate] API key check:', { 
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            hasProcessEnv: !!process.env.API_KEY,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            processEnvValue: process.env.API_KEY ? 
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                String(process.env.API_KEY).substring(0, 10) + '...' : 'N/A',
            hasViteGemini: !!import.meta.env.VITE_GEMINI_API_KEY,
            hasGemini: !!import.meta.env.GEMINI_API_KEY,
            hasCurrentKey: !!currentApiKey,
            currentKeyLength: currentApiKey ? currentApiKey.length : 0
        });
        
        if (!currentApiKey) {
            console.error('[Generate] API key not found in environment variables');
            
            // Try to use AI Studio key selection as fallback
            if (typeof window !== 'undefined' && window.aistudio) {
                try {
                    const hasKey = await window.aistudio.hasSelectedApiKey();
                    if (!hasKey) {
                        toast.info('Please select your API key to continue...');
                        await window.aistudio.openSelectKey();
                        // After key selection, try again - user will need to click generate again
                        toast.info('API key selected. Please click Generate again.');
                        return;
                    }
                    // If AI Studio has a key, continue (it will be used by the SDK)
                    console.log('[Generate] Using AI Studio selected API key');
                } catch (studioError) {
                    console.error('[Generate] Error checking AI Studio key:', studioError);
                    toast.error('API key not configured. Please set GEMINI_API_KEY in your .env file or select a key in AI Studio.');
                    return;
                }
            } else {
                toast.error(
                    'API key not configured. Please:\n' +
                    '1. Set GEMINI_API_KEY in your .env.local file\n' +
                    '2. Restart your dev server (npm run dev)',
                    { autoClose: 8000 }
                );
                return;
            }
        } else {
            // Update AI instance with current API key if it changed
            if (currentApiKey !== apiKey) {
                console.log('[Generate] Updating AI instance with new API key');
                ai.current = new GoogleGenAI({ apiKey: currentApiKey });
            }
        }

        console.log('[Generate] Starting generation process...', { 
            platform, 
            hasUser: !!user, 
            userId: user?.id,
            hasImages: images.length > 0,
            hasVideo: !!videoAsset,
            hasText: !!text.headline || !!text.subheadline,
            hasApiKey: !!apiKey
        });

        setIsGenerating(true);
        setResults([]);
        // Close sidebar on mobile after starting generation
        setIsSidebarOpen(false);
        
        console.log('[Generate] Set generating state to true, starting design generation...');

        // Check credits before generating (after setting loading state)
        if (user) {
            try {
                console.log('[Generate] Checking credits for user:', user.id);
                const creditCheckStart = Date.now();
                const hasCredits = await hasEnoughCredits(user.id, CREDITS_PER_GENERATION);
                const creditCheckDuration = Date.now() - creditCheckStart;
                console.log('[Generate] Credit check result:', hasCredits, `(took ${creditCheckDuration}ms)`);
                if (!hasCredits) {
                    setIsGenerating(false);
                    toast.error(`Insufficient credits. You need ${CREDITS_PER_GENERATION} credits to generate designs. Please purchase credits to continue.`);
                    return;
                }
            } catch (creditError: any) {
                console.error('[Generate] Error checking credits:', creditError);
                console.error('[Generate] Credit error stack:', creditError.stack);
                setIsGenerating(false);
                toast.error(`Error checking credits: ${creditError.message || 'Unknown error'}. Please try again.`);
                return;
            }
        } else {
            console.warn('[Generate] No user logged in, proceeding without credit check');
        }
        
        console.log('[Generate] Credit check passed, proceeding to frame extraction...');

        try {
            console.log('[Generate] Extracting video frames if video exists...');
            let videoFrames: ImageAsset[] = [];
            if (videoAsset) {
                try {
                    videoFrames = await extractFramesFromVideo(videoAsset.url, trimTimes.start, trimTimes.end, 3);
                    console.log('[Generate] Extracted video frames:', videoFrames.length);
                } catch (frameError: any) {
                    const errorMessage = frameError.message || 'Unknown error';
                    console.warn('[Generate] Frame extraction error:', errorMessage);
                    if (errorMessage.includes('YouTube') || errorMessage.includes('CORS')) {
                        toast.warning(
                            'Cannot extract frames from YouTube URL. Using uploaded images only. ' +
                            'For YouTube videos, use the "Improve Thumbnail" feature instead.',
                            { autoClose: 5000 }
                        );
                        // Continue with just images, don't fail the entire generation
                        videoFrames = [];
                    } else {
                        throw frameError; // Re-throw other errors
                    }
                }
            }
            
            const allImages = [...images, ...videoFrames];
            console.log('[Generate] Total images for generation:', allImages.length, { 
                uploadedImages: images.length, 
                videoFrames: videoFrames.length 
            });
            
            console.log('[Generate] Calling generateDesign with:', {
                platform,
                imageCount: allImages.length,
                hasLogo: !!logo.base64,
                hasTranscript: !!youtubeTranscript,
                hasOriginalTitle: !!originalYoutubeTitle,
                headline: text.headline,
                subheadline: text.subheadline
            });
            
            const results = await generateDesign(ai.current, allImages, logo, colors, preferences, platform, youtubeTranscript, originalYoutubeTitle, text);
            
            console.log('[Generate] Design generation completed, results:', results.length);
            
            // Deduct credits after successful generation
            if (user) {
                try {
                    const platformName = PLATFORM_CONFIGS[platform].title;
                    await deductCredits(user.id, `Generate ${platformName}`, CREDITS_PER_GENERATION, { platform });
                    console.log('[Generate] Credits deducted successfully');
                } catch (deductError: any) {
                    console.error('[Generate] Error deducting credits:', deductError);
                    // Don't fail the generation if credit deduction fails, but log it
                    toast.warning('Designs generated but there was an issue recording credit usage.');
                }
            }
            
            setResults(results);
            console.log('[Generate] Results set, showing success message');
            toast.success('Designs generated successfully!');
        } catch (e: any) {
            console.error('[Generate] Error during generation:', e);
            console.error('[Generate] Error stack:', e.stack);
            const errorMessage = e.message || 'Failed to generate designs';
            toast.error(`An error occurred: ${errorMessage}`);
        } finally {
            console.log('[Generate] Setting generating state to false');
            setIsGenerating(false);
        }
    };

    const handleAnalyzeVideo = async () => {
        if (!videoAsset || isAnalyzing) return;
        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const frames = await extractFramesFromVideo(videoAsset.url, trimTimes.start, trimTimes.end, 5);
            const result = await analyzeVideoAndSuggestStyles(ai.current, frames);
            setAnalysisResult(result);
            setColors(result.suggestedColors);
            setPreferences(prev => ({ ...prev, style: result.suggestedStyle }));
            toast.success('Video analyzed successfully!');
        } catch (e: any) {
            console.error(e);
            const errorMessage = e.message || 'Unknown error';
            if (errorMessage.includes('YouTube') || errorMessage.includes('CORS')) {
                toast.error(
                    errorMessage + ' Please use the "Improve Thumbnail" feature for YouTube videos, or download and upload the video file.',
                    { autoClose: 6000 }
                );
            } else {
                toast.error(`Failed to analyze video: ${errorMessage}`);
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleExtractFaces = async () => {
        if (!videoAsset || isExtractingFaces) return;
        setIsExtractingFaces(true);
        try {
            const frame = (await extractFramesFromVideo(videoAsset.url, trimTimes.start, trimTimes.end, 1))[0];
            if (!frame) {
                throw new Error("Could not extract a frame from the video.");
            }
            const faces = await extractFacesFromImage(ai.current, frame);
            setCutoutAssets(prev => [...prev, ...faces]);
            toast.success(`Extracted ${faces.length} face(s) successfully!`);
        } catch (e: any) {
            console.error('[ExtractFaces] Error:', e);
            const errorMessage = e.message || 'Unknown error';
            if (errorMessage.includes('YouTube') || errorMessage.includes('CORS')) {
                toast.error(
                    errorMessage + ' Please use the "Improve Thumbnail" feature for YouTube videos, or download and upload the video file.',
                    { autoClose: 6000 }
                );
            } else if (errorMessage.includes('No faces were detected') || errorMessage.includes('did not find any faces')) {
                toast.warning(
                    'No faces were detected in the video frame. Make sure the video contains clear, visible human faces.',
                    { autoClose: 6000 }
                );
            } else {
                toast.error(`Failed to extract faces: ${errorMessage}`, { autoClose: 6000 });
            }
        } finally {
            setIsExtractingFaces(false);
        }
    };

    const handleOpenEditor = (result: DesignResult) => {
        if (!result.image) return;

        const platformConfig = PLATFORM_CONFIGS[platform];
        const [width, height] = platformConfig.aspectRatio.split(':').map(Number);
        const canvasHeight = 720;
        const canvasWidth = (canvasHeight / height) * width;

        const headlineContent = result.suggestedHeadline || text.headline;
        const subheadlineContent = result.suggestedSubheadline || text.subheadline;

        const headlineElement: EditableElement = {
            id: `text_${Date.now()}`, type: 'text',
            x: canvasWidth * 0.1, y: canvasHeight * 0.65,
            width: canvasWidth * 0.8, height: 100, rotation: 0,
            content: headlineContent, fontFamily: text.headlineFont, fontSize: text.headlineSize,
            fontWeight: text.headlineWeight, fontStyle: text.headlineItalic ? 'italic' : 'normal', color: text.headlineColor,
        };
        const subheadlineElement: EditableElement = {
            id: `text_${Date.now()+1}`, type: 'text',
            x: canvasWidth * 0.1, y: canvasHeight * 0.8,
            width: canvasWidth * 0.8, height: 50, rotation: 0,
            content: subheadlineContent, fontFamily: text.subheadlineFont, fontSize: text.subheadlineSize,
            fontWeight: text.subheadlineWeight, fontStyle: text.subheadlineItalic ? 'italic' : 'normal', color: text.subheadlineColor,
        };

        const newEditorState: EditorState = {
            background: result.image,
            elements: [headlineElement, subheadlineElement].filter(el => el.content),
            aspectRatio: platformConfig.aspectRatio,
        };
        setEditorState(newEditorState);
        saveEditorState(newEditorState);
    };
    
    const handleCloseEditor = () => {
        setEditorState(null);
        clearEditorState();
    };

    const handleAdaptDesign = async (sourceImage: ImageAsset, targetPlatform: Platform) => {
        if (isGenerating) return;

        setIsGenerating(true);
        setResults([]);
        setPlatform(targetPlatform);

        try {
            const adaptedResults = await adaptImageForPlatform(ai.current, sourceImage, targetPlatform, text, logo, colors, preferences);
            setResults(adaptedResults);
            toast.success('Design adapted successfully!');
        } catch (e: any) {
            console.error(e);
            toast.error(`An error occurred during adaptation: ${e.message || 'Unknown error'}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateImage = async (prompt: string, negativePrompt: string, aspectRatio: ImagenAspectRatio): Promise<ImageAsset | null> => {
        // Check credits before generating
        if (user) {
            const hasCredits = await hasEnoughCredits(user.id, CREDITS_PER_GENERATION);
            if (!hasCredits) {
                toast.error(`Insufficient credits. You need ${CREDITS_PER_GENERATION} credits to generate images. Please purchase credits to continue.`);
                return null;
            }
        }

        setIsGeneratingImage(true);
        try {
            const image = await generateImage(ai.current, prompt, negativePrompt, aspectRatio);
            if (image) {
                // Deduct credits after successful generation
                if (user) {
                    await deductCredits(user.id, 'Generate AI Image', CREDITS_PER_GENERATION, { feature: 'image_generation', aspectRatio });
                }
                setImages(prev => [...prev, image]);
                toast.success('Image generated successfully!');
            }
            return image;
        } catch (e: any) {
            console.error(e);
            toast.error(`Image generation failed: ${e.message || 'Unknown error'}`);
            return null;
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleGenerateVideo = async (prompt: string, aspectRatio: VeoAspectRatio) => {
        // Check credits before generating (videos cost more - using 2 credits for now)
        if (user) {
            const hasCredits = await hasEnoughCredits(user.id, CREDITS_PER_GENERATION);
            if (!hasCredits) {
                toast.error(`Insufficient credits. You need ${CREDITS_PER_GENERATION} credits to generate videos. Please purchase credits to continue.`);
                return;
            }
        }

        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await window.aistudio.openSelectKey();
        }

        setIsGeneratingVideo(true);
        setVideoAsset(null);

        try {
            const localAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let operation = await localAi.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio,
                }
            });
            
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await localAi.operations.getVideosOperation({ operation: operation });
            }
            
            if (operation.error) {
                throw new Error(`Video generation failed: ${operation.error.message}`);
            }
    
            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (!downloadLink) {
                throw new Error("Video generation succeeded but no download link was provided.");
            }
            
            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            if (!videoResponse.ok) {
                const errorText = await videoResponse.text();
                if (errorText.includes("Requested entity was not found")) {
                    await window.aistudio.openSelectKey();
                    throw new Error("API Key issue. Please select your key and try generating again.");
                }
                throw new Error(`Failed to download the generated video. Status: ${videoResponse.status}`);
            }
            
            const videoBlob = await videoResponse.blob();
            const videoFile = new File([videoBlob], `generated-video-${Date.now()}.mp4`, { type: 'video/mp4' });
            const videoUrl = URL.createObjectURL(videoFile);
            
            // Deduct credits after successful generation
            if (user) {
                await deductCredits(user.id, 'Generate AI Video', CREDITS_PER_GENERATION, { feature: 'video_generation', aspectRatio });
            }
            
            setVideoAsset({
                id: `gen_vid_${Date.now()}`,
                file: videoFile,
                url: videoUrl
            });
            toast.success('Video generated successfully!');
    
        } catch (e: any) {
            console.error(e);
            toast.error(`An error occurred during video generation: ${e.message || 'Unknown error'}`);
        } finally {
            setIsGeneratingVideo(false);
        }
    };

    const handleConfirmEdit = async (originalImage: ImageAsset, prompt: string, mask: ImageAsset | null) => {
        const originalId = originalImage.id;
        const resultIndex = results.findIndex(r => r.image?.id === originalId);
        if (resultIndex === -1) return;

        setResults(prev => prev.map((r, i) => i === resultIndex ? { ...r, isEditing: true } : r));
        setEditingImage(null);

        try {
            const editedImage = await editImage(ai.current, originalImage, prompt, mask);
            const newResults = results.map(r => r.image?.id === originalId ? { ...r, image: editedImage } : r);
            setResults(newResults);
            toast.success('Image edited successfully!');
        } catch(e: any) {
            console.error(e);
            toast.error(`Failed to edit image: ${e.message || 'Unknown error'}`);
        } finally {
            setResults(prev => prev.map((r, i) => i === resultIndex ? { ...r, isEditing: false } : r));
        }
    };
    
    const handleUpscaleImage = async (imageToUpscale: ImageAsset) => {
        const originalId = imageToUpscale.id;
        const resultIndex = results.findIndex(r => r.image?.id === originalId);
        if (resultIndex === -1) return;
        
        setResults(prev => prev.map((r, i) => i === resultIndex ? { ...r, isUpscaling: true } : r));

        try {
            const upscaledImage = await upscaleImage(ai.current, imageToUpscale);
            const newResults = results.map(r => r.image?.id === originalId ? { ...r, image: upscaledImage } : r);
            setResults(newResults);
            toast.success('Image upscaled successfully!');
        } catch(e: any) {
            console.error(e);
            toast.error(`Failed to upscale image: ${e.message || 'Unknown error'}`);
        } finally {
            setResults(prev => prev.map((r, i) => i === resultIndex ? { ...r, isUpscaling: false } : r));
        }
    };

    const handleDownloadImage = (imageToDownload: ImageAsset) => {
        const link = document.createElement('a');
        link.href = imageToDownload.url;
        link.download = `ai-design-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAssistantSubmit = async (message: string) => {
        const newUserMessage: AssistantMessage = { id: Date.now(), sender: 'user', text: message };
        setAssistantMessages(prev => [...prev, newUserMessage]);
        setIsAssistantProcessing(true);
    
        try {
            const response = await getAssistantResponse(ai.current, message, { text, colors, preferences });
            
            let newColors = colors;
            let shouldRecolor = false;
    
            // Apply state changes from AI response
            if (response.action) {
                switch (response.action) {
                    case 'update_text':
                        setText(prev => ({...prev, [response.payload.field]: response.payload.value}));
                        break;
                    case 'update_color':
                        const updatedSingle = { ...colors, [response.payload.color]: response.payload.value };
                        setColors(updatedSingle);
                        newColors = updatedSingle;
                        shouldRecolor = true;
                        break;
                    case 'suggest_colors':
                        setColors(response.payload.colors);
                        newColors = response.payload.colors;
                        shouldRecolor = true;
                        break;
                    case 'update_preference':
                        setPreferences(prev => ({...prev, [response.payload.field]: response.payload.value}));
                        break;
                }
            }
            
            const newAiMessage: AssistantMessage = {
                id: Date.now() + 1,
                sender: 'ai',
                text: response.responseMessage,
                isActionableSuggestion: response.action?.startsWith('suggest_')
            };
            setAssistantMessages(prev => [...prev, newAiMessage]);
    
            // If a color change was requested and there are designs on screen, recolor them live.
            if (shouldRecolor && results.length > 0) {
                setResults(prev => prev.map(r => ({ ...r, isEditing: true })));
    
                const recolorPromises = results.map(result => {
                    if (!result.image) return Promise.resolve(result);
                    const prompt = `Recolor this entire image to match a new color palette. The new palette is: Primary: ${newColors.primary}, Secondary: ${newColors.secondary}, Accent: ${newColors.accent}, Background: ${newColors.background}. IMPORTANT: Do NOT change the content, subjects, or composition of the image. Only alter the existing colors to match the new palette harmoniously.`;
                    
                    return editImage(ai.current, result.image, prompt, null).then(recoloredImage => ({
                        ...result,
                        image: recoloredImage,
                    })).catch(err => {
                        console.error("Recoloring failed for one image:", err);
                        toast.warning(`Failed to recolor one image: ${err.message || 'Unknown error'}`);
                        return { ...result };
                    });
                });
    
                const newResults = await Promise.all(recolorPromises);
                setResults(newResults.map(r => ({ ...r, isEditing: false })));
                toast.success('Designs recolored successfully!');
    
                const completionMessage: AssistantMessage = {
                    id: Date.now() + 2,
                    sender: 'ai',
                    text: "All done! How do the new colors look?"
                };
                setAssistantMessages(prev => [...prev, completionMessage]);
            }
    
        } catch (e: any) {
            console.error("Assistant Error:", e);
            toast.error(`Assistant error: ${e.message || 'Unknown error'}`);
            const errorAiMessage: AssistantMessage = {
                id: Date.now() + 1,
                sender: 'ai',
                text: "Sorry, I encountered an error. Please try again."
            };
            setAssistantMessages(prev => [...prev, errorAiMessage]);
        } finally {
            setIsAssistantProcessing(false);
        }
    };

    return (
        <div className="app-container">
            <Header 
                platform={platform} 
                onPlatformChange={handlePlatformChange}
                onSidebarToggle={() => setIsSidebarOpen(prev => !prev)}
                isSidebarOpen={isSidebarOpen}
            />
            {platform === 'repurpose' ? (
                /* Content Repurpose Module - generates short viral videos */
                <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                    <RepurposeModule />
                </div>
            ) : (
                /* Design Studio - generates thumbnails and images */
                <main className="main-content">
                    {/* Credit Management - shown after Twitter Card */}
                    {platform === 'twitter_card' && (
                        <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
                            <CreditManagement />
                        </div>
                    )}
                    {/* Mobile Sidebar Overlay */}
                    {isSidebarOpen && (
                        <div 
                            className="sidebar-overlay"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}
                    <Sidebar
                        platform={platform}
                        text={text} onTextChange={setText}
                        images={images} onImagesChange={setImages}
                        videoAsset={videoAsset} onVideoAssetChange={setVideoAsset}
                        trimTimes={trimTimes} onTrimTimesChange={setTrimTimes}
                        isAnalyzing={isAnalyzing} onAnalyzeVideo={handleAnalyzeVideo}
                        analysisResult={analysisResult} onAnalysisResultChange={setAnalysisResult}
                        onExtractFaces={handleExtractFaces} isExtractingFaces={isExtractingFaces}
                        logo={logo} onLogoChange={setLogo}
                        colors={colors} onColorsChange={setColors}
                        preferences={preferences} onPreferencesChange={setPreferences}
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                        onGenerateImage={handleGenerateImage}
                        isGeneratingImage={isGeneratingImage}
                        onGenerateVideo={handleGenerateVideo}
                        isGeneratingVideo={isGeneratingVideo}
                        onTranscriptChange={setYoutubeTranscript}
                        onOriginalTitleChange={setOriginalYoutubeTitle}
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                    <Canvas
                        results={results}
                        isGenerating={isGenerating}
                        platform={platform}
                        onEdit={handleOpenEditor}
                        onAiEdit={(image) => setEditingImage(image)}
                        onUpscale={handleUpscaleImage}
                        onDownload={handleDownloadImage}
                        onPreview={(image) => setPreviewingImage(image)}
                        onAdapt={handleAdaptDesign}
                        onAssistantToggle={() => setIsAssistantOpen(prev => !prev)}
                    />
                </main>
            )}
            {editorState && (
                <Editor
                    initialState={editorState}
                    onClose={handleCloseEditor}
                    assets={cutoutAssets}
                />
            )}
            {editingImage && (
                <MagicStudioModal
                    image={editingImage}
                    onConfirm={handleConfirmEdit}
                    onCancel={() => setEditingImage(null)}
                />
            )}
            {previewingImage && (
                <PreviewModal
                    image={previewingImage}
                    onCancel={() => setPreviewingImage(null)}
                />
            )}
            {isAssistantOpen && (
                <AssistantPanel
                    messages={assistantMessages}
                    isProcessing={isAssistantProcessing}
                    onSubmit={handleAssistantSubmit}
                    onClose={() => setIsAssistantOpen(false)}
                />
            )}
        </div>
    );
};
