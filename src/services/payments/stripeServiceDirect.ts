/**
 * Direct Stripe Checkout Service (Temporary Workaround)
 * 
 * This is a temporary solution that creates checkout sessions directly
 * using a backend API endpoint. For production, use the Supabase Edge Function.
 * 
 * This approach requires a backend server (Express, Next.js API route, etc.)
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from '../../lib/supabase';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
    if (!stripePromise) {
        const publishableKey = 
            import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
            import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
            (import.meta.env as any).STRIPE_PUBLISHABLE_KEY;
        
        if (!publishableKey) {
            console.error('Stripe publishable key not found');
            return Promise.resolve(null);
        }
        stripePromise = loadStripe(publishableKey);
    }
    return stripePromise;
}

/**
 * Alternative: Create checkout session using direct API call
 * This requires a backend endpoint at /api/create-checkout-session
 */
export async function redirectToCheckoutDirect(priceId: string): Promise<void> {
    try {
        const stripe = await getStripe();
        if (!stripe) {
            throw new Error('Stripe not initialized');
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('Please sign in to purchase credits');
        }

        // Call your backend API (you'll need to create this)
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
            body: JSON.stringify({
                priceId,
                userId: user.id,
                userEmail: user.email,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create checkout session');
        }

        const { sessionId } = await response.json();

        const { error: redirectError } = await stripe.redirectToCheckout({
            sessionId,
        });

        if (redirectError) {
            throw redirectError;
        }
    } catch (error: any) {
        console.error('Error redirecting to checkout:', error);
        throw error;
    }
}

