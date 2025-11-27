import React, { FC, useRef, useState } from 'react';
import { toast } from 'react-toastify';
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
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        if (file.size > 100 * 1024 * 1024) {
          toast.error('Video file size must be less than 100MB');
          return;
        }
        if (!file.type.startsWith('video/')) {
          toast.error('Please upload a valid video file');
          return;
        }
        const url = URL.createObjectURL(file);
        props.onVideoAssetChange({ id: `vid_${Date.now()}`, file, url });
        props.onAnalysisResultChange(null);
        setVideoUrl('');
        toast.success('Video uploaded successfully!');
      } catch (error: any) {
        toast.error(`Failed to upload video: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleUrlSubmit = async () => {
    const url = urlInputRef.current?.value.trim();
    if (!url) {
      toast.error('Please enter a video URL');
      return;
    }

    try {
      setVideoUrl(url);
      if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('youtube.com/shorts')) {
        toast.warning(
          'YouTube URLs cannot be loaded directly due to CORS restrictions. ' +
          'For YouTube videos, please use the "Improve Thumbnail" feature or download and upload the video file.',
          { autoClose: 5000 }
        );
        if (urlInputRef.current) urlInputRef.current.value = '';
        setVideoUrl('');
        return;
      } else {
        toast.info('Loading video from URL...');
        const response = await fetch(url, { method: 'GET', headers: { Accept: 'video/*' } });
        if (!response.ok) {
          throw new Error(`Cannot load video: ${response.statusText}`);
        }
        const blob = await response.blob();
        if (!blob.type.startsWith('video/')) throw new Error('Invalid video file.');
        const objectUrl = URL.createObjectURL(blob);
        props.onVideoAssetChange({
          id: `vid_${Date.now()}`,
          file: new File([blob], 'video.mp4', { type: blob.type }),
          url: objectUrl,
        });
        props.onAnalysisResultChange(null);
        toast.success('Video URL loaded successfully!');
      }
    } catch (error: any) {
      console.error('Error loading video:', error);
      toast.error(`Failed to load video: ${error.message || 'Unknown error'}`);
      setVideoUrl('');
      if (urlInputRef.current) urlInputRef.current.value = '';
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
    setVideoUrl('');
    if (urlInputRef.current) urlInputRef.current.value = '';
  };

  const handleGenerateClick = () => {
    if (!videoPrompt || props.isGeneratingVideo) return;
    const config = PLATFORM_CONFIGS[props.platform];
    const aspectRatio: VeoAspectRatio = config.aspectRatio === '9:16' ? '9:16' : '16:9';
    props.onGenerateVideo(videoPrompt, aspectRatio);
  };

  if (props.hideForImagePlatforms) return null;

  const title = props.isPrimary ? 'Start with a Video' : 'Or Upload a Video';
  const showDivider = !props.isPrimary;

  return (
    <Module icon={ICONS.VIDEO} title={title}>
      {showDivider && <div className="section-divider" />}

      {/* === Uploaded or Linked Video === */}
      {props.videoAsset ? (
        <>
          {props.videoAsset.url.includes('youtube.com') || props.videoAsset.url.includes('youtu.be') ? (
            <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <p className="font-semibold text-gray-800 mb-2">YouTube Video URL Loaded</p>
              <p className="text-sm text-gray-600 break-all mb-3">{props.videoAsset.url}</p>
              <p className="text-sm text-gray-500">
                You can analyze frames or generate designs from this video.
              </p>
              <button
                onClick={handleRemoveVideo}
                className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all"
              >
                Remove URL
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <VideoTrimmer
                  videoUrl={props.videoAsset.url}
                  onVideoLoad={handleVideoLoad}
                  trimTimes={props.trimTimes}
                  onTrimTimesChange={props.onTrimTimesChange}
                  videoDuration={videoDuration}
                />
                <button
                  onClick={handleRemoveVideo}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg z-10 shadow-lg"
                  title="Remove video"
                >
                  &times;
                </button>
              </div>
            </>
          )}

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={props.onAnalyzeVideo}
              disabled={props.isAnalyzing}
              className="flex-1 sm:flex-none px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            >
              {props.isAnalyzing ? 'Analyzing...' : 'Analyze Style'}
            </button>
            <button
              onClick={props.onExtractFaces}
              disabled={props.isExtractingFaces}
              className="flex-1 sm:flex-none px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            >
              {props.isExtractingFaces ? 'Extracting...' : 'Extract Faces'}
            </button>
          </div>

          {props.isAnalyzing && (
            <div className="mt-4 flex items-center gap-2 text-gray-600 text-sm">
              <div className="spinner border-indigo-500" />
              <span>Analyzing video frames...</span>
            </div>
          )}
        </>
      ) : props.isGeneratingVideo ? (
        <div className="text-center py-8">
          <div className="spinner mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-1">Generating video...</p>
          <p className="text-sm text-gray-500">This can take a few minutes. Please don’t close this window.</p>
        </div>
      ) : (
        <>
          {/* === Upload Area === */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer py-10 px-4 text-center"
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-indigo-500 opacity-70 mb-2"
            >
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            <p className="font-medium text-gray-700">Drag & drop your video here</p>
            <p className="text-sm text-gray-500">or click to browse</p>
            <p className="text-xs text-gray-400 mt-2">Supports MP4, MOV, AVI up to 100MB</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
            />
          </div>

          {/* === URL Input Section === */}
         {/* === URL Input Section (Column Layout) === */}
<div className="my-10">
  <div className="flex items-center justify-center mb-6">
    <div className="flex-grow border-t border-gray-200"></div>
    <span className="mx-4 text-sm text-gray-500 font-medium tracking-wide">
      OR PASTE A VIDEO URL
    </span>
    <div className="flex-grow border-t border-gray-200"></div>
  </div>

  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all max-w-md mx-auto">
    <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-2 text-center">
      Video URL
    </label>

    <div className="relative w-full mb-4">
      <input
        id="video-url"
        type="text"
        ref={urlInputRef}
        placeholder="Paste YouTube, Vimeo, or direct video link..."
        className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 transition-all"
        onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
      />
      <svg
        className="absolute left-3 top-2.5 text-gray-400"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 10.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4.5l4 4v-11l-4 4z" />
      </svg>
    </div>

    <button
      onClick={handleUrlSubmit}
      className="w-full px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 transition-all"
    >
      Load Video
    </button>

    <p className="mt-4 text-xs text-gray-500 text-center">
      Supports YouTube, Vimeo, or direct URLs (.mp4, .mov).<br />
      Press{' '}
      <kbd className="px-1 py-0.5 text-gray-700 bg-gray-100 rounded border text-xs">
        Enter
      </kbd>{' '}
      to submit.
    </p>
  </div>
</div>


          {/* === Generate Video Section === */}
          <div className="mt-10">
            <div className="flex items-center justify-center mb-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-4 text-sm text-gray-500 font-medium tracking-wide">
                OR GENERATE A VIDEO BACKGROUND
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <label htmlFor="generate-video-prompt" className="block text-sm font-medium text-gray-700 mb-2">
              Describe the video you want
            </label>
            <textarea
              id="generate-video-prompt"
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              placeholder="e.g., Abstract blue and purple flowing lines"
              className="w-full h-24 text-sm border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none placeholder-gray-400 transition-all"
            />

            <button
              onClick={handleGenerateClick}
              disabled={props.isGeneratingVideo || !videoPrompt}
              className="mt-4 w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            >
              {props.isGeneratingVideo ? (
                <div className="spinner" />
              ) : (
                ICONS.VIDEO
              )}
              {props.isGeneratingVideo ? 'Generating...' : 'Generate Video'}
            </button>

            <p className="mt-3 text-xs text-gray-500 text-center">
              Video generation is a premium feature. Ensure{' '}
              <a
                href="https://ai.google.dev/gemini-api/docs/billing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 hover:underline"
              >
                billing is enabled
              </a>{' '}
              for your API key.
            </p>
          </div>
        </>
      )}
    </Module>
  );
};
