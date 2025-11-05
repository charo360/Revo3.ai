import React, { FC, useRef, useState, useEffect } from 'react';
import { VideoAsset, AnalysisResult, VeoAspectRatio, Platform } from '../../types';
import { Module } from './Module';
import { ICONS } from '../../constants';
import { PLATFORM_CONFIGS } from '../../constants/platforms';
import { VideoTrimmer } from './VideoTrimmer';

interface VideoModuleProps {
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
    isPrimary?: boolean;
    hideForImagePlatforms?: boolean;
    onGenerateVideo: (prompt: string, ar: VeoAspectRatio) => void;
    isGeneratingVideo: boolean;
    platform: Platform;
}

export const VideoModule: FC<VideoModuleProps> = (props) => {
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
