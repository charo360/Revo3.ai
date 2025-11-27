import React, { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '../../App';
import { Platform } from '../../types';
import { PlatformToRoute } from '../../routes/paths';
import { usePaymentHandler } from '../../hooks/usePaymentHandler';

/**
 * Improve Thumbnail Page
 * Dedicated page for improving existing YouTube thumbnails
 * Uses youtube_improve platform with YouTubeModule for URL input
 */
export const ImproveThumbnailPage: FC = () => {
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
        <div className="platform-page improve-thumbnail-page">
            <App initialPlatform="youtube_improve" onPlatformChange={handlePlatformChange} />
        </div>
    );
};

