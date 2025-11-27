/**
 * Repurpose Module Component
 * 
 * Main component for content repurposing functionality
 * Uses server-side processing with queue system
 */

import React, { FC, useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { RepurposeResult, ClipGenerationOptions } from '../../../types/repurpose';
import { useAuth } from '../../../contexts/AuthContext';
import { uploadVideoChunked, uploadVideoFromUrl } from '../../../services/video/uploadService';
import { createRepurposeJob, pollJobStatus, cancelJob } from '../../../services/video/repurposeQueue';
import type { RepurposeJob } from '../../../services/video/repurposeQueue';
import { hasEnoughCredits, deductCredits, CREDITS_PER_GENERATION } from '../../../services/payments/creditService';

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
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);
    const [results, setResults] = useState<RepurposeResult | null>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    
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

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) {
                clearTimeout(pollingRef.current);
            }
        };
    }, []);


    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                // No file size limit - server handles large files
                console.log('[Repurpose] Video file selected:', {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    sizeMB: (file.size / (1024 * 1024)).toFixed(2)
                });
                
                setVideoFile(file);
                setVideoUrl('');
                setVideoPreviewUrl(URL.createObjectURL(file));
                toast.success(`Video selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
            } catch (error: any) {
                toast.error(`Failed to load video: ${error.message || 'Unknown error'}`);
            }
        }
    };

    const handleUrlSubmit = () => {
        const url = urlInputRef.current?.value.trim();
        if (url) {
            setVideoUrl(url);
            setVideoFile(null);
            setVideoPreviewUrl(url);
            toast.success('Video URL set!');
        }
    };

    const stopProcessing = () => {
        if (currentJobId) {
            cancelJob(currentJobId).catch(console.error);
        }
        if (pollingRef.current) {
            clearTimeout(pollingRef.current);
            pollingRef.current = null;
        }
        setIsProcessing(false);
        setIsUploading(false);
        setUploadProgress(0);
        setProcessingProgress(0);
        setCurrentJobId(null);
    };

    const handleRepurpose = async () => {
        if (!user) {
            toast.error('Please sign in to repurpose videos');
            return;
        }

        // Prevent duplicate processing
        if (isProcessing) {
            toast.warning('Processing is already in progress. Please wait...');
            return;
        }

        // Check credits with timeout and immediate feedback
        console.log('[Repurpose] Checking credits...');
        
        // Set processing state immediately to show loading
        setIsProcessing(true);
        setIsUploading(false);
        setUploadProgress(0);
        setProcessingProgress(0);
        setResults(null);
        toast.info('Verifying credits and preparing video...');
        
        let hasCredits = false;
        try {
            // Add timeout to credit check (3 seconds max)
            const creditCheckPromise = hasEnoughCredits(user.id, CREDITS_PER_GENERATION);
            const timeoutPromise = new Promise<boolean>((resolve) => {
                setTimeout(() => {
                    console.warn('[Repurpose] Credit check timeout, assuming sufficient credits');
                    resolve(true); // Assume sufficient credits if timeout
                }, 3000);
            });
            
            hasCredits = await Promise.race([creditCheckPromise, timeoutPromise]);
            console.log('[Repurpose] Credit check result:', hasCredits);
        } catch (error: any) {
            console.error('[Repurpose] Credit check error:', error);
            // Continue anyway if credit check fails (user can be charged later)
            hasCredits = true;
            toast.warning('Could not verify credits. Processing will continue...');
        }
        
        if (!hasCredits) {
            toast.error(`Insufficient credits. You need ${CREDITS_PER_GENERATION} credits to repurpose videos. Please purchase credits to continue.`);
            setIsProcessing(false);
            return;
        }
        
        console.log('[Repurpose] Credits verified, proceeding with upload...');

        if (!videoFile && !videoUrl) {
            toast.error('Please upload a video or provide a video URL');
            return;
        }

        console.log('[Repurpose] Starting repurpose process...', {
            hasVideoFile: !!videoFile,
            hasVideoUrl: !!videoUrl,
            videoFileSize: videoFile?.size,
            options
        });

        // Set uploading state now
        setIsUploading(true);

        try {
            let uploadedVideoId: string;
            let uploadedVideoUrl: string;

            // Step 1: Upload video to server
            toast.info('Uploading video to server...');
            console.log('[Repurpose] Starting video upload...', {
                videoFile: videoFile ? { name: videoFile.name, size: videoFile.size, type: videoFile.type } : null,
                videoUrl: videoUrl || null
            });

            if (videoFile) {
                console.log('[Repurpose] Uploading video file...');
                try {
                    const uploadResult = await uploadVideoChunked(
                        videoFile,
                        user.id,
                        (progress) => {
                            setUploadProgress(progress.percentage);
                            if (progress.percentage < 90) {
                                console.log('[Repurpose] Upload progress:', progress.percentage + '%');
                            } else if (progress.percentage >= 90 && progress.percentage < 100) {
                                // Show progress updates during Edge Function processing
                                const status = progress.percentage === 90 
                                    ? 'Sending to server...' 
                                    : progress.percentage === 95
                                    ? 'Processing upload...'
                                    : 'Finalizing...';
                                console.log(`[Repurpose] Upload progress: ${progress.percentage}% - ${status}`);
                                
                                // Update toast message for long uploads
                                if (progress.percentage === 90) {
                                    toast.info('Large file detected. Uploading to server... This may take a few minutes.', {
                                        autoClose: 5000
                                    });
                                }
                            } else {
                                console.log('[Repurpose] Upload progress:', progress.percentage + '%');
                            }
                        }
                    );
                    console.log('[Repurpose] Upload completed:', uploadResult);
                    uploadedVideoId = uploadResult.videoId;
                    uploadedVideoUrl = uploadResult.publicUrl;
                } catch (uploadError: any) {
                    console.error('[Repurpose] Upload error:', uploadError);
                    throw new Error(`Upload failed: ${uploadError.message || 'Unknown error'}`);
                }
            } else if (videoUrl) {
                console.log('[Repurpose] Processing video from URL...', videoUrl);
                
                // Check if it's a YouTube URL - handle differently
                const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
                
                if (isYouTube) {
                    console.log('[Repurpose] YouTube URL detected, using server-side download...');
                    toast.info('YouTube video detected. Will be downloaded server-side...');
                    
                    // For YouTube URLs, we'll pass the URL directly to the Edge Function
                    // The Edge Function will handle downloading (when yt-dlp is implemented)
                    // For now, create a placeholder video ID and pass the YouTube URL
                    const placeholderVideoId = `youtube_${Date.now()}_${user.id}`;
                    
                    // Store YouTube URL - Edge Function will download it
                    uploadedVideoId = placeholderVideoId;
                    uploadedVideoUrl = videoUrl; // Pass YouTube URL directly
                    
                    toast.success('YouTube URL ready for processing!');
                } else {
                    // For other URLs, try to download directly
                    console.log('[Repurpose] Downloading video from URL...');
                    try {
                        const uploadResult = await uploadVideoFromUrl(
                            videoUrl,
                            user.id,
                            (progress) => {
                                setUploadProgress(progress.percentage);
                                console.log('[Repurpose] Download/upload progress:', progress.percentage + '%');
                            }
                        );
                        console.log('[Repurpose] URL upload completed:', uploadResult);
                        uploadedVideoId = uploadResult.videoId;
                        uploadedVideoUrl = uploadResult.publicUrl;
                    } catch (uploadError: any) {
                        console.error('[Repurpose] URL upload error:', uploadError);
                        throw new Error(`Upload failed: ${uploadError.message || 'Unknown error'}`);
                    }
                }
            } else {
                throw new Error('No video source provided');
            }

            setIsUploading(false);
            setUploadProgress(100);
            toast.success('Video uploaded successfully! Starting processing...');

            // Step 2: Create repurpose job
            console.log('[Repurpose] Creating repurpose job...');
            const jobId = await createRepurposeJob(
                user.id,
                uploadedVideoId,
                uploadedVideoUrl,
                options
            );

            setCurrentJobId(jobId);
            toast.info('Job created! Processing in background...');

            // Step 3: Poll for job status
            console.log('[Repurpose] Starting to poll job status...');
            await pollJobStatus(
                jobId,
                (job) => {
                    // Update progress
                    setProcessingProgress(job.progress);
                    console.log('[Repurpose] Job progress:', job.progress + '%', job.status);

                    // Show status updates
                    if (job.progress === 30) {
                        toast.info('Analyzing video for viral moments...');
                    } else if (job.progress === 50) {
                        toast.info('Generating clips...');
                    } else if (job.progress === 70) {
                        toast.info('Finalizing clips...');
                    }
                },
                (job) => {
                    // Job completed
                    console.log('[Repurpose] Job completed:', job);
                    
                    if (job.result) {
                        // Map the result to match RepurposeResult type
                        const clips = (job.result.clips || []).map((clip: any) => ({
                            id: clip.id || `clip_${Date.now()}`,
                            repurposed_video_id: job.id,
                            clip_url: clip.clip_url || clip.url || '',
                            clip_storage_path: clip.clip_url || clip.url || '',
                            start_time: clip.start_time || 0,
                            end_time: clip.end_time || clip.duration || 0,
                            duration: clip.duration || (clip.end_time - clip.start_time) || 15,
                            virality_score: clip.virality_score || 70,
                            engagement_score: clip.engagement_score || 70,
                            title: clip.title || `Viral Clip`,
                            description: clip.description,
                            thumbnail_url: clip.thumbnail_url,
                            transcript_snippet: clip.transcript_snippet,
                            platform_format: clip.platform_format || 'youtube_shorts',
                            aspect_ratio: clip.aspect_ratio || '9:16',
                            created_at: new Date().toISOString(),
                            metadata: clip.metadata
                        }));

                        const result: RepurposeResult = {
                            repurposed_video: {
                                id: job.id,
                                user_id: job.user_id,
                                original_video_id: job.video_id,
                                original_video_url: job.video_url,
                                original_video_duration: 0, // Will be updated when we have metadata
                                status: 'completed',
                                created_at: job.created_at,
                                updated_at: job.updated_at
                            },
                            clips: clips,
                            ml_analysis: {
                                id: `analysis_${job.id}`,
                                repurposed_video_id: job.id,
                                analysis_version: '1.0',
                                scene_segments: [],
                                audio_analysis: {
                                    overall_volume: 0.5,
                                    speech_presence: 0.5,
                                    music_presence: 0.5,
                                    silence_periods: [],
                                    peak_audio_moments: []
                                },
                                visual_features: {
                                    dominant_colors: [],
                                    brightness_levels: [],
                                    contrast_levels: [],
                                    face_detections: []
                                },
                                engagement_predictions: [],
                                viral_moments: [],
                                created_at: new Date().toISOString(),
                                processing_time_ms: (job.result.statistics?.processing_time_seconds || 0) * 1000
                            },
                            statistics: {
                                total_clips_generated: job.result.statistics?.total_clips || clips.length,
                                average_virality_score: job.result.statistics?.average_virality_score || 0,
                                processing_time_seconds: job.result.statistics?.processing_time_seconds || 0,
                                total_output_size: 0
                            }
                        };

                        setResults(result);
                        onResultsGenerated?.(result);

                        // Deduct credits
                        deductCredits(user.id, 'Content Repurpose', CREDITS_PER_GENERATION, {
                            feature: 'content_repurpose',
                            clipCount: result.clips.length
                        }).catch(console.error);

                        toast.success(`Successfully generated ${result.statistics.total_clips_generated} viral clips!`);
                    } else {
                        throw new Error('Job completed but no result returned');
                    }
                },
                (error) => {
                    // Job failed
                    console.error('[Repurpose] Job failed:', error);
                    toast.error(`Processing failed: ${error.message}`);
                }
            );

        } catch (error: any) {
            console.error('[Repurpose] Error in handleRepurpose:', error);
            console.error('[Repurpose] Error stack:', error.stack);
            console.error('[Repurpose] Error details:', {
                message: error.message,
                name: error.name,
                cause: error.cause
            });
            
            if (error.message?.includes('cancelled')) {
                toast.info('Processing was cancelled.');
            } else if (error.message?.includes('Upload failed')) {
                toast.error(`Upload failed: ${error.message}`, { autoClose: 8000 });
            } else if (error.message?.includes('Failed to create job')) {
                toast.error(`Failed to create processing job: ${error.message}`, { autoClose: 8000 });
            } else {
                toast.error(`Failed to repurpose video: ${error.message || 'Unknown error'}`, { autoClose: 8000 });
            }
        } finally {
            setIsProcessing(false);
            setIsUploading(false);
            setCurrentJobId(null);
        }
    };

    return (
        <div className="repurpose-module klap-style">
            <div className="repurpose-header">
                <h1 className="main-title">Turn Long Videos Into Viral Shorts</h1>
                <p className="subtitle">AI-powered clip generation in seconds</p>
            </div>

            {/* Video Upload/URL Section - Klap Style */}
            <div className="repurpose-upload-section klap-upload">
                {videoPreviewUrl ? (
                    <div className="klap-video-preview">
                        <video 
                            src={videoPreviewUrl} 
                            controls 
                            className="klap-video-player"
                            playsInline
                        />
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setVideoFile(null);
                                setVideoUrl('');
                                setVideoPreviewUrl('');
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="klap-remove-btn"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="klap-upload-zone" onClick={() => fileInputRef.current?.click()}>
                        <div className="klap-upload-content">
                            <div className="klap-upload-icon">
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                                    <circle cx="12" cy="13" r="3"></circle>
                                </svg>
                            </div>
                            <h3 className="klap-upload-title">Drop your video here</h3>
                            <p className="klap-upload-subtitle">or click to browse</p>
                            <p className="klap-upload-hint">MP4, MOV, AVI • No size limit</p>
                        </div>
                    </div>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="video/*" 
                    style={{ display: 'none' }} 
                />

                {!videoPreviewUrl && (
                    <div className="klap-url-section">
                        <div className="klap-url-divider">
                            <span>or paste a URL</span>
                        </div>
                        <div className="klap-url-input-wrapper">
                            <input 
                                type="text" 
                                ref={urlInputRef}
                                placeholder="YouTube, Vimeo, or direct video link..."
                                className="klap-url-input"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleUrlSubmit();
                                    }
                                }}
                            />
                            <button onClick={handleUrlSubmit} className="klap-url-btn">
                                Load
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Options Section */}
            <div className="repurpose-options">
                <h3>Generation Options</h3>
                
                {/* Prominent Number of Videos Input */}
                <div className="number-of-videos-section">
                    <label className="number-of-videos-label">
                        <span className="label-text">Number of Videos to Generate</span>
                        <span className="label-hint">Choose how many viral clips you want (1-50)</span>
                    </label>
                    <div className="number-of-videos-input-wrapper">
                        <input 
                            type="number" 
                            min="1" 
                            max="50" 
                            value={options.target_clip_count}
                            onChange={(e) => {
                                const value = Math.max(1, Math.min(50, parseInt(e.target.value) || 1));
                                setOptions({ ...options, target_clip_count: value });
                            }}
                            className="number-of-videos-input"
                        />
                        <span className="input-suffix">videos</span>
                    </div>
                </div>
                
                <div className="options-grid">

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

            {/* Progress Section - Klap Style */}
            {(isUploading || isProcessing) && (
                <div className="klap-progress-section">
                    {isUploading && (
                        <div className="klap-progress-card">
                            <div className="klap-progress-header">
                                <div className="klap-progress-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                </div>
                                <div className="klap-progress-text">
                                    <h4>Uploading video</h4>
                                    <p>{uploadProgress}% complete</p>
                                </div>
                            </div>
                            <div className="klap-progress-bar">
                                <div className="klap-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        </div>
                    )}
                    {isProcessing && !isUploading && (
                        <div className="klap-progress-card">
                            <div className="klap-progress-header">
                                <div className="klap-progress-icon spinning">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                    </svg>
                                </div>
                                <div className="klap-progress-text">
                                    <h4>Generating viral clips</h4>
                                    <p>
                                        {processingProgress < 30 ? 'Analyzing video...' :
                                         processingProgress < 50 ? 'Detecting viral moments...' :
                                         processingProgress < 70 ? 'Creating clips...' :
                                         processingProgress < 90 ? 'Adding captions...' :
                                         'Finalizing...'} {processingProgress}%
                                    </p>
                                </div>
                            </div>
                            <div className="klap-progress-bar">
                                <div className="klap-progress-fill processing" style={{ width: `${processingProgress}%` }}></div>
                            </div>
                            <button onClick={stopProcessing} className="klap-cancel-btn">
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Process Button */}
            <div className="repurpose-actions">
                <button 
                    onClick={handleRepurpose}
                    disabled={isProcessing || (!videoFile && !videoUrl)}
                    className="repurpose-btn primary"
                >
                    {isProcessing ? (
                        <>
                            <div className="spinner"></div>
                            <span>{isUploading ? `Uploading... ${uploadProgress}%` : `Processing... ${processingProgress}%`}</span>
                        </>
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                            <span>Generate Viral Clips</span>
                        </>
                    )}
                </button>
            </div>

            {/* Results Section */}
            {results && (
                <div className="repurpose-results">
                    <h3>Generated Clips ({results.clips.length})</h3>
                    <div className="results-stats">
                        <div className="stat">
                            <span className="stat-label">Total Clips Generated</span>
                            <span className="stat-value">{results.statistics.total_clips_generated}</span>
                        </div>
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
