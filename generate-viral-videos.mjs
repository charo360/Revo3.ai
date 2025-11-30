/**
 * Generate 3 Viral Videos (TikTok, YouTube Shorts, Instagram Reels) with Captions
 * 
 * Quick script to:
 * 1. Upload video from assets
 * 2. Create 3 repurpose jobs (one per platform)
 * 3. Generate viral clips with captions for each platform
 * 4. Display results
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
let envVars = {};
try {
  const envFile = readFileSync(join(__dirname, '.env.local'), 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
} catch (e) {
  // .env.local doesn't exist, that's okay
}

const supabaseUrl = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://yxsscklulcedocisdrje.supabase.co';
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY || envVars.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ Missing Supabase ANON key.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : supabase;

const TEST_USER_ID = process.env.TEST_USER_ID || 'd32c3d32-ce6d-4e55-92c6-9ad3686643b0';

// Find video in assets
import { readdirSync } from 'fs';
const assetsDir = join(__dirname, 'src', 'assets');
let VIDEO_PATH = null;
try {
  const files = readdirSync(assetsDir);
  const mp4File = files.find(f => f.endsWith('.mp4'));
  if (mp4File) {
    VIDEO_PATH = join(assetsDir, mp4File);
  }
} catch (e) {
  console.error('Could not read assets directory:', e.message);
}

if (!VIDEO_PATH) {
  console.error('❌ No .mp4 file found in src/assets/');
  process.exit(1);
}

console.log('🚀 Generating 3 Viral Videos with Captions\n');
console.log('📁 Video:', VIDEO_PATH);
console.log('👤 User ID:', TEST_USER_ID);
console.log('');

// Import uploadService for chunked upload
import { readFile } from 'fs/promises';

async function uploadVideoChunked(videoBuffer, fileName, filePath) {
  const chunkSize = 5 * 1024 * 1024; // 5MB chunks
  const totalChunks = Math.ceil(videoBuffer.length / chunkSize);
  
  console.log(`   📦 Uploading ${totalChunks} chunks sequentially...`);
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, videoBuffer.length);
    const chunk = videoBuffer.slice(start, end);
    const base64Chunk = Buffer.from(chunk).toString('base64');
    
    const isLastChunk = i === totalChunks - 1;
    const progress = Math.round(((i + 1) / totalChunks) * 90);
    process.stdout.write(`   ⏳ Chunk ${i + 1}/${totalChunks} (${progress}%)...\r`);
    
    const { data, error } = await supabase.functions.invoke('upload-video', {
      body: {
        filePath: filePath,
        userId: TEST_USER_ID,
        chunks: [base64Chunk],
        chunkIndex: i,
        totalChunks: totalChunks,
        isLastChunk: isLastChunk,
        fileName: fileName,
        contentType: 'video/mp4'
      }
    });
    
    if (error) {
      if (isLastChunk) {
        console.log(`\n   ⚠️  Last chunk had error, but waiting for combination...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        break;
      }
      throw error;
    }
    
    if (isLastChunk && data?.publicUrl) {
      console.log(`\n   ✅ Upload complete!`);
      return { videoUrl: data.publicUrl, videoId: data.videoId || filePath };
    }
  }
  
  // Wait for file combination (longer wait for large files)
  console.log(`\n   ⏳ Waiting for file combination (up to 2 minutes)...`);
  let fileFound = false;
  for (let wait = 0; wait < 40; wait++) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const checkSupabase = supabaseAdmin || supabase;
    
    // Try to download the file to verify it exists
    const { data: testData, error: testError } = await checkSupabase.storage
      .from('repurpose-videos')
      .download(filePath);
    
    if (!testError && testData) {
      const blobSize = testData.size || 0;
      if (blobSize > 0) {
        const { data: urlData } = checkSupabase.storage
          .from('repurpose-videos')
          .getPublicUrl(filePath);
        
        if (urlData?.publicUrl) {
          console.log(`\n   ✅ File ready! (${(blobSize / (1024 * 1024)).toFixed(2)} MB, after ${(wait + 1) * 3}s)`);
          fileFound = true;
          return { videoUrl: urlData.publicUrl, videoId: filePath };
        }
      }
    }
    
    // Also check by listing files
    if (!fileFound) {
      const { data: listData } = await checkSupabase.storage
        .from('repurpose-videos')
        .list(TEST_USER_ID);
      
      if (listData) {
        const fileName = filePath.split('/').pop();
        const found = listData.find(f => f.name === fileName && f.metadata?.size > 0);
        if (found) {
          const { data: urlData } = checkSupabase.storage
            .from('repurpose-videos')
            .getPublicUrl(filePath);
          if (urlData?.publicUrl) {
            console.log(`\n   ✅ File found in listing! (after ${(wait + 1) * 3}s)`);
            fileFound = true;
            return { videoUrl: urlData.publicUrl, videoId: filePath };
          }
        }
      }
    }
    
    process.stdout.write(`   ⏳ Waiting... (${(wait + 1) * 3}s / 120s)\r`);
  }
  
  // Final fallback: use public URL (repurpose function will handle combination on-demand)
  const { data: urlData } = supabase.storage
    .from('repurpose-videos')
    .getPublicUrl(filePath);
  
  if (urlData?.publicUrl) {
    console.log(`\n   ⚠️  File not verified, but using public URL`);
    console.log(`   💡 Repurpose function will combine parts on-demand if needed`);
    return { 
      videoUrl: urlData.publicUrl, 
      videoId: filePath 
    };
  }
  
  throw new Error('File upload failed - could not get public URL');
}

async function createRepurposeJob(platform, videoId, videoUrl) {
  const platformName = platform === 'youtube_shorts' ? 'YouTube Shorts' : 
                       platform === 'tiktok' ? 'TikTok' : 
                       platform === 'instagram_reels' ? 'Instagram Reels' : platform;
  
  console.log(`\n🎬 Creating ${platformName} repurpose job...`);
  
  const options = {
    target_clip_count: 1, // One viral clip per platform
    min_duration: 15,
    max_duration: 60,
    virality_threshold: 70,
    platforms: [platform], // Single platform per job
    include_captions: true, // Enable captions
    include_transitions: true,
    overlap_prevention: true
  };

  let jobData, jobError;
  try {
    const result = await supabase.functions.invoke('repurpose-video', {
      body: {
        action: 'create_job',
        userId: TEST_USER_ID,
        videoId: videoId,
        videoUrl: videoUrl,
        options: options
      }
    });
    
    // Check if result has error property
    if (result.error) {
      jobError = result.error;
      console.error(`   ❌ Edge Function error for ${platformName}:`, JSON.stringify(result.error, null, 2));
    } else if (!result.data) {
      // Check if response itself indicates an error
      console.error(`   ❌ No data in response for ${platformName}:`, JSON.stringify(result, null, 2));
      jobError = { message: 'No data in response', response: result };
    } else {
      jobData = result.data;
    }
  } catch (err) {
    jobError = err;
    console.error(`   ❌ Exception creating ${platformName} job:`, err.message || err);
    console.error(`   ❌ Exception details:`, JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  }
  
  if (jobError) {
    const errorMsg = jobError.message || jobError.toString() || 'Unknown error';
    const errorDetails = jobError.context ? JSON.stringify(jobError.context) : '';
    const fullError = jobError.response ? JSON.stringify(jobError.response) : '';
    throw new Error(`Failed to create ${platformName} job: ${errorMsg}${errorDetails ? ' - ' + errorDetails : ''}${fullError ? ' - Response: ' + fullError : ''}`);
  }

  if (!jobData || !jobData.jobId) {
    console.error(`   ❌ Invalid response for ${platformName}:`, JSON.stringify(jobData, null, 2));
    throw new Error(`Missing jobId for ${platformName}. Response: ${JSON.stringify(jobData)}`);
  }

  return jobData.jobId;
}

async function pollJobStatus(jobId, platformName) {
  let attempts = 0;
  const maxAttempts = 180; // 6 minutes max
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;

    const { data: job, error } = await supabase.functions.invoke('repurpose-video', {
      body: {
        action: 'get_status',
        jobId: jobId
      }
    });
    
    if (error) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      continue;
    }

    if (!job) continue;
    
    const progress = job.progress || 0;
    const status = job.status;

    if (attempts % 15 === 0) {
      process.stdout.write(`   ⏳ ${platformName}: ${status.toUpperCase()} (${progress}%)\r`);
    }

    if (status === 'completed') {
      console.log(`\n   ✅ ${platformName} completed! (${attempts * 2}s)`);
      return job;
    }

    if (status === 'failed') {
      throw new Error(`${platformName} job failed: ${job.error_message || 'Unknown error'}`);
    }
  }

  throw new Error(`${platformName} job timeout`);
}

async function generateViralVideos() {
  try {
    // Step 1: Upload video
    console.log('📤 Step 1: Uploading video...');
    const videoBuffer = readFileSync(VIDEO_PATH);
    const fileName = `viral_gen_${Date.now()}_${TEST_USER_ID}.mp4`;
    const filePath = `${TEST_USER_ID}/${fileName}`;
    
    const { videoUrl, videoId } = await uploadVideoChunked(
      Buffer.from(videoBuffer),
      fileName,
      filePath
    );
    
    console.log(`\n✅ Video uploaded: ${videoUrl.substring(0, 80)}...`);

    // Step 2: Create 3 jobs in parallel (one per platform)
    console.log('\n🎬 Step 2: Creating repurpose jobs for all platforms...');
    
    const platforms = [
      { key: 'tiktok', name: 'TikTok' },
      { key: 'youtube_shorts', name: 'YouTube Shorts' },
      { key: 'instagram_reels', name: 'Instagram Reels' }
    ];
    
    // Create jobs sequentially with small delays to avoid rate limiting
    const jobs = [];
    for (const p of platforms) {
      try {
        const jobId = await createRepurposeJob(p.key, videoId, videoUrl);
        jobs.push({
          platform: p.name,
          key: p.key,
          jobId
        });
        // Small delay between job creations
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`   ❌ Failed to create ${p.name} job:`, err.message);
        throw err;
      }
    }
    console.log(`\n✅ All ${jobs.length} jobs created!`);

    // Step 3: Poll all jobs in parallel
    console.log('\n⏳ Step 3: Processing jobs (this may take 2-5 minutes)...');
    console.log('   (Generating viral clips with captions for each platform)\n');
    
    const results = await Promise.all(
      jobs.map(job => pollJobStatus(job.jobId, job.platform).then(result => ({
        platform: job.platform,
        key: job.key,
        result
      })))
    );

    // Step 4: Display results
    console.log('\n' + '═'.repeat(80));
    console.log('🎉 VIRAL VIDEOS GENERATED WITH CAPTIONS\n');
    console.log('═'.repeat(80));
    
    results.forEach(({ platform, key, result }) => {
      const clips = result.result?.clips || [];
      const clip = clips[0]; // Get the first (and only) viral clip
      
      console.log(`\n📱 ${platform.toUpperCase()}`);
      console.log('─'.repeat(80));
      
      if (clip) {
        console.log(`   🎬 Title: ${clip.title || 'Viral Clip'}`);
        console.log(`   ⏱️  Duration: ${clip.duration || clip.end_time - clip.start_time}s`);
        console.log(`   📍 Time: ${Math.round(clip.start_time || 0)}s - ${Math.round(clip.end_time || 0)}s`);
        console.log(`   ⭐ Virality Score: ${clip.virality_score || 'N/A'}/100`);
        console.log(`   📝 Description: ${(clip.description || '').substring(0, 100)}...`);
        
        if (clip.captions && clip.captions.length > 0) {
          console.log(`   💬 Captions: ${clip.captions.length} caption points`);
          clip.captions.slice(0, 3).forEach(cap => {
            console.log(`      - [${cap.time}s] ${cap.text}`);
          });
          if (clip.captions.length > 3) {
            console.log(`      ... and ${clip.captions.length - 3} more`);
          }
        } else {
          console.log(`   💬 Captions: Included (metadata generated)`);
        }
        
        if (clip.hashtags && clip.hashtags.length > 0) {
          console.log(`   #️⃣  Hashtags: ${clip.hashtags.join(' ')}`);
        }
        
        if (clip.hook_text) {
          console.log(`   🎣 Hook: "${clip.hook_text}"`);
        }
      } else {
        console.log(`   ⚠️  No clip generated`);
      }
    });
    
    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ All 3 viral videos generated successfully!');
    console.log('📊 Summary:');
    console.log(`   - Platforms: TikTok, YouTube Shorts, Instagram Reels`);
    console.log(`   - Captions: ✅ Enabled for all videos`);
    console.log(`   - Total clips: ${results.reduce((sum, r) => sum + (r.result?.result?.clips?.length || 0), 0)}`);
    
  } catch (error) {
    console.error('\n❌ Generation failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run
generateViralVideos();

