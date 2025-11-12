/**
 * App Routes Configuration
 * Professional routing setup with lazy loading and code splitting
 */

import React, { FC, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AppRoutePaths } from './paths';

// ==================== Lazy Loading Components ====================
// Public Pages
const LandingPage = lazy(() => 
  import('../pages/LandingPage').then(m => ({ default: m.LandingPage }))
);
const LoginPage = lazy(() => 
  import('../pages/LoginPage').then(m => ({ default: m.LoginPage }))
);
const SignupPage = lazy(() => 
  import('../pages/SignupPage').then(m => ({ default: m.SignupPage }))
);
const FeaturesPage = lazy(() => 
  import('../pages/FeaturesPage').then(m => ({ default: m.FeaturesPage }))
);
const PricingPage = lazy(() => 
  import('../pages/PricingPage').then(m => ({ default: m.PricingPage }))
);
const BusinessPage = lazy(() => 
  import('../pages/BusinessPage').then(m => ({ default: m.BusinessPage }))
);

// Platform Pages
const YouTubePage = lazy(() => 
  import('../pages/platforms/YouTubePage').then(m => ({ default: m.YouTubePage }))
);
const PodcastPage = lazy(() => 
  import('../pages/platforms/PodcastPage').then(m => ({ default: m.PodcastPage }))
);
const TikTokPage = lazy(() => 
  import('../pages/platforms/TikTokPage').then(m => ({ default: m.TikTokPage }))
);
const TwitterPage = lazy(() => 
  import('../pages/platforms/TwitterPage').then(m => ({ default: m.TwitterPage }))
);
const RepurposePage = lazy(() => 
  import('../pages/platforms/RepurposePage').then(m => ({ default: m.RepurposePage }))
);

// Protected Pages
const StudioPage = lazy(() => 
  import('../pages/StudioPage').then(m => ({ default: m.StudioPage }))
);
const ProfilePage = lazy(() => 
  import('../pages/ProfilePage').then(m => ({ default: m.ProfilePage }))
);

// ==================== Loading Fallback ====================
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

// ==================== App Routes Component ====================
export const AppRoutes: FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path={AppRoutePaths.home} element={<LandingPage />} />
          <Route path={AppRoutePaths.login} element={<LoginPage />} />
          <Route path={AppRoutePaths.signup} element={<SignupPage />} />
          <Route path={AppRoutePaths.features} element={<FeaturesPage />} />
          <Route path={AppRoutePaths.pricing} element={<PricingPage />} />
          <Route path={AppRoutePaths.business} element={<BusinessPage />} />

          {/* Platform Information Pages */}
          <Route path={AppRoutePaths.platforms.youtube} element={<YouTubePage />} />
          <Route path={AppRoutePaths.platforms.podcast} element={<PodcastPage />} />
          <Route path={AppRoutePaths.platforms.tiktok} element={<TikTokPage />} />
          <Route path={AppRoutePaths.platforms.twitter} element={<TwitterPage />} />
          <Route path={AppRoutePaths.platforms.repurpose} element={<RepurposePage />} />

          {/* Protected Dashboard Routes */}
          <Route
            path={AppRoutePaths.dashboard.root}
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <StudioPage view="home" />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path={AppRoutePaths.dashboard.home}
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <StudioPage view="home" />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path={AppRoutePaths.dashboard.improveThumbnail}
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <StudioPage view="improve-thumbnail" />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path={AppRoutePaths.dashboard.youtubeThumbnail}
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <StudioPage view="youtube-thumbnail" />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path={AppRoutePaths.dashboard.podcastCover}
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <StudioPage view="podcast-cover" />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path={AppRoutePaths.dashboard.contentRepurpose}
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <StudioPage view="content-repurpose" />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path={AppRoutePaths.dashboard.twitterCard}
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <StudioPage view="twitter-card" />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path={AppRoutePaths.dashboard.tiktokThumbnail}
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <StudioPage view="tiktok-thumbnail" />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />

          {/* Profile Route */}
          <Route
            path={AppRoutePaths.profile}
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <ProfilePage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to={AppRoutePaths.home} replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};
