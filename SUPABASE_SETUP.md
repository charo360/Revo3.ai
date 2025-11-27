# Supabase Setup Guide

## Installing Supabase CLI

### Option 1: Install via npm (Recommended)
```bash
npm install -g supabase
```

### Option 2: Install via Homebrew (macOS/Linux)
```bash
brew install supabase/tap/supabase
```

### Option 3: Install via Scoop (Windows)
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Verify Installation
```bash
supabase --version
```

## Logging In to Supabase

### Method 1: CLI Login (For Deploying Functions)

1. **Login via CLI:**
   ```bash
   supabase login
   ```
   This will open your browser to authenticate. You can use:
   - GitHub account
   - Email and password
   - SSO (if your organization uses it)

2. **Link your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```
   You can find your project ref in:
   - Supabase Dashboard → Settings → General → Reference ID
   - Or in your project URL: `https://app.supabase.com/project/[PROJECT_REF]`

### Method 2: Dashboard Login (For Database/Storage Management)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Or: https://app.supabase.com

2. **Sign in with:**
   - GitHub account
   - Email and password
   - SSO (if configured)

## Setting Up Your Project

### 1. Get Your Project Credentials

From Supabase Dashboard → Settings → API:

- **Project URL**: `https://your-project-id.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Keep secret!)

### 2. Run Database Migration

**Option A: Via Supabase Dashboard**
1. Go to SQL Editor
2. Click "New Query"
3. Copy and paste the SQL from `database/migrations/create_repurpose_jobs_table.sql`
4. Click "Run"

**Option B: Via CLI**
```bash
# After linking your project
supabase db push
```

### 3. Deploy Edge Function

```bash
# Make sure you're logged in and linked
supabase functions deploy repurpose-video
```

### 4. Set Environment Variables

In Supabase Dashboard → Edge Functions → repurpose-video → Settings:

Add these environment variables:
- `SUPABASE_URL` = Your project URL
- `SUPABASE_SERVICE_ROLE_KEY` = Your service role key
- `GEMINI_API_KEY` = Your Google Gemini API key

## Troubleshooting

### CLI Not Found
If `supabase: command not found`:
1. Make sure npm global bin is in your PATH
2. Try: `npm config get prefix` to find global install location
3. Add to PATH: `export PATH="$PATH:$(npm config get prefix)/bin"`

### Login Issues
- Make sure you have a Supabase account
- Try logging in via dashboard first: https://supabase.com/dashboard
- Clear browser cache if authentication popup doesn't work

### Project Linking Issues
- Double-check your project ref (it's in the URL)
- Make sure you have access to the project
- Try: `supabase projects list` to see your projects

## Quick Start Commands

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# List your projects
supabase projects list

# Link to a project
supabase link --project-ref abc123xyz

# Deploy function
supabase functions deploy repurpose-video

# Check function logs
supabase functions logs repurpose-video
```

## Alternative: Manual Setup (Without CLI)

If you prefer not to use the CLI:

1. **Database Migration:**
   - Go to Supabase Dashboard → SQL Editor
   - Run the SQL from `database/migrations/create_repurpose_jobs_table.sql`

2. **Edge Function:**
   - Go to Supabase Dashboard → Edge Functions
   - Click "Create Function"
   - Copy code from `supabase/functions/repurpose-video/index.ts`
   - Set environment variables in function settings

3. **Storage Bucket:**
   - Go to Supabase Dashboard → Storage
   - Create bucket named `repurpose-videos`
   - Set policies (the migration SQL includes these)

