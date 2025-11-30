/**
 * Simple test to create a repurpose job and see the actual error
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
let envVars = {};
try {
  const envFile = readFileSync(join(__dirname, '.env.local'), 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
} catch (e) {
  // .env.local doesn't exist, that's okay
}

const supabaseUrl = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://yxsscklulcedocisdrje.supabase.co';
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY || envVars.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Missing Supabase ANON key.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const TEST_USER_ID = process.env.TEST_USER_ID || 'd32c3d32-ce6d-4e55-92c6-9ad3686643b0';

async function testCreateJob() {
  console.log('🧪 Testing repurpose job creation...\n');
  console.log('User ID:', TEST_USER_ID);
  console.log('Supabase URL:', supabaseUrl);
  console.log('');

  // Use a test video URL (or use an existing one from storage)
  const testVideoId = `${TEST_USER_ID}/test_video.mp4`;
  const testVideoUrl = `https://yxsscklulcedocisdrje.supabase.co/storage/v1/object/public/repurpose-videos/${testVideoId}`;

  const options = {
    target_clip_count: 1,
    min_duration: 15,
    max_duration: 60,
    virality_threshold: 70,
    platforms: ['tiktok'],
    include_captions: true,
    include_transitions: true,
    overlap_prevention: true
  };

  console.log('📤 Creating job with:');
  console.log('  Video ID:', testVideoId);
  console.log('  Video URL:', testVideoUrl);
  console.log('  Options:', JSON.stringify(options, null, 2));
  console.log('');

  try {
    // Try direct fetch to see actual error
    const functionUrl = `${supabaseUrl}/functions/v1/repurpose-video`;
    console.log('🔗 Calling:', functionUrl);
    console.log('');
    
    const fetchResponse = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        action: 'create_job',
        userId: TEST_USER_ID,
        videoId: testVideoId,
        videoUrl: testVideoUrl,
        options: options
      })
    });
    
    console.log('📥 HTTP Response:');
    console.log('  Status:', fetchResponse.status);
    console.log('  Status Text:', fetchResponse.statusText);
    console.log('  Headers:', Object.fromEntries(fetchResponse.headers.entries()));
    console.log('');
    
    const responseText = await fetchResponse.text();
    console.log('📄 Response Body:');
    console.log(responseText);
    console.log('');
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('📦 Parsed JSON:');
      console.log(JSON.stringify(responseData, null, 2));
    } catch (e) {
      console.log('⚠️  Response is not valid JSON');
    }
    
    if (!fetchResponse.ok) {
      console.error('❌ HTTP Error:', fetchResponse.status, fetchResponse.statusText);
      process.exit(1);
    }
    
    const result = { data: responseData };

    console.log('📥 Response received:');
    console.log('  Status:', result.status);
    console.log('  Has data:', !!result.data);
    console.log('  Has error:', !!result.error);
    console.log('');

    if (result.error) {
      console.error('❌ Error from Edge Function:');
      console.error(JSON.stringify(result.error, null, 2));
      console.log('');
      
      // Try to get the error message
      if (result.error.message) {
        console.error('Error message:', result.error.message);
      }
      if (result.error.context) {
        console.error('Error context:', JSON.stringify(result.error.context, null, 2));
      }
    } else if (result.data) {
      console.log('✅ Success! Job data:');
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.log('⚠️  No data or error in response:');
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (err) {
    console.error('❌ Exception calling Edge Function:');
    console.error('  Type:', err.constructor?.name);
    console.error('  Message:', err.message);
    console.error('  Stack:', err.stack);
    console.error('  Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  }
}

testCreateJob();

