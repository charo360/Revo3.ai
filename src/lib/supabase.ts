import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';

// Get environment variables - Vite only exposes variables with VITE_ prefix
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate that we have valid credentials
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables not set!');
    console.warn('📝 Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file');
    console.warn('🔗 Get your credentials from: https://supabase.com/dashboard/project/_/settings/api');
}

// Validate URL format
if (supabaseUrl && !supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    console.error('❌ Invalid Supabase URL format:', supabaseUrl);
}

// Scalability-optimized Supabase client configuration
const supabaseOptions: SupabaseClientOptions<'public'> = {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Optimize session storage
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'supabase.auth.token',
        // Reduce token refresh frequency to minimize API calls
        flowType: 'pkce',
    },
    // Global configuration for better scalability
    global: {
        headers: {
            'x-client-info': 'revo3-ai@1.0.0',
        },
        // Set reasonable timeout to prevent hanging requests
        fetch: (url, options = {}) => {
            // For storage uploads, use longer timeout (10 minutes for large files)
            const isStorageUpload = url.toString().includes('/storage/v1/object/') && 
                                   (options.method === 'POST' || options.method === 'PUT');
            
            // If there's already a signal, use it (don't override)
            if (options.signal) {
                return fetch(url, options);
            }
            
            const controller = new AbortController();
            const timeout = isStorageUpload ? 600000 : 60000; // 10 min for uploads, 60s for others
            const timeoutId = setTimeout(() => {
                if (!controller.signal.aborted) {
                    console.warn(`Request timeout after ${timeout}ms:`, url.toString().substring(0, 100));
                    controller.abort();
                }
            }, timeout);
            
            return fetch(url, {
                ...options,
                signal: controller.signal,
            }).catch((error) => {
                // Don't log AbortError as it's expected for timeouts
                if (error.name !== 'AbortError') {
                    console.error('Supabase fetch error:', error);
                } else {
                    console.warn('Request aborted (timeout or cancellation):', url.toString().substring(0, 100));
                }
                throw error;
            }).finally(() => clearTimeout(timeoutId));
        },
    },
    // Database configuration
    db: {
        schema: 'public',
    },
    // Realtime configuration (disabled if not needed to reduce overhead)
    realtime: {
        params: {
            eventsPerSecond: 10, // Limit realtime events
        },
    },
};

// Create Supabase client - will use placeholder if credentials not set
let supabase: ReturnType<typeof createClient>;

if (supabaseUrl && supabaseAnonKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);
        console.log('✅ Supabase client initialized with scalability optimizations');
    } catch (error) {
        console.error('❌ Failed to initialize Supabase client:', error);
        // Fallback to placeholder
        supabase = createClient(
            'https://placeholder.supabase.co', 
            'placeholder-key',
            { auth: { persistSession: false } }
        );
    }
} else {
    console.warn('⚠️ Supabase client not initialized - authentication will not work');
    console.warn('💡 To fix: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local');
    
    // Create a mock client that will throw helpful errors
    supabase = createClient(
        'https://placeholder.supabase.co', 
        'placeholder-key',
        { auth: { persistSession: false } }
    );
}

// Singleton pattern to ensure single client instance
export { supabase };
export default supabase;