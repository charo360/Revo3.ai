import React, { FC, Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { performanceMonitor } from './core/infrastructure/performance-monitoring';
import { AppRoutes } from './routes/app_route';

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
                    <AppRoutes />
                </BrowserRouter>
            </AuthProvider>
        </ErrorBoundary>
    );
};
