// Type definitions for the AI Design Studio application

export type Platform = 'youtube' | 'youtube_improve' | 'podcast' | 'tiktok' | 'repurpose' | 'twitter';
export type ImagenAspectRatio = "16:9" | "1.91:1" | "9:16" | "1:1" | "4:3" | "3:4";
export type VeoAspectRatio = "16:9" | "9:16";
export type ElementType = 'text' | 'image' | 'shape' | 'emoji';

export interface ImageAsset {
    id: string;
    url: string;
    base64: string;
    mimeType: string;
}

export interface VideoAsset {
    id: string;
    file: File;
    url: string;
}

export interface LogoState {
    url: string | null;
    base64: string | null;
    mimeType: string | null;
    size: number;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
}

export interface TextState {
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

export interface ColorsState {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
}

export interface PreferencesState {
    style: string;
    variations: number;
    drama: number;
}

export interface DesignResult {
    image?: ImageAsset;
    description?: string;
    isEditing?: boolean;
    isUpscaling?: boolean;
    suggestedHeadline?: string;
    suggestedSubheadline?: string;
}

export interface AnalysisResult {
    suggestedColors: ColorsState;
    suggestedStyle: string;
}

export interface AssistantMessage {
    id: number;
    sender: 'user' | 'ai';
    text: string;
    isActionableSuggestion?: boolean;
}

export interface EditableElement {
    id: string;
    type: ElementType;
    x: number; 
    y: number;
    width: number; 
    height: number;
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

export interface EditorState {
    background: ImageAsset;
    elements: EditableElement[];
    aspectRatio: string;
}
