import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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

console.log('🚀 OPTIMIZED VIRAL CLIP GENERATION TEST');
console.log('='.repeat(60));
console.log('Using Gemini Flash for fast processing (Klap.app style)');
console.log('');

const userId = 'd32c3d32-ce6d-4e55-92c6-9ad3686643b0';

// Check for existing videos first
console.log('🔍 Checking for existing videos...');
const { data: existingFiles } = await supabase.storage
  .from('repurpose-videos')
  .list(userId, { limit: 1, sortBy: { column: 'created_at', order: 'desc' } });

let videoId, videoUrl;

if (existingFiles && existingFiles.length > 0) {
  videoId = `${userId}/${existingFiles[0].name}`;
  const { data: urlData } = supabase.storage
    .from('repurpose-videos')
    .getPublicUrl(videoId);
  videoUrl = urlData.publicUrl;
  console.log(`✅ Using existing video: ${existingFiles[0].name}`);
} else {
  console.log('⚠️  No existing videos. Please upload one through the UI first.');
  console.log('   The system is ready - just needs a video file!');
  process.exit(0);
}

console.log('');

// Create job with optimized settings
console.log('🚀 Creating optimized job (fast processing)...');
const startTime = Date.now();

const { data: jobData, error: jobError } = await supabase.functions.invoke('repurpose-video', {
  body: {
    action: 'create_job',
    userId, videoId, videoUrl,
    options: {
      target_clip_count: 1, // Generate 1 clip for speed
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
  console.error('❌ Failed:', jobError?.message);
  process.exit(1);
}

const jobId = jobData.jobId;
console.log('✅ Job created:', jobId);
console.log('');

// Poll with speed indicators
console.log('⏳ Processing (optimized for speed)...');
console.log('');

let attempts = 0;
const maxAttempts = 90;
let lastProgress = -1;

const speedStages = {
  5: '📥 Downloading',
  15: '☁️  Uploading to Gemini',
  25: '🤖 AI Analysis (Flash model)',
  50: '🔍 Finding viral moments',
  70: '✂️  Creating clip',
  85: '✨ Adding captions',
  95: '💾 Finalizing'
};

while (attempts < maxAttempts) {
  await new Promise(r => setTimeout(r, 2000)); // Poll every 2s
  attempts++;
  
  const { data: statusData, error } = await supabase.functions.invoke('repurpose-video', {
    body: { action: 'get_status', jobId }
  });
  
  if (error) continue;
  
  const job = statusData;
  const progress = job.progress || 0;
  const status = job.status || 'unknown';
  
  if (progress !== lastProgress) {
    const stageKey = Math.floor(progress / 10) * 10;
    const stage = speedStages[stageKey] || 'Processing';
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    console.log(`   ${progress}% - ${stage} (${elapsed}s)`);
    lastProgress = progress;
  }
  
  if (status === 'completed') {
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n🎉🎉🎉 VIRAL CLIP GENERATED! 🎉🎉🎉');
    console.log(`⏱️  Total time: ${totalTime}s (optimized!)`);
    console.log('');
    
    if (job.result?.clips?.length > 0) {
      const clip = job.result.clips[0];
      console.log('📹 Generated Viral Clip:');
      console.log('='.repeat(60));
      console.log(`   🎬 "${clip.title}"`);
      console.log(`   🔥 Virality: ${clip.virality_score}/100`);
      console.log(`   ⏱️  ${clip.duration}s clip`);
      console.log(`   ⏰ ${clip.start_time}s - ${clip.end_time}s`);
      if (clip.hooks?.length > 0) {
        console.log(`   🎣 Hooks: ${clip.hooks.slice(0, 2).join(', ')}`);
      }
      if (clip.hashtags?.length > 0) {
        console.log(`   #️⃣  ${clip.hashtags.slice(0, 3).join(' ')}`);
      }
      console.log('='.repeat(60));
      console.log('\n✅ SUCCESS! Viral clip generation is working!');
    }
    process.exit(0);
  }
  
  if (status === 'failed') {
    console.log('\n❌ Failed:', job.error_message);
    process.exit(1);
  }
}

console.log('\n⏱️  Timeout');
process.exit(1);
