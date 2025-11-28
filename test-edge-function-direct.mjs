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
  } catch (error) {
    console.error('Failed to load .env.local');
  }
  return { ...process.env, ...env };
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🧪 Testing Edge Function directly...\n');

// Test with OPTIONS (CORS preflight)
console.log('1. Testing OPTIONS request...');
try {
  const { data, error } = await supabase.functions.invoke('repurpose-video', {
    method: 'OPTIONS'
  });
  console.log('   Response:', data ? 'OK' : 'No data');
  if (error) console.log('   Error:', error.message);
} catch (e) {
  console.log('   Error:', e.message);
}

// Test with invalid action
console.log('\n2. Testing invalid action...');
try {
  const { data, error } = await supabase.functions.invoke('repurpose-video', {
    body: { action: 'invalid_action' }
  });
  console.log('   Data:', data);
  if (error) {
    console.log('   Error:', error.message);
    console.log('   Error details:', JSON.stringify(error, null, 2));
  }
} catch (e) {
  console.log('   Exception:', e.message);
}

// Test with get_status (should fail gracefully)
console.log('\n3. Testing get_status with fake job...');
try {
  const { data, error } = await supabase.functions.invoke('repurpose-video', {
    body: { 
      action: 'get_status',
      jobId: 'fake-job-id-123'
    }
  });
  console.log('   Data:', data);
  if (error) {
    console.log('   Error:', error.message);
    console.log('   This is expected if job doesn\'t exist');
  }
} catch (e) {
  console.log('   Exception:', e.message);
  console.log('   Stack:', e.stack);
}

console.log('\n✅ Test complete');
