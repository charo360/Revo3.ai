/**
 * Repurpose Module Component
 * 
 * Main component for content repurposing functionality
 */

import React, { FC, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { GoogleGenAI } from "@google/genai";
import { repurposeVideo } from '../services/repurposeService';
import { RepurposeResult, ClipGenerationOptions } from '../../../types/repurpose';
import { useAuth } from '../../../contexts/AuthContext';

interface RepurposeModuleProps {
    onResultsGenerated?: (results: RepurposeResult) => void;
}

export const RepurposeModule: FC<RepurposeModuleProps> = ({ onResultsGenerated }) => {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const urlInputRef = useRef<HTMLInputElement>(null);
    
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<RepurposeResult | null>(null);
    
    const [options, setOptions] = useState<ClipGenerationOptions>({
        min_duration: 15,
        max_duration: 60,
        target_clip_count: 10,
        platforms: ['youtube_shorts', 'tiktok', 'instagram_reels'],
        include_captions: true,
        include_transitions: true,
        virality_threshold: 70,
        overlap_prevention: true,
    });

    const ai = useRef<GoogleGenAI>(new GoogleGenAI({ apiKey: process.env.API_KEY }));

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                // Check file size (max 500MB for videos)
                if (file.size > 500 * 1024 * 1024) {
                    toast.error('Video file size must be less than 500MB');
                    return;
                }
                
                // Check file type
                if (!file.type.startsWith('video/')) {
                    toast.error('Please upload a valid video file');
                    return;
                }
                
                setVideoFile(file);
                setVideoUrl(URL.createObjectURL(file));
                setVideoPreviewUrl(URL.createObjectURL(file));
                toast.success('Video uploaded successfully!');
            } catch (error: any) {
                toast.error(`Failed to upload video: ${error.message || 'Unknown error'}`);
            }
        }
    };

    const handleUrlSubmit = () => {
        const url = urlInputRef.current?.value.trim();
        if (url) {
            setVideoUrl(url);
            setVideoPreviewUrl(url);
            toast.success('Video URL set!');
        }
    };

    const handleRepurpose = async () => {
        if (!user) {
            toast.error('Please sign in to repurpose videos');
            return;
        }

        // Check credits before repurposing (content repurpose costs 2 credits)
        const { hasEnoughCredits, deductCredits, CREDITS_PER_GENERATION } = await import('../../../services/payments/creditService');
        const hasCredits = await hasEnoughCredits(user.id, CREDITS_PER_GENERATION);
        if (!hasCredits) {
            toast.error(`Insufficient credits. You need ${CREDITS_PER_GENERATION} credits to repurpose videos. Please purchase credits to continue.`);
            return;
        }

        if (!videoFile && !videoUrl) {
            toast.error('Please upload a video or provide a video URL');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setResults(null);

        try {
            // Convert URL to blob if needed and create a valid video URL
            let videoBlob: File | Blob;
            let validVideoUrl: string;
            let shouldRevokeBlobUrl = false;
            
            if (videoFile) {
                videoBlob = videoFile;
                // Create blob URL for file uploads
                validVideoUrl = URL.createObjectURL(videoFile);
                shouldRevokeBlobUrl = true;
            } else if (videoUrl) {
                // Fetch video from URL
                toast.info('Downloading video...');
                const response = await fetch(videoUrl);
                if (!response.ok) {
                    throw new Error('Failed to fetch video from URL');
                }
                videoBlob = await response.blob();
                // Create blob URL from fetched blob
                validVideoUrl = URL.createObjectURL(videoBlob);
                shouldRevokeBlobUrl = true;
            } else {
                throw new Error('No video source provided');
            }

            // Update progress
            setProgress(5);

            // Create progress callback
            const progressCallback = (current: number, total: number) => {
                const percent = Math.round((current / total) * 95) + 5; // 5-100%
                setProgress(percent);
            };

            // Run repurpose
            try {
                const result = await repurposeVideo(
                    ai.current,
                    videoBlob,
                    validVideoUrl, // Use the blob URL
                    user.id,
                    options,
                    undefined, // originalTitle
                    undefined, // transcript
                    progressCallback
                );

                setProgress(100);
                setResults(result);
                onResultsGenerated?.(result);
                
                // Deduct credits after successful repurpose
                const { deductCredits, CREDITS_PER_GENERATION } = await import('../../../services/payments/creditService');
                await deductCredits(user.id, 'Content Repurpose', CREDITS_PER_GENERATION, { 
                    feature: 'content_repurpose', 
                    clipCount: result.clips.length 
                });
                
                toast.success(`Successfully generated ${result.clips.length} viral clips!`);
            } finally {
                // Clean up blob URL only after processing is complete
                if (shouldRevokeBlobUrl) {
                    URL.revokeObjectURL(validVideoUrl);
                }
            }
        } catch (error: any) {
            console.error('Error repurposing video:', error);
            toast.error(`Failed to repurpose video: ${error.message || 'Unknown error'}`);
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    return (
        <div className="repurpose-module">
            <div className="repurpose-header">
                <h2>Content Repurpose</h2>
                <p>Turn long videos into viral shorts with AI</p>
            </div>

            {/* Video Upload/URL Section */}
            <div className="repurpose-upload-section">
                <div className="upload-content">
                    {/* File Upload */}
                    <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                        {videoPreviewUrl ? (
                            <div style={{ width: '100%' }}>
                                <video 
                                    src={videoPreviewUrl} 
                                    controls 
                                    className="video-preview"
                                    style={{ maxWidth: '100%', maxHeight: '400px', margin: '0 auto', display: 'block' }}
                                />
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setVideoFile(null);
                                        setVideoUrl('');
                                        setVideoPreviewUrl('');
                                    }}
                                    className="remove-video-btn"
                                    style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Remove Video
                                </button>
                            </div>
                        ) : (
                            <>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                <p>Click to upload or drag and drop</p>
                                <p className="upload-hint">MP4, MOV, AVI up to 500MB</p>
                            </>
                        )}
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="video/*" 
                        style={{ display: 'none' }} 
                    />

                    {/* URL Input */}
                    <div className="url-input-section" style={{ marginTop: '1rem' }}>
                        <input 
                            type="text" 
                            ref={urlInputRef}
                            placeholder="Or paste YouTube, Vimeo, or video URL..."
                            className="url-input"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleUrlSubmit();
                                }
                            }}
                        />
                        <button onClick={handleUrlSubmit} className="url-submit-btn">
                            Load Video
                        </button>
                    </div>
                </div>
            </div>

            {/* Options Section */}
            <div className="repurpose-options">
                <h3>Generation Options</h3>
                
                <div className="options-grid">
                    <div className="option-group">
                        <label>Target Clip Count</label>
                        <input 
                            type="number" 
                            min="1" 
                            max="20" 
                            value={options.target_clip_count}
                            onChange={(e) => setOptions({ ...options, target_clip_count: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="option-group">
                        <label>Min Duration (seconds)</label>
                        <input 
                            type="number" 
                            min="5" 
                            max="60" 
                            value={options.min_duration}
                            onChange={(e) => setOptions({ ...options, min_duration: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="option-group">
                        <label>Max Duration (seconds)</label>
                        <input 
                            type="number" 
                            min="15" 
                            max="120" 
                            value={options.max_duration}
                            onChange={(e) => setOptions({ ...options, max_duration: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="option-group">
                        <label>Virality Threshold</label>
                        <input 
                            type="number" 
                            min="0" 
                            max="100" 
                            value={options.virality_threshold}
                            onChange={(e) => setOptions({ ...options, virality_threshold: parseInt(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="platform-selection">
                    <label>Platforms</label>
                    <div className="platform-checkboxes">
                        {['youtube_shorts', 'tiktok', 'instagram_reels', 'twitter'].map(platform => (
                            <label key={platform} className="platform-checkbox">
                                <input 
                                    type="checkbox"
                                    checked={options.platforms.includes(platform as any)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setOptions({ ...options, platforms: [...options.platforms, platform as any] });
                                        } else {
                                            setOptions({ ...options, platforms: options.platforms.filter(p => p !== platform) });
                                        }
                                    }}
                                />
                                <span>{platform.replace('_', ' ').toUpperCase()}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="feature-toggles">
                    <label className="feature-toggle">
                        <input 
                            type="checkbox"
                            checked={options.include_captions}
                            onChange={(e) => setOptions({ ...options, include_captions: e.target.checked })}
                        />
                        <span>Include Captions</span>
                    </label>
                    <label className="feature-toggle">
                        <input 
                            type="checkbox"
                            checked={options.include_transitions}
                            onChange={(e) => setOptions({ ...options, include_transitions: e.target.checked })}
                        />
                        <span>Include Transitions</span>
                    </label>
                    <label className="feature-toggle">
                        <input 
                            type="checkbox"
                            checked={options.overlap_prevention}
                            onChange={(e) => setOptions({ ...options, overlap_prevention: e.target.checked })}
                        />
                        <span>Prevent Overlapping Clips</span>
                    </label>
                </div>
            </div>

            {/* Process Button */}
            <div className="repurpose-actions">
                <button 
                    onClick={handleRepurpose}
                    disabled={isProcessing || (!videoFile && !videoUrl)}
                    className="repurpose-btn primary"
                >
                    {isProcessing ? (
                        <>
                            <div className="spinner" style={{ width: '20px', height: '20px', marginRight: '8px' }}></div>
                            Processing... {progress}%
                        </>
                    ) : (
                        'Generate Viral Clips'
                    )}
                </button>
            </div>

            {/* Results Section */}
            {results && (
                <div className="repurpose-results">
                    <h3>Generated Clips ({results.clips.length})</h3>
                    <div className="results-stats">
                        <div className="stat">
                            <span className="stat-label">Average Virality Score</span>
                            <span className="stat-value">{results.statistics.average_virality_score.toFixed(1)}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Processing Time</span>
                            <span className="stat-value">{results.statistics.processing_time_seconds.toFixed(1)}s</span>
                        </div>
                    </div>

                    <div className="clips-grid">
                        {results.clips.map((clip) => (
                            <div key={clip.id} className="clip-card">
                                <div className="clip-thumbnail">
                                    {/* Show actual video player instead of thumbnail */}
                                    {clip.clip_url && (
                                        <video 
                                            src={clip.clip_url} 
                                            controls 
                                            preload="metadata"
                                            style={{ 
                                                width: '100%', 
                                                height: '300px', 
                                                objectFit: 'contain',
                                                backgroundColor: '#000'
                                            }}
                                        />
                                    )}
                                    <div className="clip-score">
                                        🔥 {clip.virality_score}
                                    </div>
                                </div>
                                <div className="clip-info">
                                    <h4>{clip.title}</h4>
                                    <p className="clip-duration">{clip.duration.toFixed(1)}s</p>
                                    <p className="clip-platform">{clip.platform_format.replace('_', ' ').toUpperCase()}</p>
                                    <div className="clip-actions">
                                        <a 
                                            href={clip.clip_url} 
                                            download={`viral-clip-${clip.platform_format}-${clip.virality_score}.mp4`}
                                            className="clip-download-btn"
                                        >
                                            Download
                                        </a>
                                        <button 
                                            className="clip-preview-btn"
                                            onClick={() => {
                                                const video = document.querySelector(`video[src="${clip.clip_url}"]`) as HTMLVideoElement;
                                                if (video) {
                                                    if (video.paused) video.play();
                                                    else video.pause();
                                                }
                                            }}
                                        >
                                            Play/Pause
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

