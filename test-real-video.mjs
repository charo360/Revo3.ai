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
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const serviceSupabase = SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY) : null;

console.log('🧪 TESTING WITH REAL VIDEO FILE');
console.log('='.repeat(60));
console.log('');

const userId = 'd32c3d32-ce6d-4e55-92c6-9ad3686643b0';

// Step 1: Load real video file
console.log('📹 Step 1: Loading video file...');
const videoPath = join(__dirname, 'src/assets/Why You Stay Broke While They Get Rich – Machiavelli\'s Principles for Making Money - PsychUnboxed (720p, h264, youtube).mp4');

if (!existsSync(videoPath)) {
  console.error('❌ Video file not found:', videoPath);
  process.exit(1);
}

const videoBuffer = readFileSync(videoPath);
const videoSizeMB = (videoBuffer.length / (1024 * 1024)).toFixed(2);
console.log(`   ✅ Video loaded: ${videoSizeMB} MB`);
console.log('');

// Step 2: Upload using Edge Function (bypasses RLS)
console.log('☁️  Step 2: Uploading video via Edge Function...');
const fileName = `test_real_video_${Date.now()}.mp4`;
const filePath = `${userId}/${fileName}`;

// Convert to base64 chunks for Edge Function
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const totalChunks = Math.ceil(videoBuffer.length / CHUNK_SIZE);
const chunks = [];

console.log(`   Chunking video into ${totalChunks} chunks...`);
for (let i = 0; i < totalChunks; i++) {
  const start = i * CHUNK_SIZE;
  const end = Math.min(start + CHUNK_SIZE, videoBuffer.length);
  const chunk = videoBuffer.slice(start, end);
  const base64 = chunk.toString('base64');
  chunks.push(base64);
  
  if ((i + 1) % 5 === 0 || i === totalChunks - 1) {
    console.log(`   Processed ${i + 1}/${totalChunks} chunks...`);
  }
}

console.log('   Uploading via Edge Function...');
const { data: uploadData, error: uploadError } = await supabase.functions.invoke('upload-video', {
  body: {
    filePath: filePath,
    userId: userId,
    chunks: chunks,
    fileName: fileName,
    contentType: 'video/mp4'
  }
});

if (uploadError) {
  console.error('❌ Upload failed:', uploadError.message);
  process.exit(1);
}

if (!uploadData || !uploadData.publicUrl) {
  console.error('❌ Invalid upload response:', uploadData);
  process.exit(1);
}

const videoUrl = uploadData.publicUrl;
const videoId = uploadData.videoId || filePath;

console.log('   ✅ Video uploaded:', videoId);
console.log('   ✅ Public URL:', videoUrl.substring(0, 60) + '...');
console.log('');

// Step 3: Create repurpose job
console.log('🚀 Step 3: Creating repurpose job...');
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

// Step 4: Poll for completion
console.log('⏳ Step 4: Polling job status...');
console.log('   Processing with Gemini AI - analyzing for viral moments...');
console.log('   (This may take 30-90 seconds)');
console.log('');

let attempts = 0;
const maxAttempts = 120; // 6 minutes max
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
    if (attempts % 10 === 0) { // Log every 10th attempt
      console.log(`   Attempt ${attempts}: Error - ${statusError.message}`);
    }
    continue;
  }
  
  const job = statusData;
  const progress = job.progress || 0;
  const status = job.status || 'unknown';
  
  if (progress !== lastProgress || status !== lastStatus) {
    const emoji = status === 'processing' ? '🔄' : status === 'completed' ? '✅' : status === 'failed' ? '❌' : '⏳';
    const statusText = status === 'processing' ? 
      (progress < 30 ? 'Downloading video...' :
       progress < 50 ? 'Analyzing with Gemini AI...' :
       progress < 70 ? 'Detecting viral moments...' :
       progress < 90 ? 'Generating clips...' : 'Finalizing...') : status;
    console.log(`   ${emoji} ${progress}% - ${statusText}`);
    lastProgress = progress;
    lastStatus = status;
  }
  
  if (status === 'completed') {
    console.log('\n🎉🎉🎉 VIRAL CLIP GENERATED SUCCESSFULLY! 🎉🎉🎉\n');
    console.log('📊 RESULTS:');
    console.log('='.repeat(60));
    
    if (job.result && job.result.clips && job.result.clips.length > 0) {
      const clips = job.result.clips;
      console.log(`\n✅ Generated ${clips.length} viral clip(s):\n`);
      
      clips.forEach((clip, i) => {
        console.log(`📹 Clip ${i + 1}:`);
        console.log(`   🎬 Title: ${clip.title || 'Untitled'}`);
        console.log(`   ⏱️  Duration: ${clip.duration}s`);
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
          console.log(`   📝 Description: ${clip.description.substring(0, 150)}...`);
        }
        if (clip.captions && clip.captions.length > 0) {
          console.log(`   💬 Captions: ${clip.captions.length} segments`);
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
    console.log('✅ SUCCESS! Viral clip generation is fully working!');
    process.exit(0);
  }
  
  if (status === 'failed') {
    console.log('\n❌ Job failed:', job.error_message);
    console.log('\n🔍 Debugging error...');
    
    if (job.error_message?.includes('GEMINI_API_KEY')) {
      console.log('💡 Missing Gemini API Key');
      console.log('   Run: supabase secrets set GEMINI_API_KEY=your_key');
    } else if (job.error_message?.includes('download')) {
      console.log('💡 Video download issue');
    } else {
      console.log('   Full error:', job.error_message);
    }
    process.exit(1);
  }
}

console.log('\n⏱️  Timeout: Job did not complete');
console.log('   Last status:', lastStatus, 'Progress:', lastProgress + '%');
process.exit(1);
