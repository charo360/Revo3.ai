import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GOOGLE_CLOUD_API_KEY': JSON.stringify(env.GOOGLE_CLOUD_API_KEY),
        'process.env.GOOGLE_CLOUD_PROJECT_ID': JSON.stringify(env.GOOGLE_CLOUD_PROJECT_ID),
        'process.env.GOOGLE_SPEECH_TO_TEXT_API_KEY': JSON.stringify(env.GOOGLE_SPEECH_TO_TEXT_API_KEY),
        'process.env.YOUTUBE_API_KEY': JSON.stringify(env.YOUTUBE_API_KEY),
        'process.env.RUNWAY_API_KEY': JSON.stringify(env.RUNWAY_API_KEY),
        'process.env.ASSEMBLYAI_API_KEY': JSON.stringify(env.ASSEMBLYAI_API_KEY)
      },
      envPrefix: ['VITE_', 'SUPABASE_', 'NEXT_PUBLIC_', 'STRIPE_'],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Optimize build for production
        target: 'es2015',
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.log in production
            drop_debugger: true,
          },
        },
        rollupOptions: {
          output: {
            // Code splitting for better caching
            manualChunks: {
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              'supabase-vendor': ['@supabase/supabase-js'],
              'ai-vendor': ['@google/genai'],
            },
            // Optimize chunk size
            chunkSizeWarningLimit: 1000,
          },
        },
        // Enable source maps for production debugging (optional)
        sourcemap: false,
        // Optimize asset handling
        assetsInlineLimit: 4096, // Inline small assets (< 4KB)
        cssCodeSplit: true,
      },
      // Optimize dependencies
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
        exclude: ['@google/genai'], // Large library, load on demand
      },
    };
});
