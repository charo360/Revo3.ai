import React, { FC } from 'react';
import {
    Platform, ImageAsset, VideoAsset, TextState, LogoState, ColorsState,
    PreferencesState, AnalysisResult, ImagenAspectRatio, VeoAspectRatio
} from '../../types';
import { YouTubeModule } from './YouTubeModule';
import { VideoModule } from './VideoModule';
import { ImageModule } from './ImageModule';
import { TextContentModule } from './TextContentModule';
import { LogoModule } from './LogoModule';
import { ColorPaletteModule } from './ColorPaletteModule';
import { DesignPreferencesModule } from './DesignPreferencesModule';
import { GenerateButton } from './GenerateButton';

interface SidebarProps {
    platform: Platform;
    text: TextState;
    onTextChange: React.Dispatch<React.SetStateAction<TextState>>;
    images: ImageAsset[];
    onImagesChange: (i: ImageAsset[]) => void;
    videoAsset: VideoAsset | null;
    onVideoAssetChange: (v: VideoAsset | null) => void;
    trimTimes: { start: number; end: number };
    onTrimTimesChange: (t: { start: number; end: number }) => void;
    isAnalyzing: boolean;
    onAnalyzeVideo: () => void;
    analysisResult: AnalysisResult | null;
    onAnalysisResultChange: (r: AnalysisResult | null) => void;
    onExtractFaces: () => void;
    isExtractingFaces: boolean;
    logo: LogoState;
    onLogoChange: (l: LogoState) => void;
    colors: ColorsState;
    onColorsChange: (c: ColorsState) => void;
    preferences: PreferencesState;
    onPreferencesChange: (p: PreferencesState) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    onGenerateImage: (p: string, np: string, ar: ImagenAspectRatio) => Promise<ImageAsset | null>;
    isGeneratingImage: boolean;
    onGenerateVideo: (p: string, ar: VeoAspectRatio) => void;
    isGeneratingVideo: boolean;
    onTranscriptChange: (t: string | null) => void;
    onOriginalTitleChange: (t: string) => void;
}

export const Sidebar: FC<SidebarProps> = (props) => {
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
                        videoAsset={props.videoAsset}
                        onVideoAssetChange={props.onVideoAssetChange}
                        trimTimes={props.trimTimes}
                        onTrimTimesChange={props.onTrimTimesChange}
                        isAnalyzing={props.isAnalyzing}
                        onAnalyzeVideo={props.onAnalyzeVideo}
                        analysisResult={props.analysisResult}
                        onAnalysisResultChange={props.onAnalysisResultChange}
                        onExtractFaces={props.onExtractFaces}
                        isExtractingFaces={props.isExtractingFaces}
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
                    <TextContentModule
                        platform={props.platform}
                        text={props.text}
                        onTextChange={props.onTextChange}
                    />
                    <LogoModule
                        logo={props.logo}
                        onLogoChange={props.onLogoChange}
                    />
                    <ColorPaletteModule
                        colors={props.colors}
                        onColorsChange={props.onColorsChange}
                    />
                    <DesignPreferencesModule
                        preferences={props.preferences}
                        onPreferencesChange={props.onPreferencesChange}
                    />
                    <GenerateButton
                        onGenerate={props.onGenerate}
                        isGenerating={props.isGenerating}
                    />
                </>
            )}
        </aside>
    );
};
