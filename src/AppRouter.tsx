import React, { FC, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { performanceMonitor } from './core/infrastructure/performance-monitoring';

// Lazy load pages for code splitting and better performance
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage').then(m => ({ default: m.FeaturesPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));
const BusinessPage = lazy(() => import('./pages/BusinessPage').then(m => ({ default: m.BusinessPage })));
const StudioPage = lazy(() => import('./pages/StudioPage').then(m => ({ default: m.StudioPage })));
const YouTubePage = lazy(() => import('./pages/platforms/YouTubePage').then(m => ({ default: m.YouTubePage })));
const PodcastPage = lazy(() => import('./pages/platforms/PodcastPage').then(m => ({ default: m.PodcastPage })));
const TikTokPage = lazy(() => import('./pages/platforms/TikTokPage').then(m => ({ default: m.TikTokPage })));
const TwitterPage = lazy(() => import('./pages/platforms/TwitterPage').then(m => ({ default: m.TwitterPage })));
const RepurposePage = lazy(() => import('./pages/platforms/RepurposePage').then(m => ({ default: m.RepurposePage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const App = lazy(() => import('./App').then(m => ({ default: m.App })));

// Loading component
const LoadingFallback: FC = () => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
    }}>
        <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ 
                width: '40px', 
                height: '40px', 
                borderWidth: '4px',
                margin: '0 auto 1rem'
            }}></div>
            <p>Loading...</p>
        </div>
    </div>
);

export const AppRouter: FC = () => {
    React.useEffect(() => {
        // Track route navigation performance
        performanceMonitor.mark('route-render-start');
        return () => {
            performanceMonitor.measure('route-render', 'route-render-start');
        };
    }, []);

    return (
        <ErrorBoundary>
            <AuthProvider>
                <BrowserRouter>
                    <Suspense fallback={<LoadingFallback />}>
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
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <ErrorBoundary>
                                            <App />
                                        </ErrorBoundary>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <ErrorBoundary>
                                            <ProfilePage />
                                        </ErrorBoundary>
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </AuthProvider>
        </ErrorBoundary>
    );
};
