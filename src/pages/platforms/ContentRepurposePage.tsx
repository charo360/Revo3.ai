import React, { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '../../App';
import { Platform } from '../../types';
import { PlatformToRoute } from '../../routes/paths';
import { usePaymentHandler } from '../../hooks/usePaymentHandler';

/**
 * Content Repurpose Page
 * Dedicated page for repurposing long-form content into short-form
 * Uses repurpose platform with RepurposeModule
 */
export const ContentRepurposePage: FC = () => {
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
        <div className="platform-page content-repurpose-page">
            <App initialPlatform="repurpose" onPlatformChange={handlePlatformChange} />
        </div>
    );
};

