-- User Profiles Table
-- Run this migration in your Supabase SQL editor
-- This creates a public profiles table linked to auth.users for storing additional user information

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- This table stores additional user information beyond what Supabase auth provides
-- It's linked to auth.users via a foreign key relationship

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    company TEXT,
    website TEXT,
    location TEXT,
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}'::jsonb, -- Store user preferences (theme, notifications, etc.)
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can view other users' profiles (for public info like display_name, avatar)
-- Adjust this based on your privacy requirements
CREATE POLICY "Users can view public profiles"
    ON public.profiles FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile (via trigger)
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- FUNCTION: Automatically create profile when user signs up
-- ============================================================================
-- Note: This works alongside the payment system's trigger that gives free credits
-- Both triggers can run on the same event (user creation)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile for new user
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Create profile automatically on user signup
-- ============================================================================
-- This trigger runs alongside the payment system's trigger (on_auth_user_created)
-- Both can coexist and will both execute when a new user is created

-- Drop trigger if it exists (in case you're re-running this migration)
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FUNCTION: Update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_profiles_updated_at();

-- ============================================================================
-- HELPER FUNCTION: Get user profile
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    company TEXT,
    website TEXT,
    location TEXT,
    timezone TEXT,
    preferences JSONB,
    onboarding_completed BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.display_name,
        p.avatar_url,
        p.bio,
        p.company,
        p.website,
        p.location,
        p.timezone,
        p.preferences,
        p.onboarding_completed,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    WHERE p.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- To verify:
-- SELECT * FROM public.profiles;
-- 
-- To test the trigger:
-- 1. Create a new user via Supabase Auth
-- 2. Check if a profile was automatically created:
--    SELECT * FROM public.profiles WHERE id = '<user_id>';

