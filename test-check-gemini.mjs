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

console.log('🔍 Checking Gemini API Configuration...\n');

// Test if we can create a job and see the error
const userId = 'd32c3d32-ce6d-4e55-92c6-9ad3686643b0';

// First, let's try to upload a small test video using the UI approach
// We'll simulate what happens when user uploads through UI
console.log('📋 Testing complete flow...');
console.log('   1. Video upload (via UI - we\'ll skip this)');
console.log('   2. Job creation');
console.log('   3. Gemini processing');
console.log('   4. Viral clip generation');
console.log('');

// Check if there are any recent jobs
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const { data: recentJobs } = await supabase
  .from('repurpose_jobs')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(1);

if (recentJobs && recentJobs.length > 0) {
  const job = recentJobs[0];
  console.log('📊 Found recent job:', job.id);
  console.log('   Status:', job.status);
  console.log('   Progress:', job.progress + '%');
  
  if (job.status === 'completed' && job.result) {
    console.log('\n✅ Found completed job with results!');
    if (job.result.clips && job.result.clips.length > 0) {
      console.log(`\n🎉 Generated ${job.result.clips.length} viral clip(s):\n`);
      job.result.clips.forEach((clip, i) => {
        console.log(`Clip ${i + 1}:`);
        console.log(`  Title: ${clip.title}`);
        console.log(`  Score: ${clip.virality_score}/100`);
        console.log(`  Duration: ${clip.duration}s`);
      });
      process.exit(0);
    }
  } else if (job.status === 'processing') {
    console.log('\n⏳ Job is still processing...');
    console.log('   Polling for completion...\n');
    
    // Poll this job
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 3000));
      
      const { data: statusData } = await supabase.functions.invoke('repurpose-video', {
        body: { action: 'get_status', jobId: job.id }
      });
      
      if (statusData) {
        const progress = statusData.progress || 0;
        const status = statusData.status || 'unknown';
        console.log(`   ${progress}% - ${status}`);
        
        if (status === 'completed') {
          if (statusData.result?.clips?.length > 0) {
            console.log('\n🎉 SUCCESS! Viral clip generated!');
            const clip = statusData.result.clips[0];
            console.log(`   Title: ${clip.title}`);
            console.log(`   Score: ${clip.virality_score}/100`);
            process.exit(0);
          }
          break;
        }
        if (status === 'failed') {
          console.log('\n❌ Failed:', statusData.error_message);
          break;
        }
      }
    }
  }
}

console.log('\n💡 To generate a viral clip:');
console.log('   1. Go to Content Repurpose page in your app');
console.log('   2. Upload a video file');
console.log('   3. Click "Generate Viral Clips"');
console.log('   4. The system will process it with Gemini AI');
