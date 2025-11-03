# Email Confirmation Setup Guide

## Current Issue

Supabase requires email confirmation by default. Users must verify their email before they can sign in.

## Solution Options

### Option 1: Disable Email Confirmation (Recommended for Development)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (`yxsscklulcedocisdrje`)
3. Go to **Authentication** → **Providers** → **Email**
4. Find the **"Confirm email"** toggle
5. **Turn OFF** email confirmation
6. Click **Save**

After this, users can sign in immediately after signup without email confirmation.

### Option 2: Keep Email Confirmation Enabled

If you want to keep email confirmation enabled (recommended for production):

1. Make sure email is configured in Supabase:
   - Go to **Settings** → **Auth** → **SMTP Settings**
   - Configure SMTP or use Supabase's default email service

2. Users will receive a confirmation email after signup
3. They must click the link in the email before signing in

### Option 3: Auto-confirm Emails for Testing

For development/testing, you can auto-confirm users:

1. Go to **Authentication** → **Policies** in Supabase Dashboard
2. Or use the Supabase SQL Editor to run:
   ```sql
   -- This will auto-confirm all new users
   -- Only use in development!
   ```

Actually, the easiest way is **Option 1** - just disable email confirmation in the dashboard.

## How to Disable Email Confirmation

**Steps:**
1. Visit: https://supabase.com/dashboard/project/yxsscklulcedocisdrje/auth/providers
2. Click on **Email** provider
3. Scroll down to **"Confirm email"** option
4. Toggle it **OFF**
5. Save changes

After disabling, restart your app and try signing up again - users can sign in immediately!

## Testing Email Confirmation

If you keep email confirmation enabled:

1. Sign up with a valid email
2. Check your email inbox (and spam folder)
3. Click the confirmation link
4. Then try signing in

The app will show helpful messages about email confirmation requirements.

