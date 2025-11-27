# Edge Function Fix Summary

## Changes Made

1. **Improved Error Handling**
   - Added detailed error logging with stack traces
   - Added validation for environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
   - Added parameter validation before processing

2. **Better Database Error Reporting**
   - Added `.select().single()` to get the inserted record
   - Added detailed error logging (code, details, hint)
   - Wrapped database operations in try-catch

3. **Enhanced Request Validation**
   - Validate userId, videoId, and videoUrl before processing
   - Return proper 400 errors for missing parameters
   - Log request details for debugging

## Next Steps

1. **Deploy the Updated Function**
   ```bash
   supabase functions deploy repurpose-video
   ```

2. **Verify Database Table Exists**
   ```bash
   supabase db push
   ```
   Or manually run the migration:
   ```bash
   psql -h <your-db-host> -U postgres -d postgres -f database/migrations/create_repurpose_jobs_table.sql
   ```

3. **Check Function Logs**
   After deploying, test the function and check logs:
   ```bash
   # View logs in Supabase Dashboard
   # Or use: supabase functions logs repurpose-video
   ```

## Common Issues

1. **500 Error: Table doesn't exist**
   - Run the migration: `supabase db push`
   - Or manually create the table using the SQL migration file

2. **500 Error: Permission denied**
   - The Edge Function uses SERVICE_ROLE_KEY which bypasses RLS
   - Make sure SUPABASE_SERVICE_ROLE_KEY is set in Edge Function secrets

3. **500 Error: Invalid JSON**
   - Check that the request body includes: action, userId, videoId, videoUrl, options
   - Verify the client is sending the correct format

## Testing

After deployment, test with:
```javascript
const { data, error } = await supabase.functions.invoke('repurpose-video', {
  body: {
    action: 'create_job',
    userId: 'test-user-id',
    videoId: 'test-video-id',
    videoUrl: 'https://example.com/video.mp4',
    options: {}
  }
});
```



