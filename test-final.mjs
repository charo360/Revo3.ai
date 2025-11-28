import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
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

console.log('🧪 FINAL TEST: VIRAL CLIP GENERATION');
console.log('='.repeat(60));
console.log('');

const userId = 'd32c3d32-ce6d-4e55-92c6-9ad3686643b0';

// Find video file
console.log('📹 Step 1: Finding video file...');
let videoPath = null;
try {
  const result = execSync('find src/assets -name "*.mp4" -type f 2>/dev/null | head -1', { encoding: 'utf-8', cwd: __dirname }).trim();
  if (result) {
    videoPath = join(__dirname, result);
  }
} catch (e) {}

if (!videoPath || !existsSync(videoPath)) {
  console.log('   ⚠️  No video file found in src/assets');
  console.log('   💡 Creating minimal test video...');
  
  // Create minimal valid MP4
  const minimalMP4 = Buffer.from([
    0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70,
    0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00,
    0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32,
    0x6D, 0x70, 0x34, 0x31, 0x00, 0x00, 0x00, 0x08,
    0x6D, 0x64, 0x61, 0x74
  ]);
  
  videoPath = join(__dirname, 'test-minimal.mp4');
  const fs = await import('fs');
  fs.writeFileSync(videoPath, minimalMP4);
  console.log('   ✅ Created minimal test video');
} else {
  console.log('   ✅ Found video:', videoPath);
}

const videoBuffer = readFileSync(videoPath);
const videoSizeMB = (videoBuffer.length / (1024 * 1024)).toFixed(2);
console.log(`   Size: ${videoSizeMB} MB`);
console.log('');

// Upload via Edge Function
console.log('☁️  Step 2: Uploading video...');
const fileName = `test_${Date.now()}.mp4`;
const filePath = `${userId}/${fileName}`;

// Chunk for Edge Function
const CHUNK_SIZE = 5 * 1024 * 1024;
const totalChunks = Math.ceil(videoBuffer.length / CHUNK_SIZE);
const chunks = [];

for (let i = 0; i < totalChunks; i++) {
  const start = i * CHUNK_SIZE;
  const end = Math.min(start + CHUNK_SIZE, videoBuffer.length);
  chunks.push(videoBuffer.slice(start, end).toString('base64'));
}

console.log(`   Uploading ${totalChunks} chunks...`);
const { data: uploadData, error: uploadError } = await supabase.functions.invoke('upload-video', {
  body: {
    filePath, userId, chunks, fileName, contentType: 'video/mp4'
  }
});

if (uploadError) {
  console.error('❌ Upload failed:', uploadError.message);
  process.exit(1);
}

const videoUrl = uploadData.publicUrl;
const videoId = uploadData.videoId || filePath;
console.log('   ✅ Uploaded:', videoId);
console.log('');

// Create job
console.log('🚀 Step 3: Creating repurpose job...');
const { data: jobData, error: jobError } = await supabase.functions.invoke('repurpose-video', {
  body: {
    action: 'create_job',
    userId, videoId, videoUrl,
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
  console.error('❌ Job creation failed:', jobError?.message || 'Invalid response');
  process.exit(1);
}

const jobId = jobData.jobId;
console.log('   ✅ Job created:', jobId);
console.log('');

// Poll
console.log('⏳ Step 4: Processing (Gemini AI analysis)...');
let attempts = 0;
const maxAttempts = 120;

while (attempts < maxAttempts) {
  await new Promise(r => setTimeout(r, 3000));
  attempts++;
  
  const { data: statusData, error: statusError } = await supabase.functions.invoke('repurpose-video', {
    body: { action: 'get_status', jobId }
  });
  
  if (statusError) continue;
  
  const job = statusData;
  const progress = job.progress || 0;
  const status = job.status || 'unknown';
  
  if (progress % 10 === 0 || status !== 'processing') {
    console.log(`   ${progress}% - ${status}`);
  }
  
  if (status === 'completed') {
    console.log('\n🎉 SUCCESS! Viral clip generated!\n');
    if (job.result?.clips?.length > 0) {
      const clip = job.result.clips[0];
      console.log('📹 Generated Clip:');
      console.log(`   Title: ${clip.title}`);
      console.log(`   Score: ${clip.virality_score}/100`);
      console.log(`   Duration: ${clip.duration}s`);
      console.log(`   Time: ${clip.start_time}s - ${clip.end_time}s`);
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
