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

console.log('🧪 UPLOAD VIDEO & GENERATE VIRAL CLIP');
console.log('='.repeat(60));
console.log('');

const userId = 'd32c3d32-ce6d-4e55-92c6-9ad3686643b0';

// Find video
console.log('📹 Step 1: Loading video file...');
let videoPath;
try {
  const result = execSync('find src/assets -name "*.mp4" -type f 2>/dev/null | head -1', { 
    encoding: 'utf-8', cwd: __dirname 
  }).trim();
  videoPath = result ? join(__dirname, result) : null;
} catch (e) {
  videoPath = null;
}

if (!videoPath) {
  console.error('❌ No video file found');
  console.log('💡 Please ensure a video file exists in src/assets/');
  process.exit(1);
}

console.log('   ✅ Found:', videoPath.split('/').pop());
const videoBuffer = readFileSync(videoPath);
const sizeMB = (videoBuffer.length / (1024 * 1024)).toFixed(2);
console.log(`   Size: ${sizeMB} MB`);
console.log('');

// Upload via Edge Function (handles large files)
console.log('☁️  Step 2: Uploading via Edge Function...');
const fileName = `viral_test_${Date.now()}.mp4`;
const filePath = `${userId}/${fileName}`;

// Chunk for upload
const CHUNK = 5 * 1024 * 1024;
const chunks = [];
const total = Math.ceil(videoBuffer.length / CHUNK);

for (let i = 0; i < total; i++) {
  const start = i * CHUNK;
  const end = Math.min(start + CHUNK, videoBuffer.length);
  chunks.push(videoBuffer.slice(start, end).toString('base64'));
  if ((i + 1) % 3 === 0 || i === total - 1) {
    console.log(`   Chunked: ${i + 1}/${total}`);
  }
}

console.log('   Uploading to Edge Function...');
const { data: uploadData, error: uploadError } = await supabase.functions.invoke('upload-video', {
  body: { filePath, userId, chunks, fileName, contentType: 'video/mp4' }
});

if (uploadError) {
  console.error('❌ Upload failed:', uploadError.message);
  console.log('   Trying direct storage upload as fallback...');
  
  // Fallback: try direct upload (may fail for large files)
  const { error: directError } = await supabase.storage
    .from('repurpose-videos')
    .upload(filePath, videoBuffer, { contentType: 'video/mp4' });
  
  if (directError) {
    console.error('❌ Direct upload also failed:', directError.message);
    process.exit(1);
  }
  
  const { data: urlData } = supabase.storage
    .from('repurpose-videos')
    .getPublicUrl(filePath);
  
  var videoUrl = urlData.publicUrl;
  var videoId = filePath;
  console.log('   ✅ Uploaded via direct method');
} else {
  const videoUrl = uploadData.publicUrl;
  const videoId = uploadData.videoId || filePath;
  console.log('   ✅ Uploaded:', videoId);
}

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
  console.error('❌ Job creation failed:', jobError?.message);
  process.exit(1);
}

const jobId = jobData.jobId;
console.log('   ✅ Job created:', jobId);
console.log('');

// Poll
console.log('⏳ Step 4: Processing with Gemini AI...');
console.log('   Analyzing video for viral moments...');
console.log('');

let attempts = 0;
const maxAttempts = 120;

while (attempts < maxAttempts) {
  await new Promise(r => setTimeout(r, 3000));
  attempts++;
  
  const { data: statusData, error } = await supabase.functions.invoke('repurpose-video', {
    body: { action: 'get_status', jobId }
  });
  
  if (error) continue;
  
  const job = statusData;
  const progress = job.progress || 0;
  const status = job.status || 'unknown';
  
  if (progress % 10 === 0 || status !== 'processing') {
    const stage = progress < 30 ? 'Analyzing' : progress < 70 ? 'Generating' : 'Finalizing';
    console.log(`   ${progress}% - ${stage} (${status})`);
  }
  
  if (status === 'completed') {
    console.log('\n🎉🎉🎉 VIRAL CLIP GENERATED! 🎉🎉🎉\n');
    
    if (job.result?.clips?.length > 0) {
      const clip = job.result.clips[0];
      console.log('📹 Generated Viral Clip:');
      console.log('='.repeat(60));
      console.log(`   🎬 Title: "${clip.title}"`);
      console.log(`   🔥 Virality Score: ${clip.virality_score}/100`);
      console.log(`   ⏱️  Duration: ${clip.duration}s`);
      console.log(`   ⏰ Time: ${clip.start_time}s - ${clip.end_time}s`);
      if (clip.hooks?.length > 0) console.log(`   🎣 Hooks: ${clip.hooks.join(', ')}`);
      if (clip.hashtags?.length > 0) console.log(`   #️⃣  ${clip.hashtags.join(' ')}`);
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
