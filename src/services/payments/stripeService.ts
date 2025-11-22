/**
 * Stripe Payment Service
 * Handles Stripe Checkout session creation and payment processing
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from '../../lib/supabase';

// Initialize Stripe
let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
    if (!stripePromise) {
        // Try multiple possible environment variable names
        const publishableKey = 
            import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
            import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
            (import.meta.env as any).STRIPE_PUBLISHABLE_KEY;
        
        if (!publishableKey) {
            console.error('Stripe publishable key not found in environment variables');
            console.error('Available env vars:', Object.keys(import.meta.env).filter(k => k.includes('STRIPE')));
            return Promise.resolve(null);
        }
        stripePromise = loadStripe(publishableKey);
    }
    return stripePromise;
}

/**
 * Create a Stripe Checkout session for a credit pack purchase
 * Uses Supabase Edge Function to create the session securely
 */
export async function redirectToCheckout(priceId: string): Promise<void> {
    try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('Please sign in to purchase credits');
        }

        // Get the user's access token for authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error('Not authenticated. Please sign in to purchase credits.');
        }

        // Create checkout session via Supabase Edge Function
        // The function will verify the token and use the authenticated user's ID
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: {
                priceId,
                // Don't send userId/userEmail - function will get them from the auth token
            },
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        });

        if (error) {
            console.error('Error creating checkout session:', error);
            console.error('Full error details:', JSON.stringify(error, null, 2));
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error context:', error.context);
            
            // Try to extract the actual error message from the response body
            let errorMessage = error.message || 'Failed to create checkout session';
            
            // Check if error.context is a Response object and try to read its body
            if (error.context && error.context instanceof Response) {
                try {
                    // Clone the response to read it (responses can only be read once)
                    const clonedResponse = error.context.clone();
                    const responseText = await clonedResponse.text();
                    console.error('Response body:', responseText);
                    
                    try {
                        const responseData = JSON.parse(responseText);
                        if (responseData?.error) {
                            errorMessage = responseData.error;
                        }
                    } catch (parseError) {
                        // If not JSON, use the text as error message
                        if (responseText) {
                            errorMessage = responseText;
                        }
                    }
                } catch (readError) {
                    console.error('Could not read response body:', readError);
                }
            }
            
            // Check if the error has a response body with error details
            if ((error as any).response) {
                try {
                    const responseData = typeof (error as any).response === 'string' 
                        ? JSON.parse((error as any).response)
                        : (error as any).response;
                    if (responseData?.error) {
                        errorMessage = responseData.error;
                    }
                } catch (e) {
                    // Ignore parsing errors
                }
            }
            
            // If there's a context with error details, use that
            if (error.context && typeof error.context === 'object' && !(error.context instanceof Response)) {
                const contextError = (error.context as any).error || (error.context as any).message;
                if (contextError) {
                    errorMessage = contextError;
                }
            }
            
            // Provide helpful error message
            if (error.message?.includes('Function not found') || error.message?.includes('404')) {
                throw new Error('Payment function not deployed. Please deploy the Supabase Edge Function "create-checkout-session". See DEPLOY_EDGE_FUNCTIONS.md for instructions.');
            }
            
            // Show a more helpful error message
            throw new Error(
                errorMessage + 
                '\n\nPlease check the Supabase Edge Function logs for more details: ' +
                'https://supabase.com/dashboard/project/yxsscklulcedocisdrje/functions/create-checkout-session/logs'
            );
        }

        // Check if data contains an error (Edge Function returned error in response body)
        if (data && data.error) {
            console.error('Edge Function returned error:', data.error);
            throw new Error(data.error || 'Edge Function error');
        }

        // Debug: Log what we received
        console.log('Checkout session response:', data);

        if (!data?.sessionId) {
            throw new Error('No session ID returned from server');
        }

        // Stripe's checkout URL should be available in the response
        if (data.url) {
            // Use the URL provided by Stripe - it's fully configured and ready to use
            console.log('Redirecting to Stripe checkout URL:', data.url);
            window.location.href = data.url;
        } else if (data.sessionId) {
            // If URL is not provided, construct it properly
            // Stripe checkout URLs for payment sessions: https://checkout.stripe.com/c/pay/{session_id}
            // The publishable key should be embedded by Stripe, but if not, we'll use the session ID directly
            console.log('Constructing checkout URL from session ID:', data.sessionId);
            const checkoutUrl = `https://checkout.stripe.com/c/pay/${data.sessionId}`;
            console.log('Constructed checkout URL:', checkoutUrl);
            window.location.href = checkoutUrl;
        } else {
            throw new Error('Invalid response from checkout function. No session ID or URL provided.');
        }
    } catch (error: any) {
        console.error('Error redirecting to checkout:', error);
        throw error;
    }
}

/**
 * Get credit pack by Stripe Price ID
 */
export async function getCreditPackByPriceId(priceId: string) {
    try {
        const { data, error } = await supabase
            .from('credit_packs')
            .select('*')
            .eq('stripe_price_id', priceId)
            .single();

        if (error) {
            console.error('Error fetching credit pack:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Exception fetching credit pack:', error);
        return null;
    }
}

