# User Table Explanation

## Current Situation

### ✅ What Exists
1. **`auth.users`** - Automatically created by Supabase
   - This is Supabase's built-in authentication table
   - Located in the `auth` schema (not `public`)
   - Contains: `id`, `email`, `encrypted_password`, `email_confirmed_at`, `created_at`, `updated_at`, `raw_user_meta_data`, etc.
   - **You cannot directly query this table from the client** - it's managed by Supabase Auth

### ❌ What Was Missing
2. **`public.profiles`** - User profile table (NOW CREATED)
   - Stores additional user information beyond what Supabase auth provides
   - Located in the `public` schema (queryable from client)
   - Contains: `display_name`, `avatar_url`, `bio`, `company`, `website`, `preferences`, etc.
   - **This is what you should use for storing custom user data**

## Why We Need Both

### `auth.users` (Supabase Auth)
- Handles authentication (login, signup, password reset)
- Managed by Supabase - you don't create/update this directly
- Contains sensitive authentication data
- Not directly queryable from client (use Supabase Auth methods)

### `public.profiles` (Our Custom Table)
- Stores user profile information
- Queryable from client with RLS policies
- Can be joined with other tables
- Extensible with custom fields
- Best practice for Supabase applications

## Database Structure

```
auth.users (Supabase managed)
    ├── id (UUID) ← Primary key
    ├── email
    ├── encrypted_password
    ├── created_at
    └── ...

public.profiles (Our table)
    ├── id (UUID) ← References auth.users(id)
    ├── email (synced from auth.users)
    ├── display_name
    ├── avatar_url
    ├── bio
    ├── company
    ├── preferences (JSONB)
    └── ...

public.user_credits (Payment system)
    ├── user_id (UUID) ← References auth.users(id)
    ├── balance
    └── ...

public.payments (Payment system)
    ├── user_id (UUID) ← References auth.users(id)
    └── ...
```

## Migration Files

### 1. `create_profiles_table.sql` ✅ NEW
- Creates `public.profiles` table
- Sets up RLS policies
- Creates trigger to auto-create profile on user signup
- Includes helper functions

### 2. `create_payment_tables.sql` ✅ EXISTS
- Creates payment-related tables
- All reference `auth.users(id)`
- Includes trigger to give free credits on signup

## How It Works Together

1. **User Signs Up**
   - Supabase creates record in `auth.users`
   - Trigger `on_auth_user_created_profile` creates record in `public.profiles`
   - Trigger `on_auth_user_created` (from payment system) creates `user_credits` with 10 free credits

2. **Querying User Data**
   ```typescript
   // Get auth user (from Supabase Auth)
   const { data: { user } } = await supabase.auth.getUser();
   
   // Get profile (from public.profiles)
   const { data: profile } = await supabase
     .from('profiles')
     .select('*')
     .eq('id', user.id)
     .single();
   
   // Get credits (from public.user_credits)
   const { data: credits } = await supabase
     .from('user_credits')
     .select('*')
     .eq('user_id', user.id)
     .single();
   ```

3. **Updating Profile**
   ```typescript
   // Update profile (not auth.users directly)
   const { error } = await supabase
     .from('profiles')
     .update({ display_name: 'John Doe', bio: 'Creator' })
     .eq('id', user.id);
   ```

## Next Steps

1. **Run the migration**: Execute `database/migrations/create_profiles_table.sql` in Supabase SQL editor

2. **Update ProfilePage.tsx** to use the profiles table:
   - Fetch profile data
   - Allow editing display_name, bio, avatar_url, etc.
   - Show profile information

3. **Update other components** that need user data:
   - Use `profiles` table for display names, avatars
   - Use `auth.users` only for authentication

## Verification

After running the migration, verify:

```sql
-- Check if profiles table exists
SELECT * FROM public.profiles;

-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created_profile';

-- Test: Create a new user and check if profile is auto-created
-- (Create user via Supabase Auth dashboard or signup flow)
-- Then:
SELECT * FROM public.profiles WHERE id = '<new_user_id>';
```

## Important Notes

- ✅ Both triggers (`on_auth_user_created_profile` and `on_auth_user_created`) can coexist
- ✅ They both run on the same event (user creation) and don't conflict
- ✅ Always reference `auth.users(id)` in foreign keys, not `profiles(id)`
- ✅ Use `profiles` table for all custom user data
- ✅ Use Supabase Auth methods for authentication operations

