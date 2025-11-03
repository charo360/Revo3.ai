import React, { FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { PricingPage } from './pages/PricingPage';
import { BusinessPage } from './pages/BusinessPage';
import { StudioPage } from './pages/StudioPage';
import { YouTubePage } from './pages/platforms/YouTubePage';
import { PodcastPage } from './pages/platforms/PodcastPage';
import { TikTokPage } from './pages/platforms/TikTokPage';
import { TwitterPage } from './pages/platforms/TwitterPage';
import { RepurposePage } from './pages/platforms/RepurposePage';
import { App } from './App';

export const AppRouter: FC = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/business" element={<BusinessPage />} />
                    <Route path="/platforms/youtube" element={<YouTubePage />} />
                    <Route path="/platforms/podcast" element={<PodcastPage />} />
                    <Route path="/platforms/tiktok" element={<TikTokPage />} />
                    <Route path="/platforms/twitter" element={<TwitterPage />} />
                    <Route path="/platforms/repurpose" element={<RepurposePage />} />
                    <Route
                        path="/app"
                        element={
                            <ProtectedRoute>
                                <App />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};
