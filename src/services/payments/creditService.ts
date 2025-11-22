/**
 * Credit Management Service
 * Handles all credit-related operations: checking balance, deducting credits, tracking usage
 */

import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

export interface CreditBalance {
    balance: number;
    total_earned: number;
    total_spent: number;
}

export interface CreditUsage {
    feature_type: string;
    feature_id?: string;
    credits_used: number;
    created_at: string;
    platform?: string;
}

const CREDITS_PER_GENERATION = 2;

/**
 * Get user's current credit balance
 * Always fetches fresh data from database (no cache)
 */
export async function getUserCredits(userId: string, forceRefresh: boolean = true): Promise<CreditBalance | null> {
    try {
        // If forceRefresh is false, try localStorage first (for initial load only)
        if (!forceRefresh && typeof window !== 'undefined') {
            const cached = localStorage.getItem(`credits_${userId}`);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    // Use cache if less than 30 seconds old
                    if (parsed.lastUpdated && Date.now() - parsed.lastUpdated < 30000) {
                        // Still fetch fresh data in background but return cached
                        getUserCredits(userId, true).catch(() => {});
                        return { balance: parsed.balance, total_earned: parsed.total_earned, total_spent: parsed.total_spent };
                    }
                } catch (e) {
                    // Invalid cache, continue to fetch
                }
            }
        }

        // Always fetch fresh data from database
        const { data, error } = await supabase
            .from('user_credits')
            .select('balance, total_earned, total_spent')
            .eq('user_id', userId)
            .single();

        if (error) {
            // If no record exists, create one with 0 credits
            if (error.code === 'PGRST116') {
                const { data: newData, error: insertError } = await supabase
                    .from('user_credits')
                    .insert({ user_id: userId, balance: 0, total_earned: 0, total_spent: 0 })
                    .select('balance, total_earned, total_spent')
                    .single();

                if (insertError) {
                    console.error('Error creating user credits record:', insertError);
                    return null;
                }
                
                // Update localStorage
                if (typeof window !== 'undefined' && newData) {
                    localStorage.setItem(`credits_${userId}`, JSON.stringify({
                        ...newData,
                        lastUpdated: Date.now()
                    }));
                }
                
                return newData;
            }
            console.error('Error fetching user credits:', error);
            return null;
        }

        // Update localStorage with fresh data
        if (typeof window !== 'undefined' && data) {
            localStorage.setItem(`credits_${userId}`, JSON.stringify({
                ...data,
                lastUpdated: Date.now()
            }));
        }

        return data;
    } catch (error) {
        console.error('Exception fetching user credits:', error);
        return null;
    }
}

/**
 * Check if user has enough credits for an operation
 */
export async function hasEnoughCredits(userId: string, creditsNeeded: number = CREDITS_PER_GENERATION): Promise<boolean> {
    const balance = await getUserCredits(userId);
    if (!balance) return false;
    return balance.balance >= creditsNeeded;
}

/**
 * Deduct credits from user's balance
 * Returns true if successful, false if insufficient credits
 */
export async function deductCredits(
    userId: string,
    feature: string,
    credits: number = CREDITS_PER_GENERATION,
    metadata?: Record<string, any>
): Promise<boolean> {
    try {
        // First check if user has enough credits
        const hasCredits = await hasEnoughCredits(userId, credits);
        if (!hasCredits) {
            toast.error(`Insufficient credits. You need ${credits} credits to ${feature}. Please purchase credits to continue.`);
            return false;
        }

        // Use a database function to atomically deduct credits
        const { data, error } = await supabase.rpc('deduct_user_credits', {
            p_user_id: userId,
            p_amount: credits,
            p_description: `Used ${credits} credits for ${feature}`,
            p_metadata: metadata || {}
        });

        if (error) {
            console.error('Error deducting credits:', error);
            toast.error('Failed to deduct credits. Please try again.');
            return false;
        }

        // Check if deduction was successful
        if (data && !data.success) {
            toast.error(data.error || 'Insufficient credits');
            return false;
        }

        // Log credit usage - pass the transaction ID if available
        const transactionId = data?.transaction_id || null;
        await logCreditUsage(userId, feature, credits, transactionId, metadata);

        return true;
    } catch (error) {
        console.error('Exception deducting credits:', error);
        toast.error('An error occurred while processing credits.');
        return false;
    }
}

/**
 * Add credits to user's balance (used by webhook after successful payment)
 */
export async function addCredits(
    userId: string,
    credits: number,
    description: string,
    referenceId: string,
    metadata?: Record<string, any>
): Promise<boolean> {
    try {
        const { data, error } = await supabase.rpc('add_user_credits', {
            p_user_id: userId,
            p_amount: credits,
            p_description: description,
            p_reference_id: referenceId,
            p_metadata: metadata || {}
        });

        if (error) {
            console.error('Error adding credits:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Exception adding credits:', error);
        return false;
    }
}

/**
 * Log credit usage for analytics
 */
async function logCreditUsage(
    userId: string,
    feature: string,
    credits: number,
    transactionId: string | null = null,
    metadata?: Record<string, any>
): Promise<void> {
    try {
        // Map feature name to feature_type
        const featureTypeMap: Record<string, string> = {
            'improve thumbnail': 'thumbnail',
            'youtube thumbnail': 'thumbnail',
            'podcast cover': 'thumbnail',
            'tiktok cover': 'thumbnail',
            'twitter card': 'thumbnail',
            'content repurpose': 'repurpose',
            'video generation': 'video_generation',
            'image generation': 'image_generation',
        };

        const featureType = featureTypeMap[feature.toLowerCase()] || 'premium';
        const platform = metadata?.platform || null;

        // If transaction_id is not provided, get the most recent usage transaction
        let finalTransactionId = transactionId;
        if (!finalTransactionId) {
            const { data: latestTransaction } = await supabase
                .from('credit_transactions')
                .select('id')
                .eq('user_id', userId)
                .eq('transaction_type', 'usage')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            
            finalTransactionId = latestTransaction?.id || null;
        }

        // Only insert if we have a transaction_id (required by schema)
        if (finalTransactionId) {
            await supabase.from('credit_usage').insert({
                user_id: userId,
                transaction_id: finalTransactionId,
                feature_type: featureType,
                feature_id: metadata?.feature_id || null,
                credits_used: credits,
                platform: platform,
                metadata: metadata || {}
            });
        }
    } catch (error) {
        console.error('Error logging credit usage:', error);
        // Don't throw - this is non-critical
    }
}

/**
 * Get credit usage breakdown for a user
 */
export async function getCreditUsageBreakdown(userId: string, limit: number = 10): Promise<CreditUsage[]> {
    try {
        const { data, error } = await supabase
            .from('credit_usage')
            .select('feature_type, feature_id, credits_used, created_at, platform')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching credit usage:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Exception fetching credit usage:', error);
        return [];
    }
}

/**
 * Get credit transaction history
 */
export async function getCreditTransactions(userId: string, limit: number = 20) {
    try {
        const { data, error } = await supabase
            .from('credit_transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Exception fetching transactions:', error);
        return [];
    }
}

/**
 * Get payment history (purchases)
 */
export async function getPaymentHistory(userId: string, limit: number = 20) {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select(`
                *,
                credit_packs (
                    name,
                    credits,
                    price_cents
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching payment history:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Exception fetching payment history:', error);
        return [];
    }
}

export { CREDITS_PER_GENERATION };

