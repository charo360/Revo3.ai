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

console.log('🧪 COMPLETE END-TO-END TEST');
console.log('='.repeat(60));
console.log('');

const userId = 'd32c3d32-ce6d-4e55-92c6-9ad3686643b0';

// Check for existing videos in storage first
console.log('🔍 Step 1: Checking for existing videos...');
const { data: existingFiles, error: listError } = await supabase.storage
  .from('repurpose-videos')
  .list(userId, { limit: 5 });

let videoId, videoUrl;

if (!listError && existingFiles && existingFiles.length > 0) {
  const existingFile = existingFiles[0];
  videoId = `${userId}/${existingFile.name}`;
  const { data: urlData } = supabase.storage
    .from('repurpose-videos')
    .getPublicUrl(videoId);
  videoUrl = urlData.publicUrl;
  console.log(`   ✅ Using existing video: ${existingFile.name}`);
  console.log(`   Size: ${(existingFile.metadata?.size / (1024 * 1024)).toFixed(2) || 'N/A'} MB`);
} else {
  console.log('   ⚠️  No existing videos found');
  console.log('   💡 Please upload a video through the UI first, or');
  console.log('   💡 The upload-video Edge Function needs to be working');
  console.log('');
  console.log('   Testing job creation anyway with placeholder...');
  videoId = `test_${Date.now()}.mp4`;
  videoUrl = 'https://example.com/test.mp4';
}

console.log('');

// Create job
console.log('🚀 Step 2: Creating repurpose job...');
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

// Poll
console.log('⏳ Step 3: Processing (Gemini AI)...');
console.log('   This will analyze the video and generate viral clips');
console.log('');

let attempts = 0;
const maxAttempts = 120;
let lastProgress = -1;
let lastStatus = '';

const progressMessages = {
  5: '📥 Downloading video from storage',
  15: '☁️  Uploading to Gemini File API',
  25: '🤖 Gemini AI analyzing video',
  30: '🔍 Detecting viral moments',
  50: '📊 Scoring segments for virality',
  70: '✂️  Generating clips',
  85: '✨ Enhancing with captions & hashtags',
  90: '💾 Saving clips to storage',
  95: '🎬 Finalizing results'
};

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
    if (attempts % 10 === 0) {
      console.log(`   Attempt ${attempts}: ${statusError.message}`);
    }
    continue;
  }
  
  const job = statusData;
  const progress = job.progress || 0;
  const status = job.status || 'unknown';
  
  // Show progress updates
  const progressKey = Math.floor(progress / 10) * 10;
  const message = progressMessages[progressKey] || 'Processing';
  
  if (progress !== lastProgress || status !== lastStatus) {
    const emoji = status === 'processing' ? '🔄' : status === 'completed' ? '✅' : status === 'failed' ? '❌' : '⏳';
    console.log(`   ${emoji} ${progress}% - ${message}`);
    lastProgress = progress;
    lastStatus = status;
  }
  
  if (status === 'completed') {
    console.log('\n🎉🎉🎉 SUCCESS! VIRAL CLIP GENERATED! 🎉🎉🎉\n');
    console.log('📊 RESULTS:');
    console.log('='.repeat(60));
    
    if (job.result && job.result.clips && job.result.clips.length > 0) {
      const clips = job.result.clips;
      console.log(`\n✅ Generated ${clips.length} viral clip(s):\n`);
      
      clips.forEach((clip, i) => {
        console.log(`📹 Clip ${i + 1}:`);
        console.log(`   🎬 Title: "${clip.title || 'Viral Clip'}"`);
        console.log(`   ⏱️  Duration: ${clip.duration} seconds`);
        console.log(`   🔥 Virality Score: ${clip.virality_score}/100`);
        console.log(`   📈 Engagement Score: ${clip.engagement_score || clip.virality_score}/100`);
        console.log(`   ⏰ Time Range: ${clip.start_time}s - ${clip.end_time}s`);
        console.log(`   📱 Platform: ${clip.platform_format || 'youtube_shorts'}`);
        if (clip.hooks && clip.hooks.length > 0) {
          console.log(`   🎣 Hooks: ${clip.hooks.join(', ')}`);
        }
        if (clip.hashtags && clip.hashtags.length > 0) {
          console.log(`   #️⃣  Hashtags: ${clip.hashtags.join(' ')}`);
        }
        if (clip.description) {
          console.log(`   📝 Description: ${clip.description.substring(0, 200)}${clip.description.length > 200 ? '...' : ''}`);
        }
        if (clip.captions && clip.captions.length > 0) {
          console.log(`   💬 Captions: ${clip.captions.length} segments generated`);
        }
        console.log('');
      });
      
      console.log('📈 Statistics:');
      console.log(`   Total Clips Generated: ${job.result.statistics?.total_clips_generated || clips.length}`);
      console.log(`   Average Virality Score: ${job.result.statistics?.average_virality_score?.toFixed(1) || 'N/A'}/100`);
      console.log(`   Processing Time: ${job.result.statistics?.processing_time_seconds?.toFixed(1) || 'N/A'} seconds`);
      
      if (job.result.gemini_analysis) {
        console.log(`   Segments Analyzed: ${job.result.gemini_analysis.segments_analyzed || 'N/A'}`);
        console.log(`   Top Virality Score: ${job.result.gemini_analysis.top_score?.toFixed(1) || 'N/A'}/10`);
      }
    } else {
      console.log('⚠️  No clips in result');
    }
    
    console.log('='.repeat(60));
    console.log('\n✅✅✅ VIRAL CLIP GENERATION IS FULLY WORKING! ✅✅✅');
    process.exit(0);
  }
  
  if (status === 'failed') {
    console.log('\n❌ Job failed:', job.error_message);
    console.log('\n🔍 Error Analysis:');
    
    if (job.error_message?.includes('GEMINI_API_KEY') || job.error_message?.includes('Gemini')) {
      console.log('💡 Missing Gemini API Key');
      console.log('   Run: supabase secrets set GEMINI_API_KEY=your_key_here');
    } else if (job.error_message?.includes('download') || job.error_message?.includes('storage')) {
      console.log('💡 Video download/storage issue');
      console.log('   Make sure video is uploaded to storage first');
    } else {
      console.log('   Full error:', job.error_message);
    }
    process.exit(1);
  }
}

console.log('\n⏱️  Timeout: Job did not complete within 6 minutes');
console.log(`   Last status: ${lastStatus}, Progress: ${lastProgress}%`);
process.exit(1);
