import { createClient } from '@supabase/supabase-js';

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

console.log('🔧 Initializing Supabase...');
console.log('📍 URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET');
console.log('🔑 Anon Key:', supabaseAnonKey ? 'Set ✅' : 'NOT SET ❌');

// Create Supabase client - will use placeholder if credentials not set
let supabase: ReturnType<typeof createClient>;

if (supabaseUrl && supabaseAnonKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
        });
        console.log('✅ Supabase client initialized');
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

export { supabase };
export default supabase;