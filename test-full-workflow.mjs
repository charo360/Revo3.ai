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

console.log('🧪 FULL WORKFLOW TEST');
console.log('='.repeat(60));
console.log('');

const userId = 'd32c3d32-ce6d-4e55-92c6-9ad3686643b0';

// Test 1: Check if we can upload a small test video
console.log('📤 Step 1: Testing video upload...');
const testVideoPath = join(__dirname, 'test-video.mp4');

let videoId, videoUrl;
try {
  const fs = await import('fs');
  if (fs.existsSync(testVideoPath)) {
    console.log('   Found test video file');
    const videoBuffer = fs.readFileSync(testVideoPath);
    const fileName = `test_${Date.now()}.mp4`;
    const filePath = `${userId}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('repurpose-videos')
      .upload(filePath, videoBuffer, {
        contentType: 'video/mp4',
        upsert: false
      });
    
    if (uploadError) {
      console.log('   ⚠️  Upload failed:', uploadError.message);
      console.log('   (Will test with YouTube URL instead)');
    } else {
      videoId = filePath;
      const { data: urlData } = supabase.storage
        .from('repurpose-videos')
        .getPublicUrl(filePath);
      videoUrl = urlData.publicUrl;
      console.log('   ✅ Video uploaded:', videoId);
    }
  } else {
    console.log('   ⚠️  No test video file found');
    console.log('   (Will test with YouTube URL)');
  }
} catch (e) {
  console.log('   ⚠️  Could not check for test video:', e.message);
}

// Test 2: Create job (with YouTube URL if no video uploaded)
if (!videoId) {
  console.log('\n📹 Step 2: Testing with YouTube URL...');
  videoId = `youtube_${Date.now()}_${userId}`;
  videoUrl = 'https://www.youtube.com/watch?v=C53N3SdD4Cs';
  console.log('   YouTube URL:', videoUrl);
}

console.log('\n🚀 Step 3: Creating repurpose job...');
const { data: jobData, error: jobError } = await supabase.functions.invoke('repurpose-video', {
  body: {
    action: 'create_job',
    userId: userId,
    videoId: videoId,
    videoUrl: videoUrl,
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

if (jobError) {
  console.error('❌ Job creation failed:', jobError.message);
  process.exit(1);
}

if (!jobData || !jobData.jobId) {
  console.error('❌ Invalid response:', jobData);
  process.exit(1);
}

const jobId = jobData.jobId;
console.log('   ✅ Job created:', jobId);
console.log('   Status:', jobData.status);
console.log('');

// Test 3: Poll for completion
console.log('⏳ Step 4: Polling job status...');
console.log('   (This may take 30-60 seconds)');
console.log('');

let attempts = 0;
const maxAttempts = 60;

while (attempts < maxAttempts) {
  await new Promise(resolve => setTimeout(resolve, 3000));
  attempts++;
  
  const { data: statusData, error: statusError } = await supabase.functions.invoke('repurpose-video', {
    body: {
      action: 'get_status',
      jobId: jobId
    }
  });
  
  if (statusError) {
    console.log(`   Attempt ${attempts}: Error - ${statusError.message}`);
    continue;
  }
  
  const job = statusData;
  const progress = job.progress || 0;
  const status = job.status || 'unknown';
  
  console.log(`   ${progress}% - ${status}`);
  
  if (status === 'completed') {
    console.log('\n✅ JOB COMPLETED!\n');
    console.log('📊 RESULTS:');
    console.log('='.repeat(60));
    
    if (job.result && job.result.clips) {
      console.log(`   Total Clips: ${job.result.clips.length}`);
      console.log(`   Avg Score: ${job.result.statistics?.average_virality_score?.toFixed(1) || 'N/A'}/100`);
      console.log(`   Processing Time: ${job.result.statistics?.processing_time_seconds?.toFixed(1) || 'N/A'}s`);
      console.log('');
      
      job.result.clips.forEach((clip, i) => {
        console.log(`   Clip ${i + 1}:`);
        console.log(`     Title: ${clip.title || 'Untitled'}`);
        console.log(`     Duration: ${clip.duration}s`);
        console.log(`     Score: ${clip.virality_score}/100`);
        console.log(`     Time: ${clip.start_time}s - ${clip.end_time}s`);
      });
    }
    
    console.log('='.repeat(60));
    console.log('🎉 SUCCESS! Viral clip generation is working!');
    process.exit(0);
  }
  
  if (status === 'failed') {
    console.log('\n❌ Job failed:', job.error_message);
    if (job.error_message?.includes('YouTube download')) {
      console.log('   💡 YouTube download not implemented yet.');
      console.log('   ✅ But the system is working! Just needs yt-dlp.');
    }
    process.exit(1);
  }
}

console.log('\n⏱️  Timeout: Job did not complete');
process.exit(1);
