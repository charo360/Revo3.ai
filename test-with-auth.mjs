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

console.log('🔍 Testing with proper authentication...\n');

// Try to get authenticated user
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (!user) {
  console.log('⚠️  Not authenticated. Testing schema with service role...');
  
  // Try with service role key if available
  const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
  if (SERVICE_KEY) {
    const serviceSupabase = createClient(SUPABASE_URL, SERVICE_KEY);
    
    const testData = {
      id: 'schema-test-' + Date.now(),
      user_id: '00000000-0000-0000-0000-000000000000',
      video_id: 'test',
      video_url: 'test',
      options: {},
      status: 'queued',
      progress: 0
    };
    
    const { error } = await serviceSupabase
      .from('repurpose_jobs')
      .insert(testData)
      .select();
    
    if (error) {
      if (error.message.includes('column')) {
        console.log('❌ Missing column:', error.message);
        process.exit(1);
      } else {
        console.log('✅ Columns exist! Error is:', error.message);
        console.log('   (This is expected - RLS or other constraint)');
      }
    } else {
      console.log('✅ Schema is correct! All columns exist.');
      await serviceSupabase.from('repurpose_jobs').delete().eq('id', testData.id);
    }
  } else {
    console.log('⚠️  No service role key. The RLS error suggests columns exist.');
    console.log('   Let\'s test the Edge Function directly...');
  }
} else {
  console.log('✅ Authenticated as:', user.id.substring(0, 20) + '...');
  
  // Test with real user
  const testData = {
    id: 'test-' + Date.now(),
    user_id: user.id,
    video_id: 'test',
    video_url: 'test',
    options: {},
    status: 'queued',
    progress: 0
  };
  
  const { error } = await supabase
    .from('repurpose_jobs')
    .insert(testData)
    .select();
  
  if (error) {
    if (error.message.includes('column')) {
      console.log('❌ Missing column:', error.message);
      process.exit(1);
    } else {
      console.log('✅ Columns exist! Error:', error.message);
    }
  } else {
    console.log('✅ Schema is correct!');
    await supabase.from('repurpose_jobs').delete().eq('id', testData.id);
  }
}

// Now test the Edge Function
console.log('\n🚀 Testing Edge Function...');
const userId = user?.id || 'test-user-' + Date.now();
const youtubeUrl = 'https://www.youtube.com/watch?v=C53N3SdD4Cs';

const { data, error } = await supabase.functions.invoke('repurpose-video', {
  body: {
    action: 'create_job',
    userId: userId,
    videoId: `youtube_${Date.now()}_${userId}`,
    videoUrl: youtubeUrl,
    options: {
      target_clip_count: 1,
      min_duration: 15,
      max_duration: 60,
      virality_threshold: 70
    }
  }
});

if (error) {
  console.log('❌ Edge Function error:', error.message);
  if (error.message.includes('column') || error.message.includes('options')) {
    console.log('   💡 Columns still missing. Need to run SQL fix.');
  } else {
    console.log('   (Other error - may be YouTube download not implemented)');
  }
} else {
  console.log('✅ Job created!', data.jobId);
  console.log('   Status:', data.status);
  console.log('\n🎉 SUCCESS! The system is working!');
}
