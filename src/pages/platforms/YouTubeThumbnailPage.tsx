import React, { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '../../App';
import { Platform } from '../../types';
import { PlatformToRoute } from '../../routes/paths';
import { usePaymentHandler } from '../../hooks/usePaymentHandler';

/**
 * YouTube Thumbnail Page
 * Dedicated page for creating new YouTube thumbnails from scratch
 * Uses youtube platform with standard modules (Video, Image, Text, etc.)
 */
export const YouTubeThumbnailPage: FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    usePaymentHandler();
    
    // Handle platform change by navigating to the correct route
    const handlePlatformChange = (newPlatform: Platform) => {
        const route = PlatformToRoute[newPlatform as keyof typeof PlatformToRoute];
        if (route && route !== location.pathname) {
            navigate(route);
        }
    };
    
    return (
        <div className="platform-page youtube-thumbnail-page">
            <App initialPlatform="youtube" onPlatformChange={handlePlatformChange} />
        </div>
    );
};

