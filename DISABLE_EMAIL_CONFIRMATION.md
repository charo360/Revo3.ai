# How to Disable Email Confirmation in Supabase

## Quick Steps (Do This First!)

1. **Open your Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/yxsscklulcedocisdrje/auth/providers
   ```

2. **Click on "Email" provider** (or go to Authentication → Providers → Email)

3. **Find "Confirm email" toggle** - it should be ON (enabled)

4. **Toggle it OFF** (disabled)

5. **Click "Save"** or the save button

6. **Done!** Now users can sign up and sign in immediately without email confirmation.

---

## Visual Guide

The path in Supabase Dashboard:
```
Dashboard → Your Project → Authentication → Providers → Email → Confirm email (Toggle OFF)
```

---

## After Disabling

1. **Restart your dev server** (optional, but recommended):
   - Stop: `Ctrl+C`
   - Start: `npm run dev`

2. **Test signup:**
   - Sign up with a new account
   - You should be automatically signed in
   - You'll be redirected to `/app` immediately

---

## Verification

After disabling email confirmation:
- ✅ Sign up should work immediately
- ✅ Users are auto-signed in after signup
- ✅ No email verification required
- ✅ No "Email not confirmed" errors

---

## Need Help?

If you can't find the setting:
1. Make sure you're in the correct project
2. Check that you have admin access
3. The setting is under: **Authentication → Providers → Email → Confirm email**

