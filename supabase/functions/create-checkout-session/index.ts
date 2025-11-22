/**
 * Supabase Edge Function: Create Stripe Checkout Session
 * 
 * This function creates a Stripe Checkout session for credit pack purchases.
 * It should be deployed as a Supabase Edge Function.
 * 
 * Environment variables needed in Supabase:
 * - STRIPE_SECRET_KEY: Your Stripe secret key
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key (for admin operations)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize Supabase client with service role key for admin operations
// Supabase automatically provides these environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// JWT and refresh secrets from .env.local (for token verification if needed)
const jwtSecret = Deno.env.get('JWT_SECRET') || Deno.env.get('SUPABASE_JWT_SECRET') || '';
const refreshSecret = Deno.env.get('REFRESH_SECRET') || Deno.env.get('SUPABASE_REFRESH_SECRET') || '';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2024-11-20.acacia',
    httpClient: Stripe.createFetchHttpClient(),
    // Ensure we're using the latest API features
    maxNetworkRetries: 2,
});

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Validate environment variables
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (!stripeSecretKey) {
            console.error('ERROR: STRIPE_SECRET_KEY is not set');
            return new Response(
                JSON.stringify({ error: 'Server configuration error: Stripe secret key not found' }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('ERROR: Supabase credentials not available');
            return new Response(
                JSON.stringify({ error: 'Server configuration error: Supabase credentials not found' }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Get authenticated user from Supabase (when verify_jwt is enabled, user is available in headers)
        // Supabase automatically verifies JWT and adds user info to the request
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized: Authentication required. Please sign in to purchase credits.' }),
                {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Extract token from "Bearer <token>"
        const token = authHeader.replace('Bearer ', '');
        
        // Verify the token and get user using service role client
        // We use the service role key to verify any user's token
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            console.error('Authentication error:', authError);
            return new Response(
                JSON.stringify({ error: 'Unauthorized: Invalid or expired token. Please sign in again.' }),
                {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        console.log('Authenticated user:', user.id, user.email);

        // Parse request body
        let requestBody;
        try {
            requestBody = await req.json();
            console.log('Request body received:', JSON.stringify(requestBody));
        } catch (parseError) {
            console.error('Error parsing request body:', parseError);
            return new Response(
                JSON.stringify({ error: 'Invalid request body' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        const { priceId } = requestBody;

        if (!priceId) {
            console.error('Missing priceId in request body. Received:', requestBody);
            return new Response(
                JSON.stringify({ 
                    error: 'Missing required field: priceId',
                    received: requestBody 
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        console.log('Processing checkout for priceId:', priceId, 'userId:', user.id);

        // Get the credit pack from database to get credits amount
        console.log('Fetching credit pack for priceId:', priceId);
        const { data: pack, error: packError } = await supabase
            .from('credit_packs')
            .select('credits, name')
            .eq('stripe_price_id', priceId)
            .single();

        if (packError) {
            console.error('Database error fetching credit pack:', packError);
            return new Response(
                JSON.stringify({ 
                    error: 'Database error: ' + packError.message,
                    details: packError 
                }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        if (!pack) {
            console.error('Credit pack not found for priceId:', priceId);
            return new Response(
                JSON.stringify({ error: `Credit pack not found for price ID: ${priceId}` }),
                {
                    status: 404,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        console.log('Credit pack found:', pack);

        // Create Stripe Checkout Session
        console.log('Creating Stripe checkout session...');
        let session;
        try {
            // For Deno/ESM Stripe, we need to pass options differently
            // The expand parameter should be in the main object, not as a second parameter
            session = await stripe.checkout.sessions.create({
                mode: 'payment',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                customer_email: user.email || '',
                metadata: {
                    userId: user.id,
                    credits: pack.credits.toString(),
                    packName: pack.name,
                    packId: pack.id,
                    // Include webhook auth secret for additional security
                    webhookAuthSecret: Deno.env.get('WEBHOOK_AUTH_SECRET') || '',
                },
                success_url: `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/pricing?payment=cancelled`,
                expand: ['payment_intent'], // Include expand in the main options
            });
        } catch (stripeError: any) {
            console.error('Stripe API error:', stripeError);
            console.error('Stripe error type:', stripeError.type);
            console.error('Stripe error message:', stripeError.message);
            console.error('Stripe error code:', stripeError.code);
            
            return new Response(
                JSON.stringify({ 
                    error: 'Stripe API error: ' + (stripeError.message || 'Unknown error'),
                    type: stripeError.type,
                    code: stripeError.code
                }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Log for debugging
        console.log('Stripe session created:', {
            id: session.id,
            url: session.url,
            hasUrl: !!session.url,
            status: session.status,
            payment_status: session.payment_status,
            allKeys: Object.keys(session)
        });

        // For payment mode sessions, the URL should always be available
        // If it's not, there might be an issue with the session creation
        let checkoutUrl = session.url;
        
        if (!checkoutUrl) {
            console.warn('URL not in initial response, attempting to retrieve...');
            try {
                // Retrieve the session to get the URL
                const retrievedSession = await stripe.checkout.sessions.retrieve(session.id);
                checkoutUrl = retrievedSession.url;
                console.log('Retrieved session URL:', checkoutUrl);
            } catch (retrieveError) {
                console.error('Error retrieving session:', retrieveError);
            }
        }

        // If still no URL, log detailed error
        if (!checkoutUrl) {
            console.error('ERROR: Stripe checkout session created but no URL available.');
            console.error('Session ID:', session.id);
            console.error('Session status:', session.status);
            console.error('Session mode:', session.mode);
            console.error('Session object (first 1000 chars):', JSON.stringify(session).substring(0, 1000));
        }

        // Return both sessionId and URL
        // The URL from Stripe should include all necessary parameters
        const response = {
            sessionId: session.id,
            url: checkoutUrl || null
        };

        return new Response(
            JSON.stringify(response),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error: any) {
        console.error('Unexpected error creating checkout session:', error);
        console.error('Error stack:', error.stack);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        return new Response(
            JSON.stringify({ 
                error: error.message || 'Internal server error',
                type: error.name || 'UnknownError',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});

