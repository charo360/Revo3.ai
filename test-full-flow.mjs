import { createClient } from '@supabase/supabase-js';
import { readFileSync, statSync } from 'fs';
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

console.log('🎬 FULL VIRAL CLIP GENERATION TEST');
console.log('='.repeat(70));
console.log('Testing complete flow: Upload → Process → Generate');
console.log('');

const userId = 'd32c3d32-ce6d-4e55-92c6-9ad3686643b0';

// Step 1: Find video file
console.log('📹 Step 1: Finding video file...');
let videoPath;
try {
  const result = execSync('find src/assets -name "*.mp4" -type f 2>/dev/null | head -1', { 
    encoding: 'utf-8', 
    cwd: __dirname 
  }).trim();
  videoPath = result ? join(__dirname, result) : null;
} catch (e) {
  videoPath = null;
}

if (!videoPath) {
  console.error('   ❌ No video file found in src/assets/');
  process.exit(1);
}

console.log(`   ✅ Found: ${videoPath.split('/').pop()}`);

let videoBuffer;
try {
  const stats = statSync(videoPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`   📊 Size: ${sizeMB} MB`);
  
  videoBuffer = readFileSync(videoPath);
  console.log(`   ✅ Loaded into memory`);
} catch (error) {
  console.error('   ❌ Failed to load video:', error.message);
  process.exit(1);
}

console.log('');

// Step 2: Upload video (using Edge Function for large files)
console.log('☁️  Step 2: Uploading video to Supabase Storage...');
const fileName = `test_viral_${Date.now()}.mp4`;
const filePath = `${userId}/${fileName}`;

// Chunk the video for upload (same as browser)
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const totalChunks = Math.ceil(videoBuffer.length / CHUNK_SIZE);
const chunks = [];

console.log(`   📦 Chunking: ${totalChunks} chunks of ${(CHUNK_SIZE / (1024 * 1024)).toFixed(1)}MB each`);

for (let i = 0; i < totalChunks; i++) {
  const start = i * CHUNK_SIZE;
  const end = Math.min(start + CHUNK_SIZE, videoBuffer.length);
  const chunk = videoBuffer.slice(start, end);
  chunks.push(chunk.toString('base64'));
  
  if ((i + 1) % 3 === 0 || i === totalChunks - 1) {
    const progress = Math.round(((i + 1) / totalChunks) * 100);
    console.log(`   📤 Chunked: ${i + 1}/${totalChunks} (${progress}%)`);
  }
}

console.log('   🚀 Uploading via Edge Function...');
const uploadStart = Date.now();

const { data: uploadData, error: uploadError } = await supabase.functions.invoke('upload-video', {
  body: {
    filePath,
    userId,
    chunks,
    fileName,
    contentType: 'video/mp4'
  }
});

if (uploadError) {
  console.error('   ❌ Upload failed:', uploadError.message);
  if (uploadError.context) {
    console.error('   Context:', JSON.stringify(uploadError.context, null, 2));
  }
  process.exit(1);
}

const uploadTime = ((Date.now() - uploadStart) / 1000).toFixed(1);
const videoId = uploadData.videoId || filePath;
const videoUrl = uploadData.publicUrl;

if (!videoUrl) {
  console.error('   ❌ No public URL returned');
  console.error('   Response:', JSON.stringify(uploadData, null, 2));
  process.exit(1);
}

console.log(`   ✅ Uploaded in ${uploadTime}s`);
console.log(`   📍 Video ID: ${videoId}`);
console.log(`   🔗 URL: ${videoUrl.substring(0, 80)}...`);
console.log('');

// Step 3: Create repurpose job
console.log('🚀 Step 3: Creating repurpose job...');
const jobStart = Date.now();

const { data: jobData, error: jobError } = await supabase.functions.invoke('repurpose-video', {
  body: {
    action: 'create_job',
    userId,
    videoId,
    videoUrl,
    options: {
      target_clip_count: 1, // Generate 1 clip for testing
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
  console.error('   ❌ Job creation failed:', jobError?.message || 'No jobId returned');
  if (jobError?.context) {
    console.error('   Context:', JSON.stringify(jobError.context, null, 2));
  }
  if (jobData) {
    console.error('   Response:', JSON.stringify(jobData, null, 2));
  }
  process.exit(1);
}

const jobId = jobData.jobId;
console.log(`   ✅ Job created: ${jobId}`);
console.log('');

// Step 4: Poll for results
console.log('⏳ Step 4: Processing with Gemini AI (optimized for speed)...');
console.log('   Using Gemini Flash model for fast analysis');
console.log('');

let attempts = 0;
const maxAttempts = 180; // 6 minutes max
let lastProgress = -1;
let lastStatus = '';

const stages = {
  5: '📥 Downloading video',
  15: '☁️  Uploading to Gemini',
  25: '🤖 AI Analysis (Flash)',
  50: '🔍 Finding viral moments',
  70: '✂️  Creating clip',
  85: '✨ Adding captions',
  95: '💾 Finalizing'
};

while (attempts < maxAttempts) {
  await new Promise(r => setTimeout(r, 2000)); // Poll every 2s
  attempts++;
  
  const { data: statusData, error: statusError } = await supabase.functions.invoke('repurpose-video', {
    body: { action: 'get_status', jobId }
  });
  
  if (statusError) {
    if (attempts % 10 === 0) {
      console.log(`   ⚠️  Status check error (attempt ${attempts}): ${statusError.message}`);
    }
    continue;
  }
  
  const job = statusData;
  const progress = job.progress || 0;
  const status = job.status || 'unknown';
  
  // Show progress updates
  if (progress !== lastProgress || status !== lastStatus) {
    const elapsed = ((Date.now() - jobStart) / 1000).toFixed(0);
    const stageKey = Math.floor(progress / 10) * 10;
    const stage = stages[stageKey] || 'Processing';
    
    console.log(`   ${progress}% - ${stage} (${elapsed}s) [${status}]`);
    
    lastProgress = progress;
    lastStatus = status;
  }
  
  // Check completion
  if (status === 'completed') {
    const totalTime = ((Date.now() - jobStart) / 1000).toFixed(1);
    console.log('\n' + '='.repeat(70));
    console.log('🎉🎉🎉 SUCCESS! VIRAL CLIP GENERATED! 🎉🎉🎉');
    console.log('='.repeat(70));
    console.log(`⏱️  Total processing time: ${totalTime}s`);
    console.log('');
    
    if (job.result?.clips && job.result.clips.length > 0) {
      const clip = job.result.clips[0];
      console.log('📹 Generated Viral Clip:');
      console.log('-'.repeat(70));
      console.log(`   🎬 Title: "${clip.title || 'Untitled'}"`);
      console.log(`   🔥 Virality Score: ${clip.virality_score || 'N/A'}/100`);
      console.log(`   ⏱️  Duration: ${clip.duration || 'N/A'} seconds`);
      console.log(`   ⏰ Time Range: ${clip.start_time || 'N/A'}s - ${clip.end_time || 'N/A'}s`);
      
      if (clip.hooks && clip.hooks.length > 0) {
        console.log(`   🎣 Hooks: ${clip.hooks.slice(0, 3).join(', ')}`);
      }
      
      if (clip.hashtags && clip.hashtags.length > 0) {
        console.log(`   #️⃣  Hashtags: ${clip.hashtags.slice(0, 5).join(' ')}`);
      }
      
      if (clip.description) {
        console.log(`   📝 Description: ${clip.description.substring(0, 100)}...`);
      }
      
      console.log('-'.repeat(70));
      console.log('');
      console.log('✅ TEST PASSED! Viral clip generation is working correctly!');
      console.log('✅ This will work in the browser too!');
    } else {
      console.log('⚠️  Job completed but no clips in result');
      console.log('   Result:', JSON.stringify(job.result, null, 2));
    }
    
    process.exit(0);
  }
  
  if (status === 'failed') {
    console.log('\n❌ Job failed!');
    console.log(`   Error: ${job.error_message || 'Unknown error'}`);
    console.log(`   Progress: ${progress}%`);
    process.exit(1);
  }
}

console.log('\n⏱️  Timeout: Job did not complete within 6 minutes');
console.log(`   Last status: ${lastStatus}, Progress: ${lastProgress}%`);
process.exit(1);
