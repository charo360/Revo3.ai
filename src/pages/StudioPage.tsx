import React, { FC, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { App } from '../App';
import { Platform } from '../types';
import { DashboardViewToPlatform, PlatformToRoute } from '../routes/paths';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

interface StudioPageProps {
    view?: string;
}

export const StudioPage: FC<StudioPageProps> = ({ view = 'home' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { refreshCredits } = useAuth();
    
    // Map view to platform
    const platform = (DashboardViewToPlatform[view as keyof typeof DashboardViewToPlatform] || 'youtube_improve') as Platform;
    
    // Handle payment success/failure
    useEffect(() => {
        const payment = searchParams.get('payment');
        const sessionId = searchParams.get('session_id');
        
        if (payment === 'success' && sessionId) {
            // Immediately refresh credits to get latest data
            refreshCredits().catch(console.error);
            
            // Show success alert with Revo3 colors
            Swal.fire({
                icon: 'success',
                title: 'Payment Successful!',
                text: 'Your credits have been added to your account.',
                confirmButtonText: 'View Credits',
                showCancelButton: true,
                cancelButtonText: 'Continue',
                confirmButtonColor: '#571c86',
                cancelButtonColor: '#6a2d9b',
                buttonsStyling: true,
                customClass: {
                    popup: 'revo-swal-popup',
                    title: 'revo-swal-title',
                    confirmButton: 'revo-swal-confirm',
                    cancelButton: 'revo-swal-cancel',
                },
            }).then(async (result) => {
                // Remove query params from URL
                searchParams.delete('payment');
                searchParams.delete('session_id');
                setSearchParams(searchParams, { replace: true });
                
                // Refresh credits again after a short delay to ensure webhook processed
                setTimeout(() => {
                    refreshCredits().catch(console.error);
                }, 2000);
                
                if (result.isConfirmed) {
                    navigate('/dashboard/credits');
                }
            });
        } else if (payment === 'cancelled') {
            // Show cancellation alert with Revo3 colors
            Swal.fire({
                icon: 'info',
                title: 'Payment Cancelled',
                text: 'Your payment was cancelled. No charges were made.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#571c86',
                buttonsStyling: true,
                customClass: {
                    popup: 'revo-swal-popup',
                    title: 'revo-swal-title',
                    confirmButton: 'revo-swal-confirm',
                },
            }).then(() => {
                // Remove query params from URL
                searchParams.delete('payment');
                setSearchParams(searchParams, { replace: true });
            });
        }
    }, [searchParams, navigate, setSearchParams, refreshCredits]);
    
    // Handle platform change by navigating to the correct route
    const handlePlatformChange = (newPlatform: Platform) => {
        const route = PlatformToRoute[newPlatform as keyof typeof PlatformToRoute];
        if (route && route !== location.pathname) {
            navigate(route);
        }
    };
    
    return <App initialPlatform={platform} onPlatformChange={handlePlatformChange} />;
};
