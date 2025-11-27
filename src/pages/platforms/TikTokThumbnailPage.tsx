import React, { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '../../App';
import { Platform } from '../../types';
import { PlatformToRoute } from '../../routes/paths';
import { usePaymentHandler } from '../../hooks/usePaymentHandler';

/**
 * TikTok Thumbnail Page
 * Dedicated page for creating TikTok covers
 * Optimized for vertical format (9:16) and viral content
 */
export const TikTokThumbnailPage: FC = () => {
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
        <div className="platform-page tiktok-thumbnail-page">
            <App initialPlatform="tiktok" onPlatformChange={handlePlatformChange} />
        </div>
    );
};

