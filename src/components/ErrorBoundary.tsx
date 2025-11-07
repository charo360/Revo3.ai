import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorTracker } from '../core/infrastructure/error-tracking';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches React component errors and tracks them
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Track error
        errorTracker.trackError(error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
        });

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{
                    padding: '2rem',
                    maxWidth: '600px',
                    margin: '2rem auto',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                }}>
                    <h2 style={{ color: '#d32f2f', marginTop: 0 }}>
                        Something went wrong
                    </h2>
                    <p style={{ color: '#666', marginBottom: '1rem' }}>
                        We're sorry, but something unexpected happened. Our team has been notified.
                    </p>
                    {import.meta.env.DEV && this.state.error && (
                        <details style={{ marginBottom: '1rem' }}>
                            <summary style={{ cursor: 'pointer', color: '#1976d2' }}>
                                Error Details (Development Only)
                            </summary>
                            <pre style={{
                                backgroundColor: '#f5f5f5',
                                padding: '1rem',
                                borderRadius: '4px',
                                overflow: 'auto',
                                fontSize: '0.875rem',
                                marginTop: '0.5rem',
                            }}>
                                {this.state.error.toString()}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}
                    <button
                        onClick={this.handleReset}
                        style={{
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                        }}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
