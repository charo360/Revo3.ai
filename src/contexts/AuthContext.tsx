import React, { createContext, useContext, useEffect, useState, FC } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string) => Promise<{ error: any; session?: Session | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            
            if (error) {
                console.error('Sign in error:', error);
                return { error };
            }
            
            return { error: null };
        } catch (err: any) {
            console.error('Sign in exception:', err);
            return { 
                error: {
                    message: err.message || 'Failed to connect to authentication server. Please check your internet connection.',
                    name: 'NetworkError'
                }
            };
        }
    };

    const signUp = async (email: string, password: string) => {
        try {
            // Check if Supabase is properly configured
            if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
                return { 
                    error: {
                        message: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file. See https://supabase.com for setup instructions.',
                        name: 'ConfigurationError'
                    }
                };
            }

            const { data, error } = await supabase.auth.signUp({ 
                email, 
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/app`
                }
            });
            
            if (error) {
                console.error('Sign up error:', error);
                return { error };
            }
            
            // Check if user is signed in immediately (email confirmation disabled)
            if (data.user && data.session) {
                console.log('✅ User signed up and signed in successfully (email confirmation disabled)');
                return { error: null, session: data.session };
            }
            
            // If no session, email confirmation is required
            if (data.user && !data.session) {
                console.warn('⚠️ Email confirmation required - no session returned');
                return { 
                    error: {
                        message: 'Email confirmation is enabled in Supabase. Please disable it in your Supabase dashboard (Authentication → Providers → Email → Toggle OFF "Confirm email")',
                        name: 'EmailConfirmationRequired'
                    }
                };
            }
            
            return { error: null };
        } catch (err: any) {
            console.error('Sign up exception:', err);
            
            // Check for DNS resolution errors
            if (err.message?.includes('ERR_NAME_NOT_RESOLVED') || err.message?.includes('Failed to fetch')) {
                return { 
                    error: {
                        message: 'Unable to connect to Supabase. Please verify your Supabase project URL is correct in .env.local. The URL should be in format: https://xxxxx.supabase.co',
                        name: 'NetworkError'
                    }
                };
            }
            
            return { 
                error: {
                    message: err.message || 'Failed to connect to authentication server. Please check your internet connection.',
                    name: 'NetworkError'
                }
            };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
