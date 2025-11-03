import React, { FC, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const SignupPage: FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp, signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { error: signUpError, session } = await signUp(email, password) as any;
            
            if (signUpError) {
                if (signUpError.name === 'EmailConfirmationRequired') {
                    setError('Email confirmation is enabled in Supabase. Please go to your Supabase dashboard → Authentication → Providers → Email → Toggle OFF "Confirm email" to allow direct signup.');
                } else if (signUpError.name === 'ConfigurationError') {
                    setError(signUpError.message || 'Supabase is not configured. Please set up your environment variables.');
                } else if (signUpError.name === 'NetworkError' || signUpError.message?.includes('Failed to fetch') || signUpError.message?.includes('ERR_NAME_NOT_RESOLVED')) {
                    setError('Unable to connect to Supabase. Please verify your Supabase project URL is correct. Check your .env.local file and ensure VITE_SUPABASE_URL points to a valid Supabase project.');
                } else {
                    setError(signUpError.message || 'Failed to sign up');
                }
            } else if (session) {
                // User is already signed in (email confirmation disabled)
                navigate('/app');
            } else {
                // Try to sign in (fallback)
                const { error: signInError } = await signIn(email, password);
                
                if (signInError) {
                    if (signInError.message?.includes('Email not confirmed')) {
                        setError('Email confirmation is required. Please disable it in Supabase dashboard: https://supabase.com/dashboard/project/yxsscklulcedocisdrje/auth/providers');
                    } else {
                        setError('Account created but sign-in failed. Please try signing in manually.');
                        setTimeout(() => navigate('/login'), 2000);
                    }
                } else {
                    navigate('/app');
                }
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <Link to="/" className="auth-logo">Revo3.ai</Link>
                    <h1>Create your account</h1>
                    <p>Start creating amazing designs with AI</p>
                </div>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error">{error}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>
                    
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    <p>
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
