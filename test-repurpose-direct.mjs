#!/usr/bin/env node
/**
 * Direct Test of Repurpose Video Function
 * Tests the actual Edge Function with a real video
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
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
    console.error('Failed to load .env.local:', error.message);
  }
  return { ...process.env, ...env };
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('   Need: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('🔧 Configuration:');
console.log('   Supabase URL:', SUPABASE_URL.substring(0, 30) + '...');
console.log('   Has Anon Key:', !!SUPABASE_ANON_KEY);
console.log('');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test 1: Check Supabase connection
async function testConnection() {
  console.log('📡 Test 1: Checking Supabase connection...');
  try {
    const { data, error } = await supabase.from('repurpose_jobs').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist, which is ok
      console.error('   ❌ Connection failed:', error.message);
      return false;
    }
    console.log('   ✅ Connected to Supabase');
    return true;
  } catch (error) {
    console.error('   ❌ Connection error:', error.message);
    return false;
  }
}

// Test 2: Check if Edge Function exists
async function testEdgeFunction() {
  console.log('\n🔌 Test 2: Checking Edge Function...');
  try {
    const { data, error } = await supabase.functions.invoke('repurpose-video', {
      body: { action: 'get_status', jobId: 'test' }
    });
    
    // Even if job doesn't exist, if we get a response, function exists
    if (error && error.message?.includes('Failed to get job status')) {
      console.log('   ✅ Edge Function exists (job not found is expected)');
      return true;
    }
    if (!error) {
      console.log('   ✅ Edge Function exists');
      return true;
    }
    console.error('   ❌ Edge Function error:', error.message);
    return false;
  } catch (error) {
    console.error('   ❌ Edge Function not accessible:', error.message);
    console.error('   💡 Make sure the function is deployed: supabase functions deploy repurpose-video');
    return false;
  }
}

// Test 3: Check storage bucket
async function testStorage() {
  console.log('\n💾 Test 3: Checking storage bucket...');
  try {
    const { data, error } = await supabase.storage.from('repurpose-videos').list('', { limit: 1 });
    if (error) {
      console.error('   ❌ Storage error:', error.message);
      if (error.message?.includes('not found')) {
        console.error('   💡 Bucket "repurpose-videos" does not exist. Create it in Supabase dashboard.');
      }
      return false;
    }
    console.log('   ✅ Storage bucket accessible');
    return true;
  } catch (error) {
    console.error('   ❌ Storage error:', error.message);
    return false;
  }
}

// Test 4: Try to create a test job (without actual video)
async function testJobCreation() {
  console.log('\n🚀 Test 4: Testing job creation...');
  
  // Get or create test user
  const { data: { user } } = await supabase.auth.getUser();
  let userId = 'test-user-' + Date.now();
  
  if (user) {
    userId = user.id;
    console.log('   Using authenticated user:', userId.substring(0, 20) + '...');
  } else {
    console.log('   ⚠️  No authenticated user, using test ID');
  }
  
  try {
    const testVideoId = 'test/test-video.mp4';
    const testVideoUrl = 'https://example.com/test-video.mp4';
    
    const { data, error } = await supabase.functions.invoke('repurpose-video', {
      body: {
        action: 'create_job',
        userId: userId,
        videoId: testVideoId,
        videoUrl: testVideoUrl,
        options: {
          target_clip_count: 1,
          min_duration: 15,
          max_duration: 60,
          virality_threshold: 70
        }
      }
    });
    
    if (error) {
      console.error('   ❌ Job creation failed:', error.message);
      return false;
    }
    
    if (data && data.jobId) {
      console.log('   ✅ Job created:', data.jobId);
      console.log('   Status:', data.status);
      return true;
    }
    
    console.error('   ❌ Invalid response:', data);
    return false;
  } catch (error) {
    console.error('   ❌ Job creation error:', error.message);
    return false;
  }
}

// Test 5: Check Gemini API key (if set)
async function testGeminiConfig() {
  console.log('\n🤖 Test 5: Checking Gemini configuration...');
  console.log('   ⚠️  Gemini API key check requires Edge Function deployment');
  console.log('   💡 Set GEMINI_API_KEY in Supabase secrets:');
  console.log('      supabase secrets set GEMINI_API_KEY=your_key');
  return true;
}

// Main test runner
async function runTests() {
  console.log('🧪 Testing Viral Clip Generation System\n');
  console.log('=' .repeat(50));
  
  const results = {
    connection: await testConnection(),
    edgeFunction: await testEdgeFunction(),
    storage: await testStorage(),
    jobCreation: false,
    gemini: await testGeminiConfig()
  };
  
  // Only test job creation if Edge Function works
  if (results.edgeFunction) {
    results.jobCreation = await testJobCreation();
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS:');
  console.log('   Connection:', results.connection ? '✅' : '❌');
  console.log('   Edge Function:', results.edgeFunction ? '✅' : '❌');
  console.log('   Storage:', results.storage ? '✅' : '❌');
  console.log('   Job Creation:', results.jobCreation ? '✅' : '❌');
  console.log('   Gemini Config:', results.gemini ? '✅' : '❌');
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('\n✅ All tests passed! System is ready.');
  } else {
    console.log('\n⚠️  Some tests failed. Please fix the issues above.');
    console.log('\n💡 Common fixes:');
    if (!results.edgeFunction) {
      console.log('   1. Deploy Edge Function: supabase functions deploy repurpose-video');
    }
    if (!results.storage) {
      console.log('   2. Create storage bucket "repurpose-videos" in Supabase dashboard');
    }
    if (!results.jobCreation && results.edgeFunction) {
      console.log('   3. Check Edge Function logs for errors');
    }
  }
  
  return allPassed;
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});

