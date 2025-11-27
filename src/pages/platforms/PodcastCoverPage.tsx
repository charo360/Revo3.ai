import React, { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '../../App';
import { Platform } from '../../types';
import { PlatformToRoute } from '../../routes/paths';
import { usePaymentHandler } from '../../hooks/usePaymentHandler';

/**
 * Podcast Cover Page
 * Dedicated page for creating podcast covers
 * Optimized for square format (1:1) and podcast-specific features
 */
export const PodcastCoverPage: FC = () => {
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
        <div className="platform-page podcast-cover-page">
            <App initialPlatform="podcast" onPlatformChange={handlePlatformChange} />
        </div>
    );
};

