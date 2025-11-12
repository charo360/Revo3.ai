import React, { FC, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '../App';
import { Platform } from '../types';
import { DashboardViewToPlatform, PlatformToRoute } from '../routes/paths';

interface StudioPageProps {
    view?: string;
}

export const StudioPage: FC<StudioPageProps> = ({ view = 'home' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Map view to platform
    const platform = (DashboardViewToPlatform[view as keyof typeof DashboardViewToPlatform] || 'youtube_improve') as Platform;
    
    // Handle platform change by navigating to the correct route
    const handlePlatformChange = (newPlatform: Platform) => {
        const route = PlatformToRoute[newPlatform as keyof typeof PlatformToRoute];
        if (route && route !== location.pathname) {
            navigate(route);
        }
    };
    
    return <App initialPlatform={platform} onPlatformChange={handlePlatformChange} />;
};
