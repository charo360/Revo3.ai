import React, { createContext, useContext, useEffect, useState, FC, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getUserCredits, CreditBalance } from '../services/payments/creditService';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    credits: CreditBalance | null;
    refreshCredits: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string) => Promise<{ error: any; session?: Session | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [credits, setCredits] = useState<CreditBalance | null>(null);
    const [creditsLoading, setCreditsLoading] = useState(false);

    // Refresh credits function - invalidates cache and fetches fresh data
    const refreshCredits = useCallback(async () => {
        if (!user?.id) {
            setCredits(null);
            return;
        }

        setCreditsLoading(true);
        try {
            // Force fresh fetch by bypassing any cache
            const freshCredits = await getUserCredits(user.id);
            setCredits(freshCredits);
            
            // Update localStorage with fresh data
            if (freshCredits) {
                localStorage.setItem(`credits_${user.id}`, JSON.stringify({
                    ...freshCredits,
                    lastUpdated: Date.now()
                }));
            }
        } catch (error) {
            console.error('Error refreshing credits:', error);
        } finally {
            setCreditsLoading(false);
        }
    }, [user?.id]);

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
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            
            // Refresh credits when user changes
            if (session?.user?.id) {
                await refreshCredits();
            } else {
                setCredits(null);
                // Clear credits from localStorage on sign out
                localStorage.removeItem(`credits_${session?.user?.id}`);
            }
        });

        return () => subscription.unsubscribe();
    }, [refreshCredits]);

    // Load credits when user is available
    useEffect(() => {
        if (user?.id && !creditsLoading) {
            refreshCredits();
        }
    }, [user?.id, refreshCredits, creditsLoading]);

    // Set up real-time subscription for credit updates
    useEffect(() => {
        if (!user?.id) return;

        // Subscribe to credit transactions changes
        const creditSubscription = supabase
            .channel(`user_credits_${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'credit_transactions',
                    filter: `user_id=eq.${user.id}`,
                },
                async (payload) => {
                    console.log('Credit transaction change detected:', payload);
                    // Refresh credits when any transaction occurs
                    await refreshCredits();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_credits',
                    filter: `user_id=eq.${user.id}`,
                },
                async (payload) => {
                    console.log('User credits change detected:', payload);
                    // Refresh credits when balance changes
                    await refreshCredits();
                }
            )
            .subscribe();

        return () => {
            creditSubscription.unsubscribe();
        };
    }, [user?.id, refreshCredits]);

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
                    emailRedirectTo: `${window.location.origin}/dashboard`
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
        <AuthContext.Provider value={{ user, session, loading, credits, refreshCredits, signIn, signUp, signOut }}>
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
