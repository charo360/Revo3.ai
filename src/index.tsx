import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from './AppRouter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { errorTracker } from './core/infrastructure/error-tracking';
import { performanceMonitor } from './core/infrastructure/performance-monitoring';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/landing.css';

declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        readonly aistudio: AIStudio;
    }
}

// Initialize error tracking and performance monitoring
if (typeof window !== 'undefined') {
    // Global error handler
    window.addEventListener('error', (event) => {
        const error = event.error || new Error(event.message);
        errorTracker.trackError(error, {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
        });
        // Show toast for user-facing errors (skip ResizeObserver and similar)
        if (event.message && 
            !event.message.includes('ResizeObserver') && 
            !event.message.includes('Non-Error promise rejection') &&
            !event.message.includes('Script error')) {
            toast.error(`An error occurred: ${event.message}`);
        }
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason instanceof Error 
            ? event.reason 
            : new Error(String(event.reason));
        errorTracker.trackError(error, {
            unhandledRejection: true,
        });
        // Show toast for user-facing errors (skip ResizeObserver and similar)
        const message = error instanceof Error ? error.message : String(event.reason);
        if (message && 
            !message.includes('ResizeObserver') && 
            !message.includes('Non-Error promise rejection') &&
            !message.includes('Script error')) {
            toast.error(`An error occurred: ${message}`);
        }
    });

    // Track page load performance
    performanceMonitor.mark('app-start');
}

const root = createRoot(document.getElementById('root')!);
root.render(
    <ErrorBoundary>
        <AppRouter />
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
        />
    </ErrorBoundary>
);
