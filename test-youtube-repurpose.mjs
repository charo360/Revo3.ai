/**
 * Test Script: Generate Viral Clip from YouTube Video
 * 
 * This script tests the full viral clip generation pipeline using a YouTube URL
 * 
 * Usage: node test-youtube-repurpose.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '.env.local');
let envVars = {};
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
} catch (error) {
  console.warn('⚠️  Could not load .env.local, using process.env');
  envVars = process.env;
}

const SUPABASE_URL = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
const SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY || envVars.SUPABASE_ANON_KEY;
const YOUTUBE_URL = 'https://www.youtube.com/watch?v=C53N3SdD4Cs';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Download YouTube video
 * First tries Edge Function, falls back to local file
 */
async function downloadYouTubeVideo(url) {
  console.log('📥 Downloading YouTube video...');
  console.log('   URL:', url);
  
  try {
    // Try to use Edge Function to download (if implemented)
    try {
      const { data, error } = await supabase.functions.invoke('download-youtube', {
        body: { youtubeUrl: url }
      });
      
      if (!error && data && data.downloadUrl) {
        console.log('✅ Downloading from Edge Function...');
        const response = await fetch(data.downloadUrl);
        const arrayBuffer = await response.arrayBuffer();
        console.log(`✅ Video downloaded: ${(arrayBuffer.byteLength / (1024 * 1024)).toFixed(2)} MB`);
        return arrayBuffer;
      }
    } catch (edgeError) {
      console.log('⚠️  Edge Function download not available, trying local file...');
    }
    
    // Fallback: Try to read a local file if it exists
    const fs = await import('fs');
    const testVideoPath = join(__dirname, 'test-video.mp4');
    try {
      const videoBuffer = fs.readFileSync(testVideoPath);
      console.log('✅ Found local test video file');
      return videoBuffer.buffer;
    } catch {
      console.log('\n📋 INSTRUCTIONS:');
      console.log('   To test with this YouTube video, please:');
      console.log('   1. Download the video from:', url);
      console.log('   2. Save it as "test-video.mp4" in the project root');
      console.log('   3. Run this script again\n');
      throw new Error('No local video file found. Please download the YouTube video manually and save as "test-video.mp4"');
    }
  } catch (error) {
    console.error('❌ Failed to download video:', error.message);
    throw error;
  }
}

/**
 * Upload video to Supabase Storage
 */
async function uploadVideoToStorage(videoBuffer, userId) {
  console.log('☁️  Uploading video to Supabase Storage...');
  
  const fileName = `test_video_${Date.now()}.mp4`;
  const filePath = `${userId}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('repurpose-videos')
    .upload(filePath, videoBuffer, {
      contentType: 'video/mp4',
      upsert: false
    });
  
  if (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
  
  console.log('✅ Video uploaded:', filePath);
  
  const { data: urlData } = supabase.storage
    .from('repurpose-videos')
    .getPublicUrl(filePath);
  
  return {
    videoId: filePath,
    publicUrl: urlData.publicUrl
  };
}

/**
 * Create repurpose job
 */
async function createRepurposeJob(userId, videoId, videoUrl, options) {
  console.log('🚀 Creating repurpose job...');
  
  const { data, error } = await supabase.functions.invoke('repurpose-video', {
    body: {
      action: 'create_job',
      userId,
      videoId,
      videoUrl,
      options
    }
  });
  
  if (error) {
    console.error('❌ Failed to create job:', error);
    throw error;
  }
  
  console.log('✅ Job created:', data.jobId);
  return data.jobId;
}

/**
 * Poll job status
 */
async function pollJobStatus(jobId, maxWait = 120000) {
  console.log('⏳ Polling job status...');
  
  const startTime = Date.now();
  let lastProgress = 0;
  
  while (Date.now() - startTime < maxWait) {
    const { data, error } = await supabase.functions.invoke('repurpose-video', {
      body: {
        action: 'get_status',
        jobId
      }
    });
    
    if (error) {
      console.error('❌ Failed to get job status:', error);
      throw error;
    }
    
    const job = data;
    const progress = job.progress || 0;
    
    if (progress > lastProgress) {
      console.log(`   Progress: ${progress}% - Status: ${job.status}`);
      lastProgress = progress;
    }
    
    if (job.status === 'completed') {
      console.log('✅ Job completed!');
      return job;
    }
    
    if (job.status === 'failed') {
      console.error('❌ Job failed:', job.error_message);
      throw new Error(job.error_message || 'Job failed');
    }
    
    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Job polling timeout');
}

/**
 * Main test function
 */
async function testViralClipGeneration() {
  console.log('🎬 Starting Viral Clip Generation Test');
  console.log('=====================================\n');
  
  try {
    // Step 1: Get or create test user
    console.log('👤 Setting up test user...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    let userId;
    if (user) {
      userId = user.id;
      console.log('✅ Using existing user:', userId);
    } else {
      console.log('⚠️  No authenticated user. Using test user ID...');
      userId = 'test-user-' + Date.now();
      console.log('   Test user ID:', userId);
    }
    
    // Step 2: Download YouTube video
    const videoBuffer = await downloadYouTubeVideo(YOUTUBE_URL);
    console.log(`✅ Video downloaded: ${(videoBuffer.byteLength / (1024 * 1024)).toFixed(2)} MB\n`);
    
    // Step 3: Upload to Supabase Storage
    const { videoId, publicUrl } = await uploadVideoToStorage(videoBuffer, userId);
    console.log(`✅ Video uploaded to storage\n`);
    
    // Step 4: Create repurpose job
    const options = {
      target_clip_count: 1, // Generate just 1 clip for testing
      min_duration: 15,
      max_duration: 60,
      virality_threshold: 70,
      platforms: ['youtube_shorts'],
      include_captions: true,
      include_transitions: true,
      overlap_prevention: true
    };
    
    const jobId = await createRepurposeJob(userId, videoId, publicUrl, options);
    console.log(`✅ Job created: ${jobId}\n`);
    
    // Step 5: Poll for results
    const job = await pollJobStatus(jobId);
    
    // Step 6: Display results
    console.log('\n📊 RESULTS');
    console.log('=====================================');
    
    if (job.result && job.result.clips) {
      const clips = job.result.clips;
      console.log(`\n✅ Generated ${clips.length} viral clip(s):\n`);
      
      clips.forEach((clip, index) => {
        console.log(`Clip ${index + 1}:`);
        console.log(`  Title: ${clip.title || 'Untitled'}`);
        console.log(`  Duration: ${clip.duration}s`);
        console.log(`  Virality Score: ${clip.virality_score}/100`);
        console.log(`  Time Range: ${clip.start_time}s - ${clip.end_time}s`);
        console.log(`  Platform: ${clip.platform_format}`);
        if (clip.hooks && clip.hooks.length > 0) {
          console.log(`  Hooks: ${clip.hooks.join(', ')}`);
        }
        if (clip.hashtags && clip.hashtags.length > 0) {
          console.log(`  Hashtags: ${clip.hashtags.join(' ')}`);
        }
        console.log(`  URL: ${clip.clip_url || 'N/A'}`);
        console.log('');
      });
      
      console.log(`\n📈 Statistics:`);
      console.log(`  Total Clips: ${job.result.statistics.total_clips_generated}`);
      console.log(`  Average Score: ${job.result.statistics.average_virality_score.toFixed(1)}/100`);
      console.log(`  Processing Time: ${job.result.statistics.processing_time_seconds.toFixed(1)}s`);
    } else {
      console.log('⚠️  No clips generated');
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testViralClipGeneration();

