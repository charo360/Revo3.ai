import React from 'react';
import { Platform } from '../types';
import { ICONS } from './icons';

export const PLATFORM_CONFIGS: Record<Platform, { 
    title: string; 
    icon: React.ReactNode; 
    aspectRatio: string; 
    promptSnippet: string; 
}> = {
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
        aspectRatio: "9:16",
        promptSnippet: "This is for repurposing long videos into viral short-form content. AI analyzes the video to identify the most engaging moments, creates optimized clips for YouTube Shorts, TikTok, Instagram Reels, and other platforms. The content should be attention-grabbing, well-paced, and optimized for maximum engagement."
    },
    twitter: {
        title: "Twitter Card",
        icon: ICONS.TWITTER,
        aspectRatio: "1.91:1",
        promptSnippet: "This is for a Twitter card image. The design should be bold and concise to work well in a fast-moving feed."
    }
};

export const PLATFORM_ORDER: Platform[] = ['youtube_improve', 'youtube', 'podcast', 'tiktok', 'repurpose', 'twitter'];
