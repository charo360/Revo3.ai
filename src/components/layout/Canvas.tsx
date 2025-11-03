import React, { FC } from 'react';
import { DesignResult, Platform, ImageAsset } from '../../types';
import { ICONS } from '../../constants';
import { DesignResults } from '../design/DesignResults';

interface CanvasProps {
    results: DesignResult[];
    isGenerating: boolean;
    platform: Platform;
    onEdit: (result: DesignResult) => void;
    onAiEdit: (image: ImageAsset) => void;
    onUpscale: (image: ImageAsset) => void;
    onDownload: (image: ImageAsset) => void;
    onPreview: (image: ImageAsset) => void;
    onAdapt: (image: ImageAsset, platform: Platform) => void;
    onAssistantToggle: () => void;
}

export const Canvas: FC<CanvasProps> = ({ 
    results, 
    isGenerating, 
    platform, 
    onEdit, 
    onAiEdit, 
    onUpscale, 
    onDownload, 
    onPreview, 
    onAdapt, 
    onAssistantToggle 
}) => (
    <main className="canvas-area">
        {isGenerating ? (
            <div className="canvas-placeholder">
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <p>Generating designs... this may take a moment.</p>
                </div>
            </div>
        ) : results.length > 0 ? (
            <DesignResults 
                results={results} 
                platform={platform} 
                onEdit={onEdit} 
                onAiEdit={onAiEdit} 
                onUpscale={onUpscale} 
                onDownload={onDownload} 
                onPreview={onPreview} 
                onAdapt={onAdapt} 
            />
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
