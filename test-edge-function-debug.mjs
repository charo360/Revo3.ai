import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  const envPath = join(__dirname, '.env.local');
  const env = {};
  try {
    const content = readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key && values.length > 0) {
          env[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });
  } catch (error) {}
  return { ...process.env, ...env };
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

console.log('🔍 Debugging Edge Function Error\n');

const userId = 'd32c3d32-ce6d-4e55-92c6-9ad3686643b0'; // From your logs
const videoId = 'test-video-' + Date.now();
const videoUrl = 'https://example.com/test.mp4'; // Non-YouTube to avoid download issue

console.log('Testing with:');
console.log('  userId:', userId);
console.log('  videoId:', videoId);
console.log('  videoUrl:', videoUrl);
console.log('');

const response = await fetch(`${SUPABASE_URL}/functions/v1/repurpose-video`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY
  },
  body: JSON.stringify({
    action: 'create_job',
    userId: userId,
    videoId: videoId,
    videoUrl: videoUrl,
    options: {
      target_clip_count: 1,
      min_duration: 15,
      max_duration: 60,
      virality_threshold: 70
    }
  })
});

console.log('Response Status:', response.status);
const text = await response.text();
console.log('Response Body:', text);

try {
  const json = JSON.parse(text);
  console.log('\nParsed Response:');
  console.log(JSON.stringify(json, null, 2));
  
  if (json.jobId) {
    console.log('\n✅ SUCCESS! Job created:', json.jobId);
    console.log('\nNow polling for status...\n');
    
    // Poll for status
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const statusResponse = await fetch(`${SUPABASE_URL}/functions/v1/repurpose-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          action: 'get_status',
          jobId: json.jobId
        })
      });
      
      const statusText = await statusResponse.text();
      const statusData = JSON.parse(statusText);
      
      console.log(`Poll ${i+1}: ${statusData.progress || 0}% - ${statusData.status}`);
      
      if (statusData.status === 'completed') {
        console.log('\n✅ Job completed!');
        if (statusData.result?.clips) {
          console.log(`Generated ${statusData.result.clips.length} clip(s)`);
        }
        break;
      }
      if (statusData.status === 'failed') {
        console.log('\n❌ Job failed:', statusData.error_message);
        break;
      }
    }
  }
} catch (e) {
  console.log('(Not JSON or error parsing)');
}
