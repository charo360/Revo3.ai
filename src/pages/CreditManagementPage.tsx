/**
 * Credit Management Page
 * Full page view for managing credits, viewing usage, and purchasing more
 */

import React, { FC } from 'react';
import { Header } from '../components/layout/Header';
import { CreditManagement } from '../components/dashboard/CreditManagement';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Platform } from '../types';

export const CreditManagementPage: FC = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="credit-management-page">
            <Header 
                platform={'youtube_improve' as Platform}
                onPlatformChange={() => {}}
            />
            <div className="credit-management-page-content">
                <CreditManagement />
            </div>
        </div>
    );
};

