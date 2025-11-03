# Supabase Setup Instructions

## The Error You're Seeing

`ERR_NAME_NOT_RESOLVED` means the Supabase URL in your `.env.local` file doesn't exist or is incorrect.

## Quick Fix Steps

### 1. Create a Supabase Project (if you don't have one)

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: Your project name
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to you
5. Wait for project to be created (~2 minutes)

### 2. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. You'll see:
   - **Project URL**: Looks like `https://xxxxx.supabase.co`
   - **anon public** key: A long JWT token

### 3. Update `.env.local` File

Create or update `.env.local` in the project root:

```env
# Supabase Configuration (REQUIRED - Must start with VITE_)
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: 
- Variables MUST start with `VITE_` for Vite to expose them
- Replace `YOUR_PROJECT_ID` with your actual Supabase project ID
- Replace `your_anon_key_here` with your actual anon key

### 4. Restart Dev Server

After updating `.env.local`:

1. Stop the dev server (Ctrl+C)
2. Start it again: `npm run dev`

### 5. Verify Setup

Check the browser console - you should see:
- ✅ `Initializing Supabase with URL: https://...`
- ✅ `Supabase client initialized`

If you see warnings about missing variables, check:
- File is named exactly `.env.local` (not `.env.local.txt`)
- Variables start with `VITE_`
- No extra spaces around `=`

## Testing Your Supabase URL

To verify your URL works, run:

```bash
curl -I https://YOUR_PROJECT_ID.supabase.co
```

If you get a response, the URL is valid. If you get `Could not resolve host`, the project doesn't exist.

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com

