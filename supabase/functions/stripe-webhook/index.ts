/**
 * Supabase Edge Function: Stripe Webhook Handler
 * 
 * This function handles Stripe webhook events for payment processing.
 * It should be deployed as a Supabase Edge Function.
 * 
 * Environment variables needed in Supabase:
 * - STRIPE_SECRET_KEY: Your Stripe secret key
 * - STRIPE_WEBHOOK_SECRET: Your Stripe webhook signing secret
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key (for admin operations)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2024-11-20.acacia',
    httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
// Custom authentication secret for additional security
// This should match the value in .env.local (WEBHOOK_AUTH_SECRET)
// We verify this secret from the checkout session metadata
const webhookAuthSecret = Deno.env.get('WEBHOOK_AUTH_SECRET') || '';
// Service role key for generating webhook auth token
// This allows us to keep JWT verification enabled while allowing Stripe webhooks
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
// JWT secret for token verification/generation (from .env.local)
const jwtSecret = Deno.env.get('JWT_SECRET') || Deno.env.get('SUPABASE_JWT_SECRET') || '';
// Refresh token secret (from .env.local)
const refreshSecret = Deno.env.get('REFRESH_SECRET') || Deno.env.get('SUPABASE_REFRESH_SECRET') || '';

// CORS headers for webhook requests
// Note: With JWT verification enabled, we need to provide a valid token
// We'll use the service role key as a Bearer token for webhook requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // JWT verification is disabled for this function (verify_jwt = false in _config.toml)
    // We rely on Stripe signature verification + custom secret for security
    // No Authorization header is required since Stripe doesn't send one
    console.log('Webhook request received (JWT verification disabled, using Stripe signature verification)');

    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        return new Response(
            JSON.stringify({ error: 'No signature provided' }),
            { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
        );
    }

    try {
        const body = await req.text();
        // Use constructEventAsync for Deno/Edge Functions (async context required)
        const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

        console.log(`Received webhook event: ${event.type}`);

        // Verify custom authentication secret from metadata (additional security layer)
        // This ensures only webhooks from our checkout sessions are processed
        // Only check if secret is configured (optional security enhancement)
        if (webhookAuthSecret && webhookAuthSecret.trim() !== '' && event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const metadataAuthSecret = session.metadata?.webhookAuthSecret;
            
            if (!metadataAuthSecret || metadataAuthSecret !== webhookAuthSecret) {
                console.error('Webhook authentication failed: Invalid or missing auth secret in metadata');
                console.error('Expected secret configured:', !!webhookAuthSecret);
                console.error('Received secret in metadata:', metadataAuthSecret || 'missing');
                return new Response(
                    JSON.stringify({ error: 'Unauthorized: Invalid authentication secret' }),
                    { 
                        status: 401, 
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
                    }
                );
            }
            console.log('Webhook auth secret verified successfully');
        } else if (webhookAuthSecret && webhookAuthSecret.trim() !== '') {
            console.log('Webhook auth secret is configured but event type is not checkout.session.completed, skipping secret check');
        }

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutCompleted(session);
                break;
            }

            case 'payment_intent.succeeded': {
                // Skip payment_intent.succeeded - we only process checkout.session.completed
                // This prevents duplicate credit additions when both events fire
                // checkout.session.completed is the authoritative event for completed purchases
                console.log('Skipping payment_intent.succeeded - processing via checkout.session.completed only');
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log('Payment failed:', paymentIntent.id);
                // Log failed payment for analytics
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return new Response(
            JSON.stringify({ received: true }),
            { 
                status: 200, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
        );
    } catch (error: any) {
        console.error('Webhook error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
        );
    }
});

/**
 * Handle successful checkout session completion
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    try {
        const userId = session.metadata?.userId;
        const credits = parseInt(session.metadata?.credits || '0');
        const packName = session.metadata?.packName || 'Unknown Pack';

        if (!userId || !credits) {
            console.error('Missing userId or credits in session metadata');
            return;
        }

        // Check if payment was already processed by session ID (more reliable than payment_intent_id)
        // This prevents duplicate processing when both checkout.session.completed and payment_intent.succeeded fire
        const { data: existingPayment } = await supabase
            .from('payments')
            .select('id, credits_added')
            .or(`stripe_payment_intent_id.eq.${session.payment_intent},metadata->>stripeSessionId.eq.${session.id}`)
            .maybeSingle();

        if (existingPayment) {
            console.log('Payment already processed:', {
                paymentId: existingPayment.id,
                sessionId: session.id,
                paymentIntentId: session.payment_intent,
                creditsAlreadyAdded: existingPayment.credits_added
            });
            return;
        }

        // Additional check: Look for existing credit transaction with this session ID
        const { data: existingTransaction } = await supabase
            .from('credit_transactions')
            .select('id')
            .eq('user_id', userId)
            .eq('reference_id', session.id)
            .eq('transaction_type', 'purchase')
            .maybeSingle();

        if (existingTransaction) {
            console.log('Credit transaction already exists for session:', session.id);
            return;
        }

        // Add credits to user account
        const { data: creditResult, error: creditError } = await supabase.rpc('add_user_credits', {
            p_user_id: userId,
            p_amount: credits,
            p_description: `Purchased ${packName} - ${credits} credits`,
            p_reference_id: session.id,
            p_metadata: {
                packName,
                stripeSessionId: session.id,
                stripePaymentIntentId: session.payment_intent,
            },
        });

        if (creditError) {
            console.error('Error adding credits:', creditError);
            throw creditError;
        }

        // Get credit pack ID from metadata or by matching pack name
        let creditPackId: string | null = null;
        if (session.metadata?.packId) {
            creditPackId = session.metadata.packId;
        } else {
            // Try to find pack by name
            const { data: packData } = await supabase
                .from('credit_packs')
                .select('id')
                .eq('name', packName)
                .single();
            creditPackId = packData?.id || null;
        }

        // Record payment in database (with session ID in metadata for duplicate prevention)
        if (creditPackId) {
            const { error: paymentError } = await supabase.from('payments').insert({
                user_id: userId,
                credit_pack_id: creditPackId,
                stripe_payment_intent_id: session.payment_intent as string,
                amount_cents: session.amount_total || 0,
                currency: session.currency || 'usd',
                status: 'succeeded',
                credits_purchased: credits,
                credits_added: true,
                metadata: {
                    packName,
                    credits,
                    stripeSessionId: session.id, // Store session ID for duplicate detection
                    processedAt: new Date().toISOString(),
                },
            });

            if (paymentError) {
                // If payment record already exists, it's a duplicate - log and return
                if (paymentError.code === '23505') { // PostgreSQL unique constraint violation
                    console.log('Payment record already exists (duplicate webhook):', session.id);
                    return;
                }
                console.error('Error recording payment:', paymentError);
            }
        } else {
            console.error('Could not find credit pack ID for payment recording');
        }

        console.log(`✅ Successfully added ${credits} credits to user ${userId}`);
    } catch (error) {
        console.error('Error handling checkout completed:', error);
        throw error;
    }
}

/**
 * Handle successful payment intent (backup handler)
 * This is called when payment_intent.succeeded event fires
 * We need to retrieve the checkout session to get metadata
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    try {
        console.log('Payment intent succeeded:', paymentIntent.id);
        
        // Try to find the checkout session that created this payment intent
        // We'll search for sessions with this payment_intent
        const sessions = await stripe.checkout.sessions.list({
            payment_intent: paymentIntent.id,
            limit: 1,
        });
        
        if (sessions.data.length === 0) {
            console.log('No checkout session found for payment intent:', paymentIntent.id);
            return;
        }
        
        const session = sessions.data[0];
        console.log('Found checkout session:', session.id);
        
        // Process using the same logic as checkout.session.completed
        await handleCheckoutCompleted(session);
    } catch (error) {
        console.error('Error handling payment intent succeeded:', error);
        // Don't throw - we don't want to fail the webhook
    }
}

