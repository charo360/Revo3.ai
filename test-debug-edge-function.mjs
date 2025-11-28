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

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 Debugging Edge Function Error\n');

// Test with a simple, valid request
const userId = 'test-user-' + Date.now();
const videoId = 'test/test-video.mp4';
const videoUrl = 'https://example.com/test.mp4'; // Non-YouTube URL

console.log('Testing with non-YouTube URL first...');
console.log('  userId:', userId);
console.log('  videoId:', videoId);
console.log('  videoUrl:', videoUrl);

try {
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
  
  console.log('\n📊 Response Status:', response.status);
  console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
  
  const text = await response.text();
  console.log('📊 Response Body:', text);
  
  try {
    const json = JSON.parse(text);
    console.log('📊 Parsed JSON:', JSON.stringify(json, null, 2));
  } catch (e) {
    console.log('📊 (Not JSON)');
  }
  
} catch (e) {
  console.error('❌ Fetch error:', e.message);
}
