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

// Platform Landing Pages (Public)
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

// Platform Studio Pages (Protected - Dashboard)
const ImproveThumbnailPage = lazy(() => 
  import('../pages/platforms/ImproveThumbnailPage').then(m => ({ default: m.ImproveThumbnailPage }))
);
const YouTubeThumbnailPage = lazy(() => 
  import('../pages/platforms/YouTubeThumbnailPage').then(m => ({ default: m.YouTubeThumbnailPage }))
);
const PodcastCoverPage = lazy(() => 
  import('../pages/platforms/PodcastCoverPage').then(m => ({ default: m.PodcastCoverPage }))
);
const TikTokThumbnailPage = lazy(() => 
  import('../pages/platforms/TikTokThumbnailPage').then(m => ({ default: m.TikTokThumbnailPage }))
);
const TwitterCardPage = lazy(() => 
  import('../pages/platforms/TwitterCardPage').then(m => ({ default: m.TwitterCardPage }))
);
const ContentRepurposePage = lazy(() => 
  import('../pages/platforms/ContentRepurposePage').then(m => ({ default: m.ContentRepurposePage }))
);

// Legacy StudioPage (kept for backward compatibility)
const StudioPage = lazy(() => 
  import('../pages/StudioPage').then(m => ({ default: m.StudioPage }))
);
const ProfilePage = lazy(() => 
  import('../pages/ProfilePage').then(m => ({ default: m.ProfilePage }))
);
const CreditManagementPage = lazy(() => 
  import('../pages/CreditManagementPage').then(m => ({ default: m.CreditManagementPage }))
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

          {/* Protected Dashboard Routes - Platform-Specific Pages */}
          <Route
            path={AppRoutePaths.dashboard.root}
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <ImproveThumbnailPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path={AppRoutePaths.dashboard.home}
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <ImproveThumbnailPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path={AppRoutePaths.dashboard.improveThumbnail}
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <ImproveThumbnailPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path={AppRoutePaths.dashboard.youtubeThumbnail}
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <YouTubeThumbnailPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path={AppRoutePaths.dashboard.podcastCover}
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <PodcastCoverPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path={AppRoutePaths.dashboard.contentRepurpose}
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <ContentRepurposePage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path={AppRoutePaths.dashboard.twitterCard}
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <TwitterCardPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path={AppRoutePaths.dashboard.tiktokThumbnail}
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <TikTokThumbnailPage />
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

          {/* Credit Management Route */}
          <Route
            path={AppRoutePaths.creditManagement}
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <CreditManagementPage />
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
