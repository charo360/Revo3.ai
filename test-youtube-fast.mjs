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

console.log('🚀 FAST YOUTUBE CLIP GENERATION TEST');
console.log('='.repeat(60));
console.log('Testing with YouTube URL (Klap.app style - fast processing)');
console.log('');

const userId = 'd32c3d32-ce6d-4e55-92c6-9ad3686643b0';
const testYouTubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Short test video

console.log('📹 Using YouTube URL:', testYouTubeUrl);
console.log('');

// Create job with YouTube URL
console.log('🚀 Creating job with YouTube URL...');
const startTime = Date.now();

const { data: jobData, error: jobError } = await supabase.functions.invoke('repurpose-video', {
  body: {
    action: 'create_job',
    userId,
    videoId: null,
    videoUrl: testYouTubeUrl,
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

if (jobError || !jobData?.jobId) {
  console.error('❌ Failed:', jobError?.message || 'No jobId returned');
  console.error('   Details:', JSON.stringify(jobError || jobData, null, 2));
  process.exit(1);
}

const jobId = jobData.jobId;
console.log('✅ Job created:', jobId);
console.log('');

// Poll with speed tracking
console.log('⏳ Processing (optimized for speed with Gemini Flash)...');
console.log('');

let attempts = 0;
const maxAttempts = 120;
let lastProgress = -1;

while (attempts < maxAttempts) {
  await new Promise(r => setTimeout(r, 2000));
  attempts++;
  
  const { data: statusData, error } = await supabase.functions.invoke('repurpose-video', {
    body: { action: 'get_status', jobId }
  });
  
  if (error) {
    console.log(`   ⚠️  Status check error: ${error.message}`);
    continue;
  }
  
  const job = statusData;
  const progress = job.progress || 0;
  const status = job.status || 'unknown';
  
  if (progress !== lastProgress || status !== 'processing') {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    const stage = progress < 20 ? '📥 Downloading' :
                  progress < 30 ? '☁️  Uploading' :
                  progress < 50 ? '🤖 AI Analysis' :
                  progress < 70 ? '🔍 Finding moments' :
                  progress < 85 ? '✂️  Creating clip' :
                  '✨ Finalizing';
    console.log(`   ${progress}% - ${stage} (${elapsed}s) [${status}]`);
    lastProgress = progress;
  }
  
  if (status === 'completed') {
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n🎉 SUCCESS!');
    console.log(`⏱️  Total time: ${totalTime}s`);
    console.log('');
    
    if (job.result?.clips?.length > 0) {
      const clip = job.result.clips[0];
      console.log('📹 Generated Clip:');
      console.log(`   Title: "${clip.title || 'Untitled'}"`);
      console.log(`   Score: ${clip.virality_score || 'N/A'}/100`);
      console.log(`   Duration: ${clip.duration || 'N/A'}s`);
    }
    process.exit(0);
  }
  
  if (status === 'failed') {
    console.log('\n❌ Failed:', job.error_message || 'Unknown error');
    process.exit(1);
  }
}

console.log('\n⏱️  Timeout after', maxAttempts * 2, 'seconds');
process.exit(1);
