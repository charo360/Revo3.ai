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

console.log('🧪 Full Repurpose Test\n');

// Step 1: Try to authenticate or use service role
const { data: { user } } = await supabase.auth.getUser();
let userId = 'test-user-' + Date.now();

if (user) {
  userId = user.id;
  console.log('✅ Authenticated as:', userId.substring(0, 20) + '...');
} else {
  console.log('⚠️  Not authenticated, using test user ID');
}

// Step 2: Test creating a job with a real video URL (YouTube)
console.log('\n📹 Testing with YouTube URL...');
const youtubeUrl = 'https://www.youtube.com/watch?v=C53N3SdD4Cs';

try {
  console.log('   Creating job for:', youtubeUrl);
  
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
        virality_threshold: 70,
        platforms: ['youtube_shorts'],
        include_captions: true,
        include_transitions: true,
        overlap_prevention: true
      }
    }
  });
  
  if (error) {
    console.error('   ❌ Error:', error.message);
    if (error.context) {
      console.error('   Context:', JSON.stringify(error.context, null, 2));
    }
  } else {
    console.log('   ✅ Job created!');
    console.log('   Job ID:', data.jobId);
    console.log('   Status:', data.status);
    
    // Poll for status
    console.log('\n⏳ Polling job status...');
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
      
      const { data: statusData, error: statusError } = await supabase.functions.invoke('repurpose-video', {
        body: {
          action: 'get_status',
          jobId: data.jobId
        }
      });
      
      if (statusError) {
        console.log(`   Attempt ${attempts}: Error - ${statusError.message}`);
        continue;
      }
      
      const job = statusData;
      const progress = job.progress || 0;
      const status = job.status || 'unknown';
      
      console.log(`   Attempt ${attempts}: ${progress}% - ${status}`);
      
      if (status === 'completed') {
        console.log('\n✅ Job completed!');
        if (job.result && job.result.clips) {
          console.log(`   Generated ${job.result.clips.length} clip(s)`);
          job.result.clips.forEach((clip, i) => {
            console.log(`\n   Clip ${i + 1}:`);
            console.log(`     Title: ${clip.title || 'N/A'}`);
            console.log(`     Score: ${clip.virality_score}/100`);
            console.log(`     Duration: ${clip.duration}s`);
            console.log(`     Time: ${clip.start_time}s - ${clip.end_time}s`);
          });
        }
        break;
      }
      
      if (status === 'failed') {
        console.error('\n❌ Job failed:', job.error_message);
        break;
      }
    }
  }
} catch (e) {
  console.error('❌ Exception:', e.message);
  console.error('Stack:', e.stack);
}

console.log('\n✅ Test complete');
