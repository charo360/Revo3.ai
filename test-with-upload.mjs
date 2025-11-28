import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
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

console.log('🧪 TESTING VIRAL CLIP GENERATION WITH UPLOADED VIDEO');
console.log('='.repeat(60));
console.log('');

const userId = 'd32c3d32-ce6d-4e55-92c6-9ad3686643b0';

// Step 1: Create a minimal test video (or use existing)
console.log('📹 Step 1: Preparing test video...');

// Try to find existing video or create a placeholder
const testVideoPaths = [
  join(__dirname, 'test-video.mp4'),
  join(__dirname, 'src/assets', '*.mp4'),
];

let videoBuffer = null;
let videoSize = 0;

// Create a minimal valid MP4 header for testing
// This is a very basic MP4 file structure
const minimalMP4 = Buffer.from([
  0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, // ftyp box
  0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00,
  0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32,
  0x6D, 0x70, 0x34, 0x31, 0x00, 0x00, 0x00, 0x08,
  0x6D, 0x64, 0x61, 0x74, // mdat box (empty)
]);

videoBuffer = minimalMP4;
videoSize = minimalMP4.length;

console.log(`   Created minimal test video (${videoSize} bytes)`);
console.log('   ⚠️  Note: This is a placeholder. For real testing, use an actual video file.');
console.log('');

// Step 2: Upload to storage
console.log('☁️  Step 2: Uploading video to storage...');
const fileName = `test_video_${Date.now()}.mp4`;
const filePath = `${userId}/${fileName}`;

const { data: uploadData, error: uploadError } = await supabase.storage
  .from('repurpose-videos')
  .upload(filePath, videoBuffer, {
    contentType: 'video/mp4',
    upsert: false
  });

if (uploadError) {
  console.error('❌ Upload failed:', uploadError.message);
  console.error('   Details:', uploadError);
  process.exit(1);
}

console.log('   ✅ Video uploaded:', filePath);

const { data: urlData } = supabase.storage
  .from('repurpose-videos')
  .getPublicUrl(filePath);

const videoUrl = urlData.publicUrl;
console.log('   ✅ Public URL:', videoUrl.substring(0, 60) + '...');
console.log('');

// Step 3: Create repurpose job
console.log('🚀 Step 3: Creating repurpose job...');
const { data: jobData, error: jobError } = await supabase.functions.invoke('repurpose-video', {
  body: {
    action: 'create_job',
    userId: userId,
    videoId: filePath,
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

// Step 4: Poll for completion
console.log('⏳ Step 4: Polling job status...');
console.log('   (Processing with Gemini AI - this may take 30-60 seconds)');
console.log('');

let attempts = 0;
const maxAttempts = 90; // 4.5 minutes max
let lastProgress = -1;
let lastStatus = '';

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
  
  if (progress !== lastProgress || status !== lastStatus) {
    const statusMsg = status === 'processing' ? '🔄' : status === 'completed' ? '✅' : status === 'failed' ? '❌' : '⏳';
    console.log(`   ${statusMsg} ${progress}% - ${status}`);
    lastProgress = progress;
    lastStatus = status;
  }
  
  if (status === 'completed') {
    console.log('\n🎉 JOB COMPLETED SUCCESSFULLY!\n');
    console.log('📊 VIRAL CLIP RESULTS:');
    console.log('='.repeat(60));
    
    if (job.result && job.result.clips) {
      const clips = job.result.clips;
      console.log(`\n✅ Generated ${clips.length} viral clip(s):\n`);
      
      clips.forEach((clip, i) => {
        console.log(`📹 Clip ${i + 1}:`);
        console.log(`   Title: ${clip.title || 'Untitled'}`);
        console.log(`   Duration: ${clip.duration}s`);
        console.log(`   Virality Score: ${clip.virality_score}/100 🔥`);
        console.log(`   Engagement Score: ${clip.engagement_score || 'N/A'}/100`);
        console.log(`   Time Range: ${clip.start_time}s - ${clip.end_time}s`);
        console.log(`   Platform: ${clip.platform_format || 'youtube_shorts'}`);
        if (clip.hooks && clip.hooks.length > 0) {
          console.log(`   Hooks: ${clip.hooks.join(', ')}`);
        }
        if (clip.hashtags && clip.hashtags.length > 0) {
          console.log(`   Hashtags: ${clip.hashtags.join(' ')}`);
        }
        if (clip.description) {
          console.log(`   Description: ${clip.description.substring(0, 100)}...`);
        }
        console.log('');
      });
      
      console.log('📈 Statistics:');
      console.log(`   Total Clips: ${job.result.statistics?.total_clips_generated || clips.length}`);
      console.log(`   Average Virality Score: ${job.result.statistics?.average_virality_score?.toFixed(1) || 'N/A'}/100`);
      console.log(`   Processing Time: ${job.result.statistics?.processing_time_seconds?.toFixed(1) || 'N/A'}s`);
      
      if (job.result.gemini_analysis) {
        console.log(`   Segments Analyzed: ${job.result.gemini_analysis.segments_analyzed || 'N/A'}`);
        console.log(`   Top Score: ${job.result.gemini_analysis.top_score?.toFixed(1) || 'N/A'}/10`);
      }
    } else {
      console.log('⚠️  No clips in result');
    }
    
    console.log('='.repeat(60));
    console.log('✅ SUCCESS! Viral clip generation is working!');
    process.exit(0);
  }
  
  if (status === 'failed') {
    console.log('\n❌ Job failed:', job.error_message);
    console.log('\n🔍 Error details:');
    console.log('   Status:', status);
    console.log('   Progress:', progress);
    console.log('   Error:', job.error_message);
    
    // Check if it's a Gemini API key issue
    if (job.error_message?.includes('GEMINI_API_KEY') || job.error_message?.includes('Gemini')) {
      console.log('\n💡 SOLUTION:');
      console.log('   Set GEMINI_API_KEY in Supabase secrets:');
      console.log('   supabase secrets set GEMINI_API_KEY=your_key');
    }
    
    process.exit(1);
  }
}

console.log('\n⏱️  Timeout: Job did not complete within 4.5 minutes');
console.log('   Check Edge Function logs for details');
process.exit(1);
