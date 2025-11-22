/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly GEMINI_API_KEY: string;
  readonly GOOGLE_CLOUD_API_KEY?: string;
  readonly GOOGLE_CLOUD_PROJECT_ID?: string;
  readonly GOOGLE_SPEECH_TO_TEXT_API_KEY?: string;
  readonly YOUTUBE_API_KEY?: string;
  readonly RUNWAY_API_KEY?: string;
  readonly ASSEMBLYAI_API_KEY?: string;
  readonly NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
