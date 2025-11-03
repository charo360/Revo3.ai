import React, { FC, useState } from 'react';
import { ImageAsset, TextState } from '../../types';
import { Module } from './Module';
import { ICONS } from '../../constants';
import { imageUrlToBase64 } from '../../utils/imageUtils';
import { fetchTranscript } from '../../utils/youtubeUtils';

interface YouTubeModuleProps {
    onImagesChange: (i: ImageAsset[]) => void;
    onTextChange: React.Dispatch<React.SetStateAction<TextState>>;
    images: ImageAsset[];
    onGenerate: () => void;
    isGenerating: boolean;
    onTranscriptChange: (t: string | null) => void;
    onOriginalTitleChange: (t: string) => void;
}

export const YouTubeModule: FC<YouTubeModuleProps> = ({ 
    onImagesChange, onTextChange, images, onGenerate, isGenerating, 
    onTranscriptChange, onOriginalTitleChange 
}) => {
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

        } catch (e: any) {
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
