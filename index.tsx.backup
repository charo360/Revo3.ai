import React, { useState, FC, useRef, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Part, Type, Modality, GenerateContentResponse } from "@google/genai";

declare const html2canvas: any;

// FIX: To resolve conflicts with other global declarations of 'aistudio',
// the AIStudio interface is moved inside `declare global` to ensure it merges
// correctly with any other global declarations of the same name.
declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        readonly aistudio: AIStudio;
    }
}

const ICONS = {
    YOUTUBE: <svg viewBox="0 0 24 24"><path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-2.3,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z"></path></svg>,
    PODCAST: <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"></path></svg>,
    VIDEO: <svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"></path></svg>,
    TWITTER: <svg viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.67.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.22-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.52 8.52 0 0 1-5.33 1.84c-.34 0-.68-.02-1.01-.06C3.8 20.34 6.28 21 8.98 21c7.17 0 11.08-5.93 11.08-11.08v-.5C21.16 8.55 21.89 7.33 22.46 6z"></path></svg>,
    TIKTOK: <svg viewBox="0 0 24 24"><path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 1 1 12.29 10a4.278 4.278 0 0 1 4.31-4.18V2.41a6.669 6.669 0 0 0-4.31 1.37v6.4a2.14 2.14 0 1 1-2.14-2.14h2.14V5.82z"></path></svg>,
    IMAGE: <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path></svg>,
    TEXT: <svg viewBox="0 0 24 24"><path d="M12.94 4.31h-1.89L7.68 15.69h2.09l.8-2.26h2.8l.82 2.26h2.1L12.94 4.31zm-1.12 7.5L12.5 6.6l.68 5.21h-1.36zm7.03-5.37v1.11h-4.3v2.28h3.94v1.1h-3.94v2.28h4.3v1.11h-5.46V6.44h5.46z"></path></svg>,
    LOGO: <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4.2-5.7L12 16.5l4.2-2.2-1.7-4.6-2.5 1.4-2.5-1.4-1.7 4.6z"></path></svg>,
    COLOR: <svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4c-.83 0-1.5-.67-1.5-1.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path></svg>,
    PREFERENCES: <svg viewBox="0 0 24 24"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"></path></svg>,
    GENERATE: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>,
    EDIT: <svg viewBox="0 0 24 24"><path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"></path></svg>,
    UPSCALE: <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 2h-2v3h-3v2h5v-5zm-3-2V5h-2v5h5V7h-3z"></path></svg>,
    DOWNLOAD: <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></svg>,
    BRUSH: <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>,
    ERASER: <svg viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4zm-7 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm-3-5c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34 3 3zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"></path></svg>,
    UNDO: <svg viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"></path></svg>,
    REDO: <svg viewBox="0 0 24 24"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.96 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"></path></svg>,
    BG_REMOVE: <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>,
    POS_TL: <svg viewBox="0 0 24 24"><path d="M4 4h6v6H4z" opacity="0.8"></path><path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" opacity="0.3"></path></svg>,
    POS_TR: <svg viewBox="0 0 24 24"><path d="M14 4h6v6h-6z" opacity="0.8"></path><path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" opacity="0.3"></path></svg>,
    POS_BL: <svg viewBox="0 0 24 24"><path d="M4 14h6v6H4z" opacity="0.8"></path><path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" opacity="0.3"></path></svg>,
    POS_BR: <svg viewBox="0 0 24 24"><path d="M14 14h6v6h-6z" opacity="0.8"></path><path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" opacity="0.3"></path></svg>,
    POS_C: <svg viewBox="0 0 24 24"><path d="M9 9h6v6H9z" opacity="0.8"></path><path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" opacity="0.3"></path></svg>,
    ADAPT: <svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"></path></svg>,
    ASSISTANT: <svg viewBox="0 0 24 24"><path d="M12 2a2.5 2.5 0 0 1 2.5 2.5c0 .72-.3 1.38-.8 1.82l-1.7 1.48 1.7 1.48c.5.44.8 1.1.8 1.82a2.5 2.5 0 0 1-2.5 2.5 2.5 2.5 0 0 1-2.5-2.5c0-.72.3-1.38.8-1.82l1.7-1.48-1.7-1.48a2.32 2.32 0 0 1-.8-1.82A2.5 2.5 0 0 1 12 2m9 7.5a1.5 1.5 0 0 1 1.5 1.5c0 .45-.19.85-.5 1.13l-1 1 1 1c.31.28.5.68.5 1.13a1.5 1.5 0 0 1-1.5 1.5 1.5 1.5 0 0 1-1.5-1.5c0-.45.19-.85.5-1.13l1-1-1-1a1.43 1.43 0 0 1-.5-1.13 1.5 1.5 0 0 1 1.5-1.5M3 9.5a1.5 1.5 0 0 1 1.5 1.5c0 .45-.19.85-.5 1.13l-1 1 1 1c.31.28.5.68.5 1.13A1.5 1.5 0 0 1 3 17a1.5 1.5 0 0 1-1.5-1.5c0-.45.19-.85.5-1.13l1-1-1-1A1.43 1.43 0 0 1 1.5 11 1.5 1.5 0 0 1 3 9.5m9 8a1.5 1.5 0 0 1 1.5 1.5c0 .45-.19.85-.5 1.13l-1 1 1 1c.31.28.5.68.5 1.13a1.5 1.5 0 0 1-1.5 1.5 1.5 1.5 0 0 1-1.5-1.5c0-.45.19-.85.5-1.13l1-1-1-1a1.43 1.43 0 0 1-.5-1.13 1.5 1.5 0 0 1 1.5-1.5z"></path></svg>,
    SHAPE: <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z"></path></svg>,
    EMOJI: <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4.5-5.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm6-1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zM12 16c-1.48 0-2.75-.81-3.45-2H15.45c-.7 1.19-1.97 2-3.45 2z"></path></svg>,
};

const FONT_OPTIONS = ['Inter', 'Roboto', 'Montserrat', 'Lato', 'Playfair Display'];
const VIBE_STYLES = ['Bold & Eye-Catching', 'Clean & Minimal', 'Viral/Trending', 'Professional & Corporate'];

type Platform = 'youtube' | 'youtube_improve' | 'podcast' | 'tiktok' | 'repurpose' | 'twitter';
type ImagenAspectRatio = "16:9" | "1.91:1" | "9:16" | "1:1" | "4:3" | "3:4";
type VeoAspectRatio = "16:9" | "9:16";


const VALID_IMAGEN_ASPECT_RATIOS: ImagenAspectRatio[] = ["16:9", "1.91:1", "9:16", "1:1", "4:3", "3:4"];

function isImagenAspectRatio(value: string): value is ImagenAspectRatio {
    return (VALID_IMAGEN_ASPECT_RATIOS as string[]).includes(value);
}

const PLATFORM_CONFIGS: Record<Platform, { title: string; icon: React.ReactNode; aspectRatio: string; promptSnippet: string; }> = {
    youtube_improve: {
        title: "Improve Thumbnail",
        icon: ICONS.YOUTUBE,
        aspectRatio: "16:9",
        promptSnippet: "This is a special workflow to improve an existing YouTube thumbnail."
    },
    youtube: {
        title: "YouTube Thumbnail",
        icon: ICONS.YOUTUBE,
        aspectRatio: "16:9",
        promptSnippet: "This is for a YouTube video. The design must be highly clickable and stand out on the YouTube platform."
    },
    podcast: {
        title: "Podcast Cover",
        icon: ICONS.PODCAST,
        aspectRatio: "1:1",
        promptSnippet: "This is for a podcast cover. The design needs to be square, bold, and clearly communicate the podcast's theme. It must be legible at small sizes on podcasting apps."
    },
    tiktok: {
        title: "TikTok Covers",
        icon: ICONS.TIKTOK,
        aspectRatio: "9:16",
        promptSnippet: "This is for a TikTok video cover. The design needs to be vertical, grab attention in the first second, and use bold, trendy text to hint at the video's content."
    },
    repurpose: {
        title: "Content Repurpose",
        icon: ICONS.ADAPT,
        aspectRatio: "1:1",
        promptSnippet: "This is for repurposing content for multiple social media platforms. The design should be versatile, clean, and easily adaptable. Key information should be centered and clear."
    },
    twitter: {
        title: "Twitter Card",
        icon: ICONS.TWITTER,
        aspectRatio: "1.91:1",
        promptSnippet: "This is for a Twitter card image. The design should be bold and concise to work well in a fast-moving feed."
    }
};

const PLATFORM_ORDER: Platform[] = ['youtube_improve', 'youtube', 'podcast', 'tiktok', 'repurpose', 'twitter'];

// --- TYPE DEFINITIONS ---
interface ImageAsset {
    id: string;
    url: string;
    base64: string;
    mimeType: string;
}

interface VideoAsset {
    id: string;
    file: File;
    url: string;
}

interface LogoState {
    url: string | null;
    base64: string | null;
    mimeType: string | null;
    size: number;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
}

interface TextState {
    headline: string;
    headlineFont: string;
    headlineSize: number;
    headlineWeight: 'normal' | 'bold';
    headlineItalic: boolean;
    headlineColor: string;
    subheadline: string;
    subheadlineFont: string;
    subheadlineSize: number;
    subheadlineWeight: 'normal' | 'bold';
    subheadlineItalic: boolean;
    subheadlineColor: string;
    author: string;
}

interface ColorsState {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
}

interface PreferencesState {
    style: string;
    variations: number;
    drama: number;
}

interface DesignResult {
    image?: ImageAsset;
    description?: string;
    isEditing?: boolean;
    isUpscaling?: boolean;
    suggestedHeadline?: string;
    suggestedSubheadline?: string;
}

interface AnalysisResult {
    suggestedColors: ColorsState;
    suggestedStyle: string;
}

interface AssistantMessage {
    id: number;
    sender: 'user' | 'ai';
    text: string;
    isActionableSuggestion?: boolean;
}

// Editor-related types
type ElementType = 'text' | 'image' | 'shape' | 'emoji';
interface EditableElement {
    id: string;
    type: ElementType;
    x: number; y: number;
    width: number; height: number;
    rotation: number;
    // Type-specific properties
    content?: string; // for text, emoji
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    color?: string;
    asset?: ImageAsset; // for image
    shape?: 'rectangle' | 'ellipse';
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
}
interface EditorState {
    background: ImageAsset;
    elements: EditableElement[];
    aspectRatio: string;
}

// --- CORE APP COMPONENT ---
const App: FC = () => {
    // Input state
    const [platform, setPlatform] = useState<Platform>('youtube_improve');
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

    // Load preferences from localStorage, with a fallback to defaults.
    const [colors, setColors] = useState<ColorsState>(() => {
        try {
            const saved = localStorage.getItem('ai-design-studio-prefs');
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.colors || { primary: '#FF0000', secondary: '#FFFF00', accent: '#00FFFF', background: '#000000' };
            }
        } catch (e) { /* ignore parse error */ }
        return { primary: '#FF0000', secondary: '#FFFF00', accent: '#00FFFF', background: '#000000' };
    });
    
    const [preferences, setPreferences] = useState<PreferencesState>(() => {
        try {
            const saved = localStorage.getItem('ai-design-studio-prefs');
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.preferences || { style: VIBE_STYLES[0], variations: 3, drama: 1 };
            }
        } catch (e) { /* ignore parse error */ }
        return { style: VIBE_STYLES[0], variations: 3, drama: 1 };
    });
    
    // App status state
    const [results, setResults] = useState<DesignResult[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [editingImage, setEditingImage] = useState<ImageAsset | null>(null); // For Magic Studio
    const [editorState, setEditorState] = useState<EditorState | null>(null); // For new Editor
    const [previewingImage, setPreviewingImage] = useState<ImageAsset | null>(null);

    // AI Assistant State
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const [isAssistantProcessing, setIsAssistantProcessing] = useState(false);
    const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([
        { id: 1, sender: 'ai', text: "Hello! I'm your AI design assistant. How can I help you? You can ask me to change text, colors, or even suggest ideas." }
    ]);

    const ai = useRef<GoogleGenAI>(new GoogleGenAI({ apiKey: process.env.API_KEY }));
    
    // Save preferences to localStorage on change.
    useEffect(() => {
        try {
            const settings = { preferences, colors };
            localStorage.setItem('ai-design-studio-prefs', JSON.stringify(settings));
        } catch (e) {
            console.error("Failed to save preferences:", e);
        }
    }, [preferences, colors]);

     // Check for a saved editor session on initial load
    useEffect(() => {
        try {
            const savedStateJSON = localStorage.getItem('ai-design-studio-editor-autosave');
            if (savedStateJSON) {
                if (window.confirm("You have a saved editor project. Would you like to restore it?")) {
                    const savedState = JSON.parse(savedStateJSON);
                    setEditorState(savedState);
                } else {
                    // User chose not to restore, so clear the saved state
                    localStorage.removeItem('ai-design-studio-editor-autosave');
                }
            }
        } catch (e) {
            console.error("Failed to load saved editor state:", e);
            localStorage.removeItem('ai-design-studio-editor-autosave'); // Clear corrupted data
        }
    }, []); // Empty dependency array ensures this runs only once on mount

    const handleGenerate = async () => {
        if (isGenerating) return;

        setIsGenerating(true);
        setError(null);
        setResults([]);

        try {
            let videoFrames: ImageAsset[] = [];
            if (videoAsset) {
                videoFrames = await extractFramesFromVideo(videoAsset.url, trimTimes.start, trimTimes.end, 3);
            }
            const allImages = [...images, ...videoFrames];
            const results = await generateDesign(ai.current, allImages, logo, colors, preferences, platform, youtubeTranscript, originalYoutubeTitle, text);
            setResults(results);
        } catch (e) {
            console.error(e);
            setError(`An error occurred: ${e.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAnalyzeVideo = async () => {
        if (!videoAsset || isAnalyzing) return;
        setIsAnalyzing(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const frames = await extractFramesFromVideo(videoAsset.url, trimTimes.start, trimTimes.end, 5);
            const result = await analyzeVideoAndSuggestStyles(ai.current, frames);
            setAnalysisResult(result);
            setColors(result.suggestedColors);
            setPreferences(prev => ({ ...prev, style: result.suggestedStyle }));
        } catch (e) {
            console.error(e);
            setError(`Failed to analyze video: ${e.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleExtractFaces = async () => {
        if (!videoAsset || isExtractingFaces) return;
        setIsExtractingFaces(true);
        setError(null);
        try {
            // Extract just one high-quality frame for face detection
            const frame = (await extractFramesFromVideo(videoAsset.url, trimTimes.start, trimTimes.end, 1))[0];
            if (!frame) {
                throw new Error("Could not extract a frame from the video.");
            }
            const faces = await extractFacesFromImage(ai.current, frame);
            setCutoutAssets(prev => [...prev, ...faces]);
        } catch (e) {
            console.error(e);
            setError(`Failed to extract faces: ${e.message}`);
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

        setEditorState({
            background: result.image,
            elements: [headlineElement, subheadlineElement].filter(el => el.content),
            aspectRatio: platformConfig.aspectRatio,
        });
    };
    
    const handleCloseEditor = () => {
        setEditorState(null);
        localStorage.removeItem('ai-design-studio-editor-autosave');
    };

    const handleAdaptDesign = async (sourceImage: ImageAsset, targetPlatform: Platform) => {
        if (isGenerating) return;

        setIsGenerating(true);
        setError(null);
        setResults([]);
        setPlatform(targetPlatform);

        try {
            const adaptedResults = await adaptImageForPlatform(ai.current, sourceImage, targetPlatform, text, logo, colors, preferences);
            setResults(adaptedResults);
        } catch (e) {
            console.error(e);
            setError(`An error occurred during adaptation: ${e.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateImage = async (prompt: string, negativePrompt: string, aspectRatio: ImagenAspectRatio): Promise<ImageAsset | null> => {
        setIsGeneratingImage(true);
        setError(null);
        try {
            const image = await generateImage(ai.current, prompt, negativePrompt, aspectRatio);
            if (image) {
                setImages(prev => [...prev, image]);
            }
            return image;
        } catch (e) {
            console.error(e);
            setError(`Image generation failed: ${e.message}`);
            return null;
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleGenerateVideo = async (prompt: string, aspectRatio: VeoAspectRatio) => {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await window.aistudio.openSelectKey();
        }

        setIsGeneratingVideo(true);
        setError(null);
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
            
            setVideoAsset({
                id: `gen_vid_${Date.now()}`,
                file: videoFile,
                url: videoUrl
            });
    
        } catch (e) {
            console.error(e);
            setError(`An error occurred during video generation: ${e.message}`);
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
        } catch(e) {
            console.error(e);
            setError(`Failed to edit image: ${e.message}`);
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
        } catch(e) {
            console.error(e);
            setError(`Failed to upscale image: ${e.message}`);
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
                // Set loading state on all cards
                setResults(prev => prev.map(r => ({ ...r, isEditing: true })));
    
                const recolorPromises = results.map(result => {
                    if (!result.image) return Promise.resolve(result);
                    const prompt = `Recolor this entire image to match a new color palette. The new palette is: Primary: ${newColors.primary}, Secondary: ${newColors.secondary}, Accent: ${newColors.accent}, Background: ${newColors.background}. IMPORTANT: Do NOT change the content, subjects, or composition of the image. Only alter the existing colors to match the new palette harmoniously.`;
                    
                    return editImage(ai.current, result.image, prompt, null).then(recoloredImage => ({
                        ...result,
                        image: recoloredImage,
                    })).catch(err => {
                        console.error("Recoloring failed for one image:", err);
                        return { ...result }; // Return original result on failure
                    });
                });
    
                const newResults = await Promise.all(recolorPromises);
                setResults(newResults.map(r => ({ ...r, isEditing: false })));
    
                const completionMessage: AssistantMessage = {
                    id: Date.now() + 2,
                    sender: 'ai',
                    text: "All done! How do the new colors look?"
                };
                setAssistantMessages(prev => [...prev, completionMessage]);
            }
    
        } catch (e) {
            console.error("Assistant Error:", e);
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
            <Header platform={platform} onPlatformChange={setPlatform} />
            <main className="main-content">
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
            {error && <div className="error-toast" onClick={() => setError(null)}>{error}</div>}
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

// --- LAYOUT COMPONENTS ---
const Header: FC<{ platform: Platform; onPlatformChange: (p: Platform) => void; }> = ({ platform, onPlatformChange }) => {
    return (
        <header className="app-header">
            <nav className="platform-nav">
                {PLATFORM_ORDER.map(key => (
                    <button
                        key={key}
                        className={`platform-nav-btn ${key === platform ? 'active' : ''}`}
                        onClick={() => onPlatformChange(key)}
                    >
                        {PLATFORM_CONFIGS[key].icon}
                        <span>{PLATFORM_CONFIGS[key].title}</span>
                    </button>
                ))}
            </nav>
        </header>
    );
};

const Sidebar: FC<{
    platform: Platform;
    text: TextState; onTextChange: React.Dispatch<React.SetStateAction<TextState>>;
    images: ImageAsset[]; onImagesChange: (i: ImageAsset[]) => void;
    videoAsset: VideoAsset | null; onVideoAssetChange: (v: VideoAsset | null) => void;
    trimTimes: { start: number, end: number }; onTrimTimesChange: (t: { start: number, end: number }) => void;
    isAnalyzing: boolean; onAnalyzeVideo: () => void;
    analysisResult: AnalysisResult | null; onAnalysisResultChange: (r: AnalysisResult | null) => void;
    onExtractFaces: () => void; isExtractingFaces: boolean;
    logo: LogoState; onLogoChange: (l: LogoState) => void;
    colors: ColorsState; onColorsChange: (c: ColorsState) => void;
    preferences: PreferencesState; onPreferencesChange: (p: PreferencesState) => void;
    onGenerate: () => void; isGenerating: boolean;
    onGenerateImage: (p: string, np: string, ar: ImagenAspectRatio) => Promise<ImageAsset | null>; isGeneratingImage: boolean;
    onGenerateVideo: (p: string, ar: VeoAspectRatio) => void; isGeneratingVideo: boolean;
    onTranscriptChange: (t: string | null) => void;
    onOriginalTitleChange: (t: string) => void;
}> = (props) => {
    return (
        <aside className="sidebar">
            {props.platform === 'youtube_improve' ? (
                 <YouTubeModule 
                    onImagesChange={props.onImagesChange} 
                    onTextChange={props.onTextChange} 
                    images={props.images}
                    onGenerate={props.onGenerate}
                    isGenerating={props.isGenerating}
                    onTranscriptChange={props.onTranscriptChange}
                    onOriginalTitleChange={props.onOriginalTitleChange}
                />
            ) : (
                <>
                    <VideoModule
                        videoAsset={props.videoAsset} onVideoAssetChange={props.onVideoAssetChange}
                        trimTimes={props.trimTimes} onTrimTimesChange={props.onTrimTimesChange}
                        isAnalyzing={props.isAnalyzing} onAnalyzeVideo={props.onAnalyzeVideo}
                        analysisResult={props.analysisResult} onAnalysisResultChange={props.onAnalysisResultChange}
                        onExtractFaces={props.onExtractFaces} isExtractingFaces={props.isExtractingFaces}
                        isPrimary={['podcast', 'tiktok'].includes(props.platform)}
                        hideForImagePlatforms={false}
                        onGenerateVideo={props.onGenerateVideo}
                        isGeneratingVideo={props.isGeneratingVideo}
                        platform={props.platform}
                    />
                    <ImageModule 
                        platform={props.platform} 
                        images={props.images} 
                        onImagesChange={props.onImagesChange} 
                        onGenerateImage={props.onGenerateImage} 
                        isGeneratingImage={props.isGeneratingImage} 
                    />
                    <TextContentModule platform={props.platform} text={props.text} onTextChange={props.onTextChange} />
                    <LogoModule logo={props.logo} onLogoChange={props.onLogoChange} />
                    <ColorPaletteModule colors={props.colors} onColorsChange={props.onColorsChange} />
                    <DesignPreferencesModule preferences={props.preferences} onPreferencesChange={props.onPreferencesChange} />
                    <GenerateButton onGenerate={props.onGenerate} isGenerating={props.isGenerating} />
                </>
            )}
        </aside>
    );
};

const Canvas: FC<{ results: DesignResult[]; isGenerating: boolean; platform: Platform; onEdit: (result: DesignResult) => void; onAiEdit: (image: ImageAsset) => void; onUpscale: (image: ImageAsset) => void; onDownload: (image: ImageAsset) => void; onPreview: (image: ImageAsset) => void; onAdapt: (image: ImageAsset, platform: Platform) => void; onAssistantToggle: () => void; }> = ({ results, isGenerating, platform, onEdit, onAiEdit, onUpscale, onDownload, onPreview, onAdapt, onAssistantToggle }) => (
    <main className="canvas-area">
        {isGenerating ? (
            <div className="canvas-placeholder">
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <p>Generating designs... this may take a moment.</p>
                </div>
            </div>
        ) : results.length > 0 ? (
            <DesignResults results={results} platform={platform} onEdit={onEdit} onAiEdit={onAiEdit} onUpscale={onUpscale} onDownload={onDownload} onPreview={onPreview} onAdapt={onAdapt} />
        ) : (
            <div className="canvas-placeholder">
                {ICONS.GENERATE}
                <h2>AI Design Studio</h2>
                <p>Your generated designs will appear here. Configure your options in the sidebar and click "Generate".</p>
            </div>
        )}
        <button className="assistant-fab" onClick={onAssistantToggle} title="AI Assistant">
            {ICONS.ASSISTANT}
        </button>
    </main>
);

const DesignResults: FC<{ results: DesignResult[]; platform: Platform; onEdit: (result: DesignResult) => void; onAiEdit: (image: ImageAsset) => void; onUpscale: (image: ImageAsset) => void; onDownload: (image: ImageAsset) => void; onPreview: (image: ImageAsset) => void; onAdapt: (image: ImageAsset, platform: Platform) => void; }> = ({ results, platform, onEdit, onAiEdit, onUpscale, onDownload, onPreview, onAdapt }) => (
    <div className="design-results-grid">
        {results.map((design, index) => (
            <DesignCard key={design.image?.id || index} design={design} platform={platform} onEdit={onEdit} onAiEdit={onAiEdit} onUpscale={onUpscale} onDownload={onDownload} onPreview={onPreview} onAdapt={onAdapt} />
        ))}
    </div>
);

const DesignCard: FC<{ design: DesignResult, platform: Platform; onEdit: (result: DesignResult) => void, onAiEdit: (image: ImageAsset) => void, onUpscale: (image: ImageAsset) => void, onDownload: (image: ImageAsset) => void, onPreview: (image: ImageAsset) => void; onAdapt: (image: ImageAsset, platform: Platform) => void; }> = ({ design, platform, onEdit, onAiEdit, onUpscale, onDownload, onPreview, onAdapt }) => {
    const [isAdaptMenuOpen, setIsAdaptMenuOpen] = useState(false);
    const adaptButtonRef = useRef<HTMLDivElement>(null);
    
    const handleEdit = () => onEdit(design);
    const handleAiEdit = () => design.image && onAiEdit(design.image);
    const handleUpscale = () => design.image && onUpscale(design.image);
    const handleDownload = () => design.image && onDownload(design.image);
    const handlePreview = () => design.image && onPreview(design.image);
    
    const handleAdaptSelect = (targetPlatform: Platform) => {
        if (design.image) {
            onAdapt(design.image, targetPlatform);
            setIsAdaptMenuOpen(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (adaptButtonRef.current && !adaptButtonRef.current.contains(event.target as Node)) {
                setIsAdaptMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="design-card">
            {design.image && (
                 <div className="design-card-actions">
                    <button className="card-action-btn" title="Download" onClick={handleDownload}>
                        {ICONS.DOWNLOAD}
                    </button>
                    <button className="card-action-btn" title="Preview" onClick={handlePreview}>
                        {ICONS.GENERATE}
                    </button>
                    <button className="card-action-btn" title="AI Edit" onClick={handleAiEdit}>
                        {ICONS.BRUSH}
                    </button>
                    <button className="card-action-btn" title="Open Editor" onClick={handleEdit}>
                        {ICONS.EDIT}
                    </button>
                    <button className="card-action-btn" title="Upscale" onClick={handleUpscale}>
                        {ICONS.UPSCALE}
                    </button>
                    <div className="adapt-btn-container" ref={adaptButtonRef}>
                         <button className="card-action-btn" title="Adapt for..." onClick={() => setIsAdaptMenuOpen(prev => !prev)}>
                            {ICONS.ADAPT}
                        </button>
                        {isAdaptMenuOpen && (
                             <div className="adapt-popover">
                                {PLATFORM_ORDER
                                    .filter(key => key !== platform && key !== 'youtube_improve')
                                    .map(key => (
                                    <button
                                        key={key}
                                        className="adapt-popover-option"
                                        onClick={() => handleAdaptSelect(key)}
                                    >
                                        {PLATFORM_CONFIGS[key].icon}
                                        <span>{PLATFORM_CONFIGS[key].title}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className="design-card-image-wrapper">
                {design.image && (
                    <img className="design-card-image" src={design.image.url} alt={design.description} />
                )}
            </div>
            {design.description && <p className="design-card-description">{design.description}</p>}
             {(design.isEditing || design.isUpscaling) && (
                <div className="card-overlay">
                    <div className="spinner"></div>
                    <p>{design.isEditing ? 'AI Editing...' : 'Upscaling...'}</p>
                </div>
            )}
        </div>
    );
};

// --- SIDEBAR MODULES ---
const Module: FC<{icon: React.ReactNode, title: string, children: React.ReactNode}> = ({icon, title, children}) => (
    <div className="sidebar-module">
        <div className="module-header">{icon} {title}</div>
        {children}
    </div>
);

const YouTubeModule: FC<{
    onImagesChange: (i: ImageAsset[]) => void;
    onTextChange: React.Dispatch<React.SetStateAction<TextState>>;
    images: ImageAsset[];
    onGenerate: () => void;
    isGenerating: boolean;
    onTranscriptChange: (t: string | null) => void;
    onOriginalTitleChange: (t: string) => void;
}> = ({ onImagesChange, onTextChange, images, onGenerate, isGenerating, onTranscriptChange, onOriginalTitleChange }) => {
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchedInfo, setFetchedInfo] = useState<{ title: string; thumbnailUrl: string } | null>(null);
    const [transcriptStatus, setTranscriptStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleFetchInfo = async () => {
        if (!youtubeUrl) return;
        setIsLoading(true);
        setError(null);
        setFetchedInfo(null);
        onTranscriptChange(null);
        onOriginalTitleChange('');
        setTranscriptStatus('idle');
        try {
            // Using noembed.com as a proxy to fetch YouTube video info to avoid CORS issues
            const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(youtubeUrl)}`);
            if (!response.ok) {
                throw new Error('Could not fetch video information. Please check the URL.');
            }
            const data = await response.json();
            
            if (data.error) {
                 throw new Error(data.error);
            }
            
            setFetchedInfo({ title: data.title, thumbnailUrl: data.thumbnail_url });
            onTextChange(prev => ({ ...prev, headline: data.title }));
            onOriginalTitleChange(data.title);

            const { base64, mimeType } = await imageUrlToBase64(data.thumbnail_url);
            const newImage: ImageAsset = {
                id: `yt_${Date.now()}`,
                url: data.thumbnail_url,
                base64,
                mimeType,
            };
            onImagesChange([...images, newImage]);

            setTranscriptStatus('loading');
            const transcript = await fetchTranscript(youtubeUrl);
            onTranscriptChange(transcript);
            setTranscriptStatus(transcript ? 'success' : 'error');

        } catch (e) {
            setError(e.message || 'An unknown error occurred.');
            setTranscriptStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setYoutubeUrl('');
        setFetchedInfo(null);
        setError(null);
        onImagesChange(images.filter(img => !img.id.startsWith('yt_')));
        onTranscriptChange(null);
        onOriginalTitleChange('');
        setTranscriptStatus('idle');
    };

    return (
        <Module icon={ICONS.YOUTUBE} title="Start with a YouTube Video">
            {fetchedInfo ? (
                 <div className="youtube-preview-container">
                    <div className="image-preview-item">
                        <img src={fetchedInfo.thumbnailUrl} alt={fetchedInfo.title} />
                    </div>
                    <div className="youtube-info">
                        <strong>{fetchedInfo.title}</strong>
                        <span className="youtube-info-subtext">Original thumbnail loaded. Let's make a better one!</span>
                        {transcriptStatus === 'loading' && (
                            <div className="transcript-status loading">
                                <div className="spinner-small"></div>
                                <span>Fetching transcript...</span>
                            </div>
                        )}
                        {transcriptStatus === 'success' && (
                            <div className="transcript-status success">
                                ✅ Transcript loaded for context.
                            </div>
                        )}
                        {transcriptStatus === 'error' && (
                            <div className="transcript-status error">
                                ⚠️ Could not load transcript.
                            </div>
                        )}
                        <div className="youtube-actions-container">
                             <button className="youtube-generate-btn" onClick={onGenerate} disabled={isGenerating}>
                                {isGenerating ? <div className="spinner"></div> : ICONS.GENERATE}
                                {isGenerating ? 'Improving...' : 'Improve Thumbnail'}
                            </button>
                            <button className="youtube-reset-btn" onClick={handleReset} disabled={isGenerating}>
                                Start Over
                            </button>
                        </div>
                    </div>
                 </div>
            ) : (
                <>
                    <div className="youtube-input-group">
                        <input
                            type="text"
                            placeholder="Paste YouTube video URL here..."
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            disabled={isLoading}
                        />
                        <button className="generate-image-btn" onClick={handleFetchInfo} disabled={isLoading || !youtubeUrl}>
                            {isLoading ? <div className="spinner"></div> : 'Fetch Info'}
                        </button>
                    </div>
                    {error && <p className="youtube-error">{error}</p>}
                </>
            )}
        </Module>
    );
};

const VideoModule: FC<{
    videoAsset: VideoAsset | null; onVideoAssetChange: (v: VideoAsset | null) => void;
    trimTimes: { start: number, end: number }; onTrimTimesChange: (t: { start: number, end: number }) => void;
    isAnalyzing: boolean; onAnalyzeVideo: () => void;
    analysisResult: AnalysisResult | null; onAnalysisResultChange: (r: AnalysisResult | null) => void;
    onExtractFaces: () => void; isExtractingFaces: boolean;
    isPrimary?: boolean;
    hideForImagePlatforms?: boolean;
    onGenerateVideo: (prompt: string, aspectRatio: VeoAspectRatio) => void;
    isGeneratingVideo: boolean;
    platform: Platform;
}> = (props) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [videoDuration, setVideoDuration] = useState(0);
    const [videoPrompt, setVideoPrompt] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            props.onVideoAssetChange({ id: `vid_${Date.now()}`, file, url });
            props.onAnalysisResultChange(null);
        }
    };
    
    const handleVideoLoad = (duration: number) => {
        setVideoDuration(duration);
        props.onTrimTimesChange({ start: 0, end: duration });
    };
    
    const handleRemoveVideo = () => {
        props.onVideoAssetChange(null);
        setVideoDuration(0);
        props.onAnalysisResultChange(null);
    };

    const handleGenerateClick = () => {
        if (!videoPrompt || props.isGeneratingVideo) return;
        const config = PLATFORM_CONFIGS[props.platform];
        // Veo only supports 16:9 and 9:16. Default others to 16:9.
        const aspectRatio: VeoAspectRatio = config.aspectRatio === '9:16' ? '9:16' : '16:9';
        props.onGenerateVideo(videoPrompt, aspectRatio);
    };
    
    if (props.hideForImagePlatforms) {
        return null;
    }

    const title = props.isPrimary ? "Start with a Video" : "Or Upload a Video";
    const showDivider = !props.isPrimary;

    return (
        <Module icon={ICONS.VIDEO} title={title}>
            {showDivider && <div className="section-divider"></div>}
            {props.videoAsset ? (
                <>
                    <div className="video-preview-wrapper">
                         <video className="video-preview" src={props.videoAsset.url} muted playsInline />
                         <button className="delete-image-btn" onClick={handleRemoveVideo}>&times;</button>
                    </div>
                    <VideoTrimmer 
                        videoUrl={props.videoAsset.url}
                        onVideoLoad={handleVideoLoad}
                        trimTimes={props.trimTimes}
                        onTrimTimesChange={props.onTrimTimesChange}
                        videoDuration={videoDuration}
                    />
                    <div className="video-module-actions">
                         <button className="generate-image-btn" onClick={props.onAnalyzeVideo} disabled={props.isAnalyzing}>
                            {props.isAnalyzing ? <div className="spinner"></div> : null}
                            {props.isAnalyzing ? 'Analyzing...' : 'Analyze Style'}
                        </button>
                        <button className="generate-image-btn" onClick={props.onExtractFaces} disabled={props.isExtractingFaces}>
                            {props.isExtractingFaces ? <div className="spinner"></div> : ICONS.BG_REMOVE}
                            {props.isExtractingFaces ? 'Extracting...' : 'Extract Faces'}
                        </button>
                    </div>
                    {props.isAnalyzing && (
                        <div className="analysis-progress">
                            <div className="spinner"></div>
                            <span>Analyzing video frames...</span>
                        </div>
                    )}
                </>
            ) : props.isGeneratingVideo ? (
                <div className="video-generation-progress">
                    <div className="spinner"></div>
                    <span>Generating video...</span>
                    <p>This can take a few minutes. Please don't close this window.</p>
                </div>
            ) : (
                <>
                    <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                        <p>Drag & drop or <span>click to browse video</span></p>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" style={{ display: 'none' }} />
                    </div>
                    <div className="section-divider">OR GENERATE A VIDEO BACKGROUND</div>
                    <div className="form-group">
                        <label htmlFor="generate-video-prompt">Describe the video you want</label>
                        <textarea id="generate-video-prompt" value={videoPrompt} onChange={e => setVideoPrompt(e.target.value)} placeholder="e.g., Abstract blue and purple flowing lines" />
                    </div>
                    <button className="generate-image-btn" onClick={handleGenerateClick} disabled={props.isGeneratingVideo || !videoPrompt}>
                        {props.isGeneratingVideo ? <div className="spinner"></div> : ICONS.VIDEO}
                        {props.isGeneratingVideo ? 'Generating...' : 'Generate Video'}
                    </button>
                    <p className="video-billing-notice">
                        Video generation is a premium feature. Please ensure you have <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer">billing enabled</a> for your API key.
                    </p>
                </>
            )}
        </Module>
    );
};


const ImageModule: FC<{
    images: ImageAsset[];
    onImagesChange: (i: ImageAsset[]) => void;
    onGenerateImage: (p: string, np: string, ar: ImagenAspectRatio) => Promise<ImageAsset | null>;
    isGeneratingImage: boolean;
    platform: Platform;
}> = ({ images, onImagesChange, onGenerateImage, isGeneratingImage, platform }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [genPrompt, setGenPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<ImagenAspectRatio>('16:9');

    useEffect(() => {
        const platformAspectRatio = PLATFORM_CONFIGS[platform].aspectRatio;
        if (isImagenAspectRatio(platformAspectRatio)) {
            setAspectRatio(platformAspectRatio);
        }
    }, [platform]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const { base64, mimeType } = await fileToBase64(file);
            const newImage = { id: `img_${Date.now()}`, url: URL.createObjectURL(file), base64, mimeType };
            onImagesChange([...images, newImage]);
        }
    };

    const handleGenClick = async () => {
        if (!genPrompt || isGeneratingImage) return;
        await onGenerateImage(genPrompt, negativePrompt, aspectRatio);
    };

    return (
        <Module icon={ICONS.IMAGE} title="Images">
            <label className="sub-label">Upload Images (Optional)</label>
            <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                <p>Drag & drop or <span>click to browse</span></p>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
            {images.length > 0 && (
                <div className="image-preview-grid">
                    {images.map(image => (
                        <div key={image.id} className="image-preview-item">
                            <img src={image.url} alt="preview" />
                            <button className="delete-image-btn" onClick={() => onImagesChange(images.filter(i => i.id !== image.id))}>&times;</button>
                        </div>
                    ))}
                </div>
            )}
            <div className="section-divider">OR GENERATE WITH AI</div>
            <div className="form-group">
                <label htmlFor="generate-image-prompt">Describe the image you want</label>
                <textarea id="generate-image-prompt" value={genPrompt} onChange={e => setGenPrompt(e.target.value)} placeholder="e.g., A robot holding a red skateboard" />
            </div>
            <div className="form-group">
                <label htmlFor="negative-prompt">Negative Prompt (what to avoid)</label>
                <input type="text" id="negative-prompt" value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} placeholder="e.g., text, watermarks, blurry" />
            </div>
            <div className="form-group">
                <label>Aspect Ratio</label>
                <div className="aspect-ratio-group">
                    {(['1:1', '16:9', '9:16', '1.91:1'] as ImagenAspectRatio[]).map(ar => (
                        <button key={ar} className={`aspect-ratio-btn ${aspectRatio === ar ? 'active' : ''}`} onClick={() => setAspectRatio(ar)}>
                            {ar}
                        </button>
                    ))}
                </div>
            </div>
            <button className="generate-image-btn" onClick={handleGenClick} disabled={isGeneratingImage || !genPrompt}>
                {isGeneratingImage ? <div className="spinner"></div> : ICONS.GENERATE}
                {isGeneratingImage ? 'Generating...' : 'Generate Image'}
            </button>
        </Module>
    );
};

const TextContentModule: FC<{ platform: Platform; text: TextState; onTextChange: React.Dispatch<React.SetStateAction<TextState>> }> = ({ platform, text, onTextChange }) => {
    const handleTextChange = (field: keyof TextState, value: any) => {
        onTextChange({ ...text, [field]: value });
    };

    const isPodcast = platform === 'podcast';

    return (
        <Module icon={ICONS.TEXT} title="Text Content">
            <div className="form-group">
                <div className="label-group">
                    <label htmlFor="headline">{isPodcast ? 'Podcast Title' : 'Main Headline'}</label>
                    <span className="char-counter">{text.headline.length} / 60</span>
                </div>
                <textarea id="headline" value={text.headline} onChange={e => handleTextChange('headline', e.target.value)} maxLength={60} />
                <div className="font-controls">
                    <select className="font-select" value={text.headlineFont} onChange={e => handleTextChange('headlineFont', e.target.value)}>
                        {FONT_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}
                    </select>
                    <input className="font-size-input" type="number" value={text.headlineSize} onChange={e => handleTextChange('headlineSize', parseInt(e.target.value, 10))} />
                    <select className="weight-select" value={text.headlineWeight} onChange={e => handleTextChange('headlineWeight', e.target.value)}>
                        <option value="normal">Regular</option>
                        <option value="bold">Bold</option>
                    </select>
                    <button className={`style-btn ${text.headlineItalic ? 'active' : ''}`} onClick={() => handleTextChange('headlineItalic', !text.headlineItalic)}><em>I</em></button>
                    <div className="text-color-picker-wrapper">
                        <input className="text-color-picker" type="color" value={text.headlineColor} onChange={e => handleTextChange('headlineColor', e.target.value)} />
                    </div>
                </div>
            </div>

            {isPodcast && (
                <div className="form-group">
                    <div className="label-group">
                        <label htmlFor="author">Host Name(s)</label>
                        <span className="char-counter">{text.author.length} / 40</span>
                    </div>
                    <input id="author" type="text" value={text.author} onChange={e => handleTextChange('author', e.target.value)} maxLength={40} placeholder="e.g., Jane Doe & John Smith" />
                </div>
            )}

            <div className="form-group">
                <div className="label-group">
                    <label htmlFor="subheadline">{isPodcast ? 'Tagline / Subtitle' : 'Sub-headline / Call to Action'}</label>
                    <span className="char-counter">{text.subheadline.length} / 80</span>
                </div>
                <textarea id="subheadline" value={text.subheadline} onChange={e => handleTextChange('subheadline', e.target.value)} maxLength={80} />
                <div className="font-controls">
                    <select className="font-select" value={text.subheadlineFont} onChange={e => handleTextChange('subheadlineFont', e.target.value)}>
                        {FONT_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}
                    </select>
                    <input className="font-size-input" type="number" value={text.subheadlineSize} onChange={e => handleTextChange('subheadlineSize', parseInt(e.target.value, 10))} />
                    <select className="weight-select" value={text.subheadlineWeight} onChange={e => handleTextChange('subheadlineWeight', e.target.value)}>
                        <option value="normal">Regular</option>
                        <option value="bold">Bold</option>
                    </select>
                    <button className={`style-btn ${text.subheadlineItalic ? 'active' : ''}`} onClick={() => handleTextChange('subheadlineItalic', !text.subheadlineItalic)}><em>I</em></button>
                    <div className="text-color-picker-wrapper">
                        <input className="text-color-picker" type="color" value={text.subheadlineColor} onChange={e => handleTextChange('subheadlineColor', e.target.value)} />
                    </div>
                </div>
            </div>
        </Module>
    );
};

const LogoModule: FC<{logo: LogoState, onLogoChange: (l: LogoState) => void}> = ({logo, onLogoChange}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const { base64, mimeType } = await fileToBase64(file);
            onLogoChange({ ...logo, url: URL.createObjectURL(file), base64, mimeType });
        }
    };
    
    const handleRemoveLogo = () => {
        onLogoChange({ ...logo, url: null, base64: null, mimeType: null });
    };
    
    return (
         <Module icon={ICONS.LOGO} title="Brand Logo">
            {logo.url ? (
                <div className="logo-preview-wrapper">
                    <img className="logo-preview" src={logo.url} alt="Logo preview" style={{ opacity: logo.opacity }} />
                    <button className="delete-image-btn" onClick={handleRemoveLogo}>&times;</button>
                </div>
            ) : (
                 <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                    <p><span>Click to upload</span> logo</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                </div>
            )}
            {logo.url && (
                <div className="logo-controls">
                    <div className="form-group">
                        <label>Position</label>
                        <div className="position-grid">
                            {(['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'] as const).map(pos => (
                                <button key={pos} className={`position-btn ${logo.position === pos ? 'active' : ''}`} onClick={() => onLogoChange({ ...logo, position: pos })}>
                                    {ICONS[`POS_${pos.replace('-', '').toUpperCase()}`]}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div className="form-group">
                        <label>Size: {logo.size}%</label>
                        <input type="range" min="5" max="50" value={logo.size} onChange={e => onLogoChange({ ...logo, size: parseInt(e.target.value) })} />
                    </div>
                    <div className="form-group">
                        <label>Opacity: {Math.round(logo.opacity * 100)}%</label>
                        <input type="range" min="0" max="1" step="0.05" value={logo.opacity} onChange={e => onLogoChange({ ...logo, opacity: parseFloat(e.target.value) })} />
                    </div>
                </div>
            )}
        </Module>
    );
};

const ColorPaletteModule: FC<{colors: ColorsState, onColorsChange: (c: ColorsState) => void}> = ({colors, onColorsChange}) => {
    const handleColorChange = (key: keyof ColorsState, value: string) => {
        onColorsChange({ ...colors, [key]: value });
    };

    return (
        <Module icon={ICONS.COLOR} title="Color Palette">
            <div className="color-palette">
                {(Object.keys(colors) as Array<keyof ColorsState>).map(key => (
                    <div key={key} className="color-input-group">
                        <label htmlFor={`${key}-color`} style={{textTransform: 'capitalize'}}>{key}</label>
                        <input type="color" id={`${key}-color`} value={colors[key]} onChange={e => handleColorChange(key, e.target.value)} />
                    </div>
                ))}
            </div>
        </Module>
    );
};

const DesignPreferencesModule: FC<{preferences: PreferencesState, onPreferencesChange: (p: PreferencesState) => void}> = ({preferences, onPreferencesChange}) => (
    <Module icon={ICONS.PREFERENCES} title="Design Preferences">
         <div className="form-group">
            <label>Vibe & Style</label>
            <select value={preferences.style} onChange={e => onPreferencesChange({ ...preferences, style: e.target.value })}>
                {VIBE_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
            </select>
        </div>
        <div className="form-group">
            <div className="label-group">
                <label>Variations to Generate</label>
                <span className="variations-value">{preferences.variations}</span>
            </div>
            <input className="variations-slider" type="range" min="1" max="4" value={preferences.variations} onChange={e => onPreferencesChange({ ...preferences, variations: parseInt(e.target.value) })} />
        </div>
        <div className="form-group">
            <div className="label-group">
                <label>Visual "Drama"</label>
                 <span className="variations-value">{preferences.drama}</span>
            </div>
            <input className="variations-slider" type="range" min="1" max="5" value={preferences.drama} onChange={e => onPreferencesChange({ ...preferences, drama: parseInt(e.target.value) })} />
        </div>
    </Module>
);

const GenerateButton: FC<{onGenerate: () => void, isGenerating: boolean}> = ({ onGenerate, isGenerating }) => (
    <button className="generate-btn" onClick={onGenerate} disabled={isGenerating}>
        {isGenerating ? <div className="spinner"></div> : ICONS.GENERATE}
        {isGenerating ? 'Generating...' : 'Generate'}
    </button>
);

const VideoTrimmer: FC<{
    videoUrl: string;
    onVideoLoad: (duration: number) => void;
    trimTimes: { start: number, end: number };
    onTrimTimesChange: (times: { start: number, end: number }) => void;
    videoDuration: number;
}> = ({ videoUrl, onVideoLoad, trimTimes, onTrimTimesChange, videoDuration }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const draggingHandle = useRef<'start' | 'end' | null>(null);

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            onVideoLoad(videoRef.current.duration);
        }
    };
    
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateTime = () => {
            setCurrentTime(video.currentTime);
            if (video.currentTime >= trimTimes.end) {
                video.pause();
                video.currentTime = trimTimes.start;
            }
        };
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        
        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, [trimTimes.start, trimTimes.end]);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (isPlaying) {
            video.pause();
        } else {
            if (video.currentTime < trimTimes.start || video.currentTime >= trimTimes.end) {
                 video.currentTime = trimTimes.start;
            }
            video.play();
        }
    };
    
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor((time % 1) * 100);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    };

    // Dragging logic
    const handleMouseDown = (handle: 'start' | 'end') => {
        draggingHandle.current = handle;
    };

    const handleMouseUp = () => {
        draggingHandle.current = null;
    };
    
    const handleMouseMove = (e: MouseEvent) => {
        if (!draggingHandle.current || !timelineRef.current || !videoDuration) return;
        
        const timeline = timelineRef.current;
        const rect = timeline.getBoundingClientRect();
        const position = (e.clientX - rect.left) / rect.width;
        const time = position * videoDuration;
        
        let newStart = trimTimes.start;
        let newEnd = trimTimes.end;

        if (draggingHandle.current === 'start') {
            newStart = Math.max(0, Math.min(time, trimTimes.end - 0.1));
        } else {
            newEnd = Math.min(videoDuration, Math.max(time, trimTimes.start + 0.1));
        }
        
        onTrimTimesChange({ start: newStart, end: newEnd });
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const startPercent = (trimTimes.start / videoDuration) * 100;
    const endPercent = ((videoDuration - trimTimes.end) / videoDuration) * 100;

    return (
        <div className="trimmer-container">
            <div className="trimmer-video-wrapper">
                 <video
                    ref={videoRef}
                    src={videoUrl}
                    onLoadedMetadata={handleLoadedMetadata}
                    className="trimmer-video"
                    muted
                    playsInline
                />
            </div>
            <div className="trimmer-controls">
                <button className="trimmer-play-btn" onClick={togglePlay}>
                    {isPlaying ? <svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg> : <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>}
                </button>
                <div className="trimmer-time-display">
                    {formatTime(currentTime)} / {formatTime(videoDuration)}
                </div>
            </div>
             <div className="trimmer-timeline-container" ref={timelineRef}>
                <div className="trimmer-timeline">
                    <div className="trimmer-timeline-progress" style={{ width: `${(currentTime / videoDuration) * 100}%` }}></div>
                    <div className="trimmer-timeline-range" style={{ left: `${startPercent}%`, right: `${endPercent}%` }}>
                         <div className="trimmer-timeline-handle" style={{ left: '0%' }} onMouseDown={() => handleMouseDown('start')}></div>
                         <div className="trimmer-timeline-handle" style={{ left: '100%' }} onMouseDown={() => handleMouseDown('end')}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MODALS ---
const MagicStudioModal: FC<{ image: ImageAsset; onConfirm: (original: ImageAsset, prompt: string, mask: ImageAsset | null) => void; onCancel: () => void; }> = ({ image, onConfirm, onCancel }) => {
    const [prompt, setPrompt] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [brushSize, setBrushSize] = useState(30);
    const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const isDrawing = useRef(false);

    // History for undo/redo
    const history = useRef<ImageData[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const getCanvasContext = () => {
        const canvas = canvasRef.current;
        return canvas ? canvas.getContext('2d', { willReadFrequently: true }) : null;
    };

    // Initialize canvas when image loads
    useEffect(() => {
        const imageEl = imageRef.current;
        const canvasEl = canvasRef.current;
        if (!imageEl || !canvasEl) return;

        const handleImageLoad = () => {
            const ctx = getCanvasContext();
            if (!ctx) return;
            // Match canvas dimensions to the actual image dimensions
            canvasEl.width = imageEl.naturalWidth;
            canvasEl.height = imageEl.naturalHeight;
            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
            // Save initial state for undo
            history.current = [ctx.getImageData(0, 0, canvasEl.width, canvasEl.height)];
            setHistoryIndex(0);
        };

        // If image is already cached and loaded
        if (imageEl.complete) {
            handleImageLoad();
        } else {
            imageEl.addEventListener('load', handleImageLoad);
        }

        return () => {
            imageEl.removeEventListener('load', handleImageLoad);
        };
    }, [image]);

    const saveHistory = () => {
        const ctx = getCanvasContext();
        if (!ctx) return;
        const currentHistory = history.current.slice(0, historyIndex + 1);
        currentHistory.push(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
        history.current = currentHistory;
        setHistoryIndex(currentHistory.length - 1);
    };
    
    const restoreHistory = (index: number) => {
        const ctx = getCanvasContext();
        if (!ctx || !history.current[index]) return;
        ctx.putImageData(history.current[index], 0, 0);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            restoreHistory(newIndex);
        }
    };
    
    const handleRedo = () => {
        if (historyIndex < history.current.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            restoreHistory(newIndex);
        }
    };

    const getMousePos = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height)
        };
    };

    const startDrawing = (e: React.MouseEvent) => {
        const ctx = getCanvasContext();
        if (!ctx) return;
        isDrawing.current = true;
        const pos = getMousePos(e);

        ctx.beginPath();
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (tool === 'brush') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = 'rgba(255, 0, 150, 0.7)'; // Visible pink color for mask
        } else { // eraser
            ctx.globalCompositeOperation = 'destination-out';
        }
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x, pos.y); // Draw a dot on click
        ctx.stroke();
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing.current) return;
        const ctx = getCanvasContext();
        if (!ctx) return;
        const pos = getMousePos(e);
        
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing.current) return;
        const ctx = getCanvasContext();
        if (!ctx) return;
        isDrawing.current = false;
        ctx.closePath();
        saveHistory();
    };

    const handleConfirm = async () => {
        setIsProcessing(true);
        const canvas = canvasRef.current;
        const ctx = getCanvasContext();
        if (!canvas || !ctx) {
            setIsProcessing(false);
            return;
        }

        const isMaskDrawn = historyIndex > 0;
        let maskAsset: ImageAsset | null = null;
        
        if (isMaskDrawn) {
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = canvas.width;
            maskCanvas.height = canvas.height;
            const maskCtx = maskCanvas.getContext('2d');
            if(maskCtx) {
                const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const maskImageData = maskCtx.createImageData(canvas.width, canvas.height);
                
                for (let i = 0; i < originalImageData.data.length; i += 4) {
                    const alpha = originalImageData.data[i + 3];
                    if (alpha > 0) { // Pixel was drawn on (area to edit)
                        maskImageData.data[i] = 255;     // R (White)
                        maskImageData.data[i + 1] = 255; // G
                        maskImageData.data[i + 2] = 255; // B
                        maskImageData.data[i + 3] = 255; // A
                    } else { // Pixel was not touched (area to keep)
                        maskImageData.data[i] = 0;       // R (Black)
                        maskImageData.data[i + 1] = 0;   // G
                        maskImageData.data[i + 2] = 0;   // B
                        maskImageData.data[i + 3] = 255; // A
                    }
                }
                maskCtx.putImageData(maskImageData, 0, 0);

                const maskDataUrl = maskCanvas.toDataURL('image/png');
                maskAsset = {
                    id: `mask_${Date.now()}`,
                    url: maskDataUrl,
                    base64: maskDataUrl.split(',')[1],
                    mimeType: 'image/png'
                };
            }
        }

        await onConfirm(image, prompt, maskAsset);
        // Do not set isProcessing to false here, as the parent component will handle the visual state.
    };
    
    const isUndoable = historyIndex > 0;
    const isRedoable = historyIndex < history.current.length - 1;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="magic-studio-modal" onClick={e => e.stopPropagation()}>
                <div className="magic-studio-header">
                    <h3>AI Edit</h3>
                    <button className="modal-close-btn" onClick={onCancel}>&times;</button>
                </div>
                <div className="magic-studio-content">
                    <div className="magic-studio-toolbar">
                        <div title="Brush" className={`tool-btn ${tool === 'brush' ? 'active' : ''}`} onClick={() => setTool('brush')}>
                            {ICONS.BRUSH}
                            <span>Brush</span>
                        </div>
                        <div title="Erase" className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`} onClick={() => setTool('eraser')}>
                            {ICONS.ERASER}
                            <span>Erase</span>
                        </div>
                    </div>
                     <div className="magic-studio-canvas-area">
                        <div className="magic-studio-canvas-wrapper">
                            <img ref={imageRef} src={image.url} alt="Editing canvas" className="magic-studio-image" draggable="false" />
                             <canvas
                                ref={canvasRef}
                                className="magic-studio-canvas"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                            />
                        </div>
                    </div>
                </div>
                 <div className="magic-studio-footer">
                     <div className="footer-controls-left">
                         <div className="brush-controls">
                             <label>Size:</label>
                             <input type="range" min="1" max="100" value={brushSize} onChange={e => setBrushSize(parseInt(e.target.value, 10))} />
                             <span className="brush-size-value">{brushSize}</span>
                         </div>
                         <button className="footer-tool-btn" title="Undo" onClick={handleUndo} disabled={!isUndoable}>
                            {ICONS.UNDO}
                         </button>
                         <button className="footer-tool-btn" title="Redo" onClick={handleRedo} disabled={!isRedoable}>
                            {ICONS.REDO}
                         </button>
                     </div>
                     <div className="footer-prompt-area">
                         <input
                            type="text"
                            className="magic-studio-prompt"
                            placeholder="Describe your edit... e.g., 'add a birthday hat'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                     </div>
                     <div className="footer-actions">
                        <button className="modal-btn-secondary" onClick={onCancel}>Cancel</button>
                        <button className="modal-btn-primary" onClick={handleConfirm} disabled={isProcessing || !prompt}>
                            {isProcessing ? <div className="spinner"></div> : null}
                            Apply
                        </button>
                     </div>
                 </div>
            </div>
        </div>
    );
};

const PreviewModal: FC<{ image: ImageAsset; onCancel: () => void; }> = ({ image, onCancel }) => (
    <div className="modal-overlay" onClick={onCancel}>
        <div className="preview-modal" onClick={e => e.stopPropagation()}>
            <div className="preview-modal-header">
                <h3>YouTube Preview</h3>
                <button className="modal-close-btn" onClick={onCancel}>&times;</button>
            </div>
            <div className="preview-modal-content">
                <div className="preview-grid">
                    <div className="preview-item">
                        <span className="preview-item-label">Home Page / Subscriptions Feed</span>
                        <img src={image.url} className="preview-img-large" alt="Large Preview"/>
                    </div>
                     <div className="preview-item">
                        <span className="preview-item-label">Recommended Video</span>
                        <img src={image.url} className="preview-img-medium" alt="Medium Preview"/>
                    </div>
                     <div className="preview-item">
                        <span className="preview-item-label">Channel Page</span>
                        <img src={image.url} className="preview-img-small" alt="Small Preview"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const AssistantPanel: FC<{ messages: AssistantMessage[]; isProcessing: boolean; onSubmit: (message: string) => void; onClose: () => void; }> = ({ messages, isProcessing, onSubmit, onClose }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isProcessing) {
            onSubmit(input.trim());
            setInput('');
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="assistant-panel">
            <div className="assistant-header">
                <h3>AI Assistant</h3>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
            </div>
            <div className="assistant-messages">
                {messages.map(msg => (
                    <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                        <p>{msg.text}</p>
                    </div>
                ))}
                {isProcessing && (
                    <div className="message-bubble ai">
                        <div className="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form className="assistant-input-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me to change something..."
                    disabled={isProcessing}
                />
                <button type="submit" disabled={isProcessing || !input.trim()}>
                    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                </button>
            </form>
        </div>
    );
};

// --- EDITOR COMPONENTS ---

const Editor: FC<{ initialState: EditorState; onClose: () => void; assets: ImageAsset[] }> = ({ initialState, onClose, assets }) => {
    const [editorState, setEditorState] = useState<EditorState>(initialState);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        try {
            localStorage.setItem('ai-design-studio-editor-autosave', JSON.stringify(editorState));
        } catch (e) {
            console.error("Failed to save editor state:", e);
        }
    }, [editorState]);

    useEffect(() => {
        const [arW, arH] = editorState.aspectRatio.split(':').map(Number);
        const maxHeight = 720;
        const width = (maxHeight / arH) * arW;
        setCanvasSize({ width, height: maxHeight });
    }, [editorState.aspectRatio]);
    
    const handleExport = () => {
        setSelectedElementId(null); // Deselect to hide outlines
        setTimeout(() => {
            if (canvasRef.current) {
                html2canvas(canvasRef.current, { backgroundColor: null }).then((canvas: HTMLCanvasElement) => {
                    const link = document.createElement('a');
                    link.download = `design-${Date.now()}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    onClose(); // Close after export
                });
            }
        }, 100); // Small delay to allow deselection to render
    };

    const updateElement = (id: string, updates: Partial<EditableElement>) => {
        setEditorState(prev => ({
            ...prev,
            elements: prev.elements.map(el => el.id === id ? { ...el, ...updates } : el)
        }));
    };

    const addElement = (type: ElementType, asset?: ImageAsset, emoji?: string) => {
        let newElement: EditableElement;
        const base = {
            id: `${type}_${Date.now()}`,
            type,
            x: canvasSize.width * 0.1,
            y: canvasSize.height * 0.1,
            rotation: 0,
        };

        switch (type) {
            case 'text':
                newElement = { ...base, width: 300, height: 50, content: 'New Text', fontFamily: 'Inter', fontSize: 48, color: '#FFFFFF', fontWeight: 'normal', fontStyle: 'normal' };
                break;
            case 'image':
                if (!asset) return;
                newElement = { ...base, width: 200, height: 200, asset };
                break;
            case 'shape':
                newElement = { ...base, width: 150, height: 150, shape: 'rectangle', backgroundColor: '#CCCCCC', borderWidth: 2, borderColor: '#000000' };
                break;
            case 'emoji':
                newElement = { ...base, width: 100, height: 100, content: emoji || '😀', fontSize: 80 };
                break;
            default:
                return;
        }

        setEditorState(prev => ({ ...prev, elements: [...prev.elements, newElement] }));
        setSelectedElementId(newElement.id);
    };

    const deleteElement = (id: string) => {
        setEditorState(prev => ({
            ...prev,
            elements: prev.elements.filter(el => el.id !== id)
        }));
        setSelectedElementId(null);
    };
    
    const selectedElement = useMemo(() => {
        return editorState.elements.find(el => el.id === selectedElementId);
    }, [selectedElementId, editorState.elements]);

    return (
        <div className="editor-overlay">
            <header className="editor-header">
                <div className="editor-title">Editor</div>
                <div className="editor-actions">
                    <button className="modal-btn-secondary" onClick={onClose}>Close & Discard</button>
                    <button className="modal-btn-primary" onClick={handleExport}>Export & Finish</button>
                </div>
            </header>
            <main className="editor-main">
                <Toolbar onAddElement={addElement} />
                <div className="editor-canvas-area" onClick={() => setSelectedElementId(null)}>
                    <div
                        ref={canvasRef}
                        className="editor-canvas"
                        style={{
                            width: `${canvasSize.width}px`,
                            height: `${canvasSize.height}px`,
                            backgroundImage: `url(${editorState.background.url})`
                        }}
                    >
                        {editorState.elements.map(el => (
                            <EditableElementComponent
                                key={el.id}
                                element={el}
                                onUpdate={updateElement}
                                isSelected={el.id === selectedElementId}
                                onSelect={() => setSelectedElementId(el.id)}
                            />
                        ))}
                    </div>
                </div>
                <PropertiesPanel
                    selectedElement={selectedElement}
                    updateElement={updateElement}
                    deleteElement={deleteElement}
                    assets={assets}
                    addElement={addElement}
                />
            </main>
        </div>
    );
};

const Toolbar: FC<{ onAddElement: (type: ElementType, asset?: ImageAsset, emoji?: string) => void }> = ({ onAddElement }) => {
    return (
        <aside className="editor-toolbar">
            <div className="tool-btn" title="Add Text" onClick={() => onAddElement('text')}>
                {ICONS.TEXT}
                <span>Text</span>
            </div>
            <div className="tool-btn" title="Add Shape" onClick={() => onAddElement('shape')}>
                {ICONS.SHAPE}
                <span>Shape</span>
            </div>
            <div className="tool-btn" title="Add Emoji" onClick={() => onAddElement('emoji')}>
                {ICONS.EMOJI}
                <span>Emoji</span>
            </div>
        </aside>
    );
};

const EditableElementComponent: FC<{
    element: EditableElement;
    onUpdate: (id: string, updates: Partial<EditableElement>) => void;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ element, onUpdate, isSelected, onSelect }) => {
    
    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startElX = element.x;
        const startElY = element.y;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const newX = startElX + (moveEvent.clientX - startX);
            const newY = startElY + (moveEvent.clientY - startY);
            onUpdate(element.id, { x: newX, y: newY });
        };
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleResizeMouseDown = (e: React.MouseEvent, corner: string) => {
        e.stopPropagation();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = element.width;
        const startHeight = element.height;
        const startXEl = element.x;
        const startYEl = element.y;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            let newWidth = startWidth, newHeight = startHeight, newX = startXEl, newY = startYEl;

            if (corner.includes('right')) newWidth = startWidth + dx;
            if (corner.includes('left')) {
                newWidth = startWidth - dx;
                newX = startXEl + dx;
            }
            if (corner.includes('bottom')) newHeight = startHeight + dy;
            if (corner.includes('top')) {
                newHeight = startHeight - dy;
                newY = startYEl + dy;
            }
            
            if(newWidth > 10 && newHeight > 10) {
                 onUpdate(element.id, { width: newWidth, height: newHeight, x: newX, y: newY });
            }
        };
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const style: React.CSSProperties = {
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation || 0}deg)`,
    };

    let content;
    switch (element.type) {
        case 'text':
            style.color = element.color;
            style.fontFamily = element.fontFamily;
            style.fontSize = `${element.fontSize}px`;
            style.fontWeight = element.fontWeight;
            style.fontStyle = element.fontStyle;
            content = <div contentEditable suppressContentEditableWarning onBlur={e => onUpdate(element.id, { content: e.currentTarget.textContent || '' })} className="editable-text-content">{element.content}</div>;
            break;
        case 'image':
            content = <img src={element.asset?.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable="false" />;
            break;
        case 'shape':
            style.backgroundColor = element.backgroundColor;
            if (element.shape === 'ellipse') {
                style.borderRadius = '50%';
            }
            if (element.borderWidth && element.borderWidth > 0) {
                style.border = `${element.borderWidth}px solid ${element.borderColor || '#000000'}`;
            }
            break;
        case 'emoji':
            style.fontSize = `${element.fontSize}px`;
            style.display = 'flex';
            style.alignItems = 'center';
            style.justifyContent = 'center';
            content = <span>{element.content}</span>;
            break;
    }

    return (
        <div className={`editable-element ${isSelected ? 'selected' : ''}`} style={style} onMouseDown={handleMouseDown}>
            {content}
            {isSelected && (
                <>
                    <div className="resizer top-left" onMouseDown={e => handleResizeMouseDown(e, 'top-left')}></div>
                    <div className="resizer top-right" onMouseDown={e => handleResizeMouseDown(e, 'top-right')}></div>
                    <div className="resizer bottom-left" onMouseDown={e => handleResizeMouseDown(e, 'bottom-left')}></div>
                    <div className="resizer bottom-right" onMouseDown={e => handleResizeMouseDown(e, 'bottom-right')}></div>
                </>
            )}
        </div>
    );
};

const PropertiesPanel: FC<{
    selectedElement: EditableElement | undefined;
    updateElement: (id: string, updates: Partial<EditableElement>) => void;
    deleteElement: (id: string) => void;
    assets: ImageAsset[];
    addElement: (type: ElementType, asset: ImageAsset) => void;
}> = ({ selectedElement, updateElement, deleteElement, assets, addElement }) => {
    if (!selectedElement) {
        return (
            <aside className="editor-properties-panel">
                <div className="properties-section">
                    <div className="properties-title">Assets</div>
                    {assets.length > 0 ? (
                        <div className="assets-grid">
                            {assets.map(asset => (
                                <div key={asset.id} className="asset-item" onClick={() => addElement('image', asset)}>
                                    <img src={asset.url} alt="Asset" />
                                </div>
                            ))}
                        </div>
                    ) : (
                         <p className="assets-helper-text">Extract faces from a video to see assets here.</p>
                    )}
                </div>
            </aside>
        );
    }
    
    const EMOJI_LIST = ['😀', '😂', '😍', '🤔', '🔥', '🚀', '⭐', '❤️', '👍', '💯', '💰', '🤯'];

    return (
        <aside className="editor-properties-panel">
             <div className="properties-section">
                <div className="properties-title">Arrange</div>
                <div className="form-group">
                    <label>X Position</label>
                    <input type="number" value={Math.round(selectedElement.x)} onChange={e => updateElement(selectedElement.id, { x: parseInt(e.target.value, 10) })} />
                </div>
                <div className="form-group">
                    <label>Y Position</label>
                    <input type="number" value={Math.round(selectedElement.y)} onChange={e => updateElement(selectedElement.id, { y: parseInt(e.target.value, 10) })} />
                </div>
                <div className="form-group">
                    <label>Width</label>
                    <input type="number" value={Math.round(selectedElement.width)} onChange={e => updateElement(selectedElement.id, { width: parseInt(e.target.value, 10) })} />
                </div>
                <div className="form-group">
                    <label>Height</label>
                    <input type="number" value={Math.round(selectedElement.height)} onChange={e => updateElement(selectedElement.id, { height: parseInt(e.target.value, 10) })} />
                </div>
                <div className="form-group">
                    <label>Rotation</label>
                    <input type="range" min="0" max="360" value={selectedElement.rotation || 0} onChange={e => updateElement(selectedElement.id, { rotation: parseInt(e.target.value, 10) })} />
                </div>
            </div>

            {selectedElement.type === 'text' && (
                <div className="properties-section">
                    <div className="properties-title">Text Properties</div>
                    <div className="form-group">
                        <label>Font</label>
                        <select value={selectedElement.fontFamily} onChange={e => updateElement(selectedElement.id, { fontFamily: e.target.value })}>
                            {FONT_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}
                        </select>
                    </div>
                     <div className="form-group">
                        <label>Font Size</label>
                        <input type="number" value={selectedElement.fontSize} onChange={e => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value, 10) })} />
                    </div>
                    <div className="form-group">
                        <label>Color</label>
                        <input type="color" value={selectedElement.color} onChange={e => updateElement(selectedElement.id, { color: e.target.value })} />
                    </div>
                </div>
            )}
            
            {selectedElement.type === 'shape' && (
                <div className="properties-section">
                    <div className="properties-title">Shape Properties</div>
                     <div className="form-group">
                        <label>Shape Type</label>
                        <select value={selectedElement.shape} onChange={e => updateElement(selectedElement.id, { shape: e.target.value as 'rectangle' | 'ellipse' })}>
                            <option value="rectangle">Rectangle</option>
                            <option value="ellipse">Ellipse</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Fill Color</label>
                        <input type="color" value={selectedElement.backgroundColor} onChange={e => updateElement(selectedElement.id, { backgroundColor: e.target.value })} />
                    </div>
                     <div className="form-group">
                        <label>Border Width</label>
                        <input type="number" min="0" value={selectedElement.borderWidth || 0} onChange={e => updateElement(selectedElement.id, { borderWidth: parseInt(e.target.value, 10) })} />
                    </div>
                     <div className="form-group">
                        <label>Border Color</label>
                        <input type="color" value={selectedElement.borderColor || '#000000'} onChange={e => updateElement(selectedElement.id, { borderColor: e.target.value })} />
                    </div>
                </div>
            )}
            
            {selectedElement.type === 'emoji' && (
                <div className="properties-section">
                    <div className="properties-title">Emoji</div>
                    <div className="emoji-grid">
                        {EMOJI_LIST.map(emoji => (
                            <button key={emoji} className="emoji-btn" onClick={() => updateElement(selectedElement.id, { content: emoji })}>
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <button className="modal-btn-secondary" onClick={() => deleteElement(selectedElement.id)}>Delete Element</button>
        </aside>
    );
};


// --- HELPER FUNCTIONS & API CALLS ---
const fetchTranscript = async (videoUrl: string): Promise<string | null> => {
    try {
        const transcriptServiceUrl = `https://yt-trans.vercel.app/api/transcript?videoUrl=${encodeURIComponent(videoUrl)}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(transcriptServiceUrl)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) {
            console.warn(`Transcript fetch failed with status: ${response.status}. This can happen if a transcript isn't available.`);
            return null;
        }
        
        const responseText = await response.text();
        try {
            const transcriptData = JSON.parse(responseText);
            if (Array.isArray(transcriptData) && transcriptData.length > 0) {
                return transcriptData.map(item => item.text).join(' ');
            }
            return null;
        } catch (jsonError) {
            console.warn("Failed to parse transcript response as JSON, it may be an HTML error page.", jsonError);
            return null;
        }
    } catch (e) {
        console.error("Error fetching transcript:", e);
        return null;
    }
};

const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve({ base64: result.split(',')[1], mimeType: file.type });
        };
        reader.onerror = error => reject(error);
    });
};

const imageUrlToBase64 = async (url: string): Promise<{ base64: string, mimeType: string }> => {
    // Use a CORS proxy to fetch the image data to avoid tainted canvas issues
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const result = reader.result as string;
            resolve({ base64: result.split(',')[1], mimeType: blob.type });
        };
        reader.onerror = reject;
    });
};

const generateDesign = async (ai: GoogleGenAI, images: ImageAsset[], logo: LogoState, colors: ColorsState, preferences: PreferencesState, platform: Platform, transcript: string | null, originalTitle: string, currentText: TextState): Promise<DesignResult[]> => {
    const platformConfig = PLATFORM_CONFIGS[platform];
    const originalYouTubeThumbnail = images.find(img => img.id.startsWith('yt_'));
    const userImages = images.filter(img => !img.id.startsWith('yt_'));

    let finalPrompt: string;
    const allImageParts: Part[] = [];

    const logoPart: Part | null = (logo.base64 && logo.mimeType)
        ? { inlineData: { data: logo.base64, mimeType: logo.mimeType } }
        : null;
        
    userImages.forEach(img => allImageParts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
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
        
        allImageParts.unshift({ inlineData: { data: originalYouTubeThumbnail.base64, mimeType: originalYouTubeThumbnail.mimeType } });

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
    // To generate multiple variations, we must call the API multiple times in parallel.
    const generationPromises: Promise<GenerateContentResponse>[] = [];

    for (let i = 0; i < preferences.variations; i++) {
        const promise = ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: finalPrompt }, ...allImageParts] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        generationPromises.push(promise);
    }

    const responses = await Promise.all(generationPromises);

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
};

const adaptImageForPlatform = async (ai: GoogleGenAI, sourceImage: ImageAsset, targetPlatform: Platform, text: TextState, logo: LogoState, colors: ColorsState, preferences: PreferencesState): Promise<DesignResult[]> => {
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
};

const generateImage = async (ai: GoogleGenAI, prompt: string, negativePrompt: string, aspectRatio: ImagenAspectRatio): Promise<ImageAsset | null> => {
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

const editImage = async (ai: GoogleGenAI, originalImage: ImageAsset, prompt: string, mask: ImageAsset | null): Promise<ImageAsset> => {
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

const upscaleImage = async (ai: GoogleGenAI, image: ImageAsset): Promise<ImageAsset> => {
    // Placeholder for a real upscale API call. For now, we simulate it.
    await new Promise(res => setTimeout(res, 1500));
    // In a real scenario, you'd send the image.base64 to an upscale model/API
    // and receive a new, higher-resolution base64 string.
    console.log("Upscaling image:", image.id);
    return { ...image }; // Returning the same image for now.
};

const extractFramesFromVideo = (videoUrl: string, startTime: number, endTime: number, frameCount: number): Promise<ImageAsset[]> => {
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
                
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
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
        
        video.onerror = (e) => reject("Error loading video for frame extraction.");
        video.load();
    });
};

const extractFacesFromImage = async (ai: GoogleGenAI, sourceImage: ImageAsset): Promise<ImageAsset[]> => {
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

const analyzeVideoAndSuggestStyles = async (ai: GoogleGenAI, frames: ImageAsset[]): Promise<AnalysisResult> => {
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

const getAssistantResponse = async (ai: GoogleGenAI, message: string, state: { text: TextState, colors: ColorsState, preferences: PreferencesState }) => {
    const prompt = `
You are a helpful and clever AI Design Assistant. Your job is to interpret a user's request and turn it into a specific JSON command to modify the design settings. Color changes are applied instantly to existing designs.

Here are the available Vibe & Styles: ${VIBE_STYLES.join(', ')}

**CURRENT DESIGN STATE:**
\`\`\`json
${JSON.stringify(state, null, 2)}
\`\`\`

**USER REQUEST:** "${message}"

**YOUR TASK:**
Based on the user's request and the current state, respond with a single JSON object. The JSON object must have three properties: "action", "payload", and "responseMessage".
- "action": A string representing the command.
- "payload": An object with the data for that command.
- "responseMessage": A friendly, conversational message to show the user, acknowledging the action was taken.

**Available Actions & Payloads:**
1.  **"update_text"**: To change the headline or subheadline.
    - payload: \`{ "field": "headline" | "subheadline", "value": "new text" }\`
2.  **"update_color"**: To change a single color in the palette.
    - payload: \`{ "color": "primary" | "secondary" | "accent" | "background", "value": "#hexcode" }\`
3.  **"suggest_colors"**: To suggest a completely new color palette based on a theme.
    - payload: \`{ "colors": { "primary": "#hexcode", "secondary": "#hexcode", "accent": "#hexcode", "background": "#hexcode" } }\`
4.  **"update_preference"**: To change the vibe/style.
    - payload: \`{ "field": "style", "value": "A style from the available list" }\`
5.  **"none"**: If the request is conversational, a general question, or cannot be mapped to an action.
    - payload: \`{}\`

**Examples:**
- User: "Change the main title to 'Epic Adventures'" -> \`{"action": "update_text", "payload": {"field": "headline", "value": "Epic Adventures"}, "responseMessage": "Headline updated!"}\`
- User: "Make the background color dark blue" -> \`{"action": "update_color", "payload": {"color": "background", "value": "#00008B"}, "responseMessage": "Okay, I've set the background to dark blue."}\`
- User: "I want a more professional vibe" -> \`{"action": "update_preference", "payload": {"field": "style", "value": "Professional & Corporate"}, "responseMessage": "Got it, switching to a more professional style."}\`
- User: "Can you give me a color palette that feels like a sunset?" -> \`{"action": "suggest_colors", "payload": {"colors": {"primary": "#FF6B6B", "secondary": "#FFD166", "accent": "#4D96FF", "background": "#1A237E"}}, "responseMessage": "Here is a sunset-inspired palette for you."}\`
- User: "Hello, how are you?" -> \`{"action": "none", "payload": {}, "responseMessage": "I'm doing great, ready to help you design!"}\`

Now, generate the JSON response for the user's request.
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING },
                    payload: { type: Type.OBJECT },
                    responseMessage: { type: Type.STRING },
                },
                required: ["action", "payload", "responseMessage"]
            }
        }
    });

    try {
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse assistant response:", e);
        return {
            action: 'none',
            payload: {},
            responseMessage: "I'm sorry, I had a little trouble understanding that. Could you try rephrasing?"
        };
    }
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);