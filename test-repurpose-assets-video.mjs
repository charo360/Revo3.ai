/**
 * Test Content Repurpose Feature with Video from Assets Folder
 * 
 * This script tests the complete repurpose flow:
 * 1. Read video from assets folder
 * 2. Upload to Supabase Storage
 * 3. Create repurpose job
 * 4. Poll for completion
 * 5. Display results
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables - try to read from .env.local
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
  console.error('💡 Please set VITE_SUPABASE_ANON_KEY in .env.local or as environment variable');
  console.error('💡 You can find it in your Supabase dashboard: Settings > API');
  console.error('\n📝 Example:');
  console.error('   export VITE_SUPABASE_ANON_KEY="your-key-here"');
  console.error('   node test-repurpose-assets-video.mjs');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : supabase;

// Test user ID (you can change this to a real user ID)
const TEST_USER_ID = process.env.TEST_USER_ID || 'd32c3d32-ce6d-4e55-92c6-9ad3686643b0';

// Video file path - find the first .mp4 file in assets
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

console.log('🧪 Testing Content Repurpose Feature\n');
console.log('📁 Video file:', VIDEO_PATH);
console.log('👤 Test user ID:', TEST_USER_ID);
console.log('🔗 Supabase URL:', supabaseUrl);
console.log('');

async function testRepurpose() {
  try {
    // Step 1: Read video file
    console.log('📖 Step 1: Reading video file...');
    let videoBuffer;
    try {
      videoBuffer = readFileSync(VIDEO_PATH);
      const fileSizeMB = (videoBuffer.length / (1024 * 1024)).toFixed(2);
      console.log(`   ✅ Video loaded: ${fileSizeMB} MB`);
    } catch (error) {
      console.error('   ❌ Failed to read video file:', error.message);
      console.error('   💡 Make sure the video file exists in src/assets/');
      process.exit(1);
    }

    // Step 2: Upload video to Supabase Storage using Edge Function (chunked upload)
    console.log('\n📤 Step 2: Uploading video to Supabase Storage via Edge Function...');
    const fileName = `test_repurpose_${Date.now()}_${TEST_USER_ID}.mp4`;
    const filePath = `${TEST_USER_ID}/${fileName}`;
    
    const fileSizeMB = (videoBuffer.length / (1024 * 1024)).toFixed(2);
    console.log(`   📊 File size: ${fileSizeMB} MB`);
    
    // Use sequential chunk upload for reliability (batch can fail for large payloads)
    // For files > 30MB, use sequential; for smaller, can use batch
    const useSequential = videoBuffer.length > 30 * 1024 * 1024;
    
    let videoUrl, videoId;
    
    if (!useSequential) {
      // Batch upload for smaller files
      console.log('   📦 Using batch upload (all chunks at once)...');
      
      // Chunk the file (5MB chunks) and convert all to base64
      const chunkSize = 5 * 1024 * 1024;
      const totalChunks = Math.ceil(videoBuffer.length / chunkSize);
      const chunks = [];
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, videoBuffer.length);
        const chunk = videoBuffer.slice(start, end);
        chunks.push(Buffer.from(chunk).toString('base64'));
        process.stdout.write(`   ⏳ Preparing chunks ${i + 1}/${totalChunks}...\r`);
      }
      
      console.log(`\n   ⏳ Uploading ${totalChunks} chunks...`);
      
      const { data: uploadData, error: uploadError } = await supabase.functions.invoke('upload-video', {
        body: {
          filePath: filePath,
          userId: TEST_USER_ID,
          chunks: chunks,
          fileName: fileName,
          contentType: 'video/mp4'
        }
      });
      
      if (uploadError) {
        console.error('   ❌ Batch upload failed:', uploadError.message);
        throw uploadError;
      }
      
      if (!uploadData || !uploadData.publicUrl) {
        // Wait and check storage directly
        await new Promise(resolve => setTimeout(resolve, 3000));
        const { data: urlData } = supabase.storage
          .from('repurpose-videos')
          .getPublicUrl(filePath);
        
        videoUrl = urlData?.publicUrl || filePath;
        videoId = filePath;
      } else {
        videoUrl = uploadData.publicUrl;
        videoId = uploadData.videoId || filePath;
      }
    } else {
      // Sequential chunk upload for larger files (more reliable)
      console.log('   📦 Using sequential chunk upload...');
      const chunkSize = 5 * 1024 * 1024; // 5MB chunks
      const totalChunks = Math.ceil(videoBuffer.length / chunkSize);
      
      console.log(`   📊 Uploading ${totalChunks} chunks sequentially...`);
      
      // Upload chunks one by one
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, videoBuffer.length);
        const chunk = videoBuffer.slice(start, end);
        const base64Chunk = Buffer.from(chunk).toString('base64');
        
        const isLastChunk = i === totalChunks - 1;
        const progress = Math.round(((i + 1) / totalChunks) * 90);
        process.stdout.write(`   ⏳ Uploading chunk ${i + 1}/${totalChunks} (${progress}%)...\r`);
        
        let chunkData, chunkError;
        try {
          const result = await supabase.functions.invoke('upload-video', {
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
          chunkData = result.data;
          chunkError = result.error;
          
          // If there's an error, try to get the response body
          if (chunkError && chunkError.context) {
            console.error(`\n   ❌ Chunk ${i + 1} error context:`, JSON.stringify(chunkError.context, null, 2));
          }
        } catch (err) {
          chunkError = err;
          console.error(`\n   ❌ Chunk ${i + 1} exception:`, err.message || err);
        }
        
        if (chunkError) {
          console.error(`\n   ❌ Chunk ${i + 1} failed:`, chunkError.message || chunkError);
          if (chunkError.context) {
            console.error(`   Error context:`, JSON.stringify(chunkError.context, null, 2));
          }
          // For last chunk, wait a bit and continue - file might still be combining
          if (isLastChunk) {
            console.log(`\n   ⚠️  Last chunk had error, but waiting for combination...`);
            await new Promise(resolve => setTimeout(resolve, 10000));
            break;
          }
          throw chunkError;
        }
        
        // If last chunk, get the final URL
        if (isLastChunk) {
          console.log(`\n   📦 Last chunk response:`, JSON.stringify(chunkData, null, 2).substring(0, 200));
          if (chunkData?.publicUrl) {
            videoUrl = chunkData.publicUrl;
            videoId = chunkData.videoId || filePath;
            console.log('\n   ✅ Upload complete with URL from response');
            break;
          } else if (chunkData?.combining || chunkData?.success) {
            console.log('\n   ⏳ File combination in progress...');
            console.log(`   📝 Response message: ${chunkData?.message || 'No message'}`);
            // Will check storage below
            break;
          } else if (chunkData?.error) {
            console.log(`\n   ⚠️  Last chunk had error: ${chunkData.error}`);
            console.log(`   💡 File may still be combining in background`);
            // Continue to check storage
            break;
          }
        }
      }
      
      // If we didn't get URL from last chunk, wait and check storage
      if (!videoUrl) {
        console.log('\n   ⏳ Waiting for file combination (this may take 30-60 seconds)...');
        // Wait longer for combination and verify file exists
        let fileFound = false;
        for (let wait = 0; wait < 20; wait++) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Try to download the file to verify it exists (using service role if available)
          const checkSupabase = supabaseAdmin || supabase;
          const { data: testData, error: testError } = await checkSupabase.storage
            .from('repurpose-videos')
            .download(filePath);
          
          if (!testError && testData) {
            // File exists! Get public URL
            const { data: urlData } = checkSupabase.storage
              .from('repurpose-videos')
              .getPublicUrl(filePath);
            
            if (urlData?.publicUrl) {
              videoUrl = urlData.publicUrl;
              videoId = filePath;
              console.log(`\n   ✅ File verified and found in storage! (after ${(wait + 1) * 3}s)`);
              console.log(`   🔗 Public URL: ${videoUrl.substring(0, 80)}...`);
              fileFound = true;
              break;
            }
          }
          
          // Also check by listing
          const { data: listData } = await checkSupabase.storage
            .from('repurpose-videos')
            .list(TEST_USER_ID);
          
          if (listData) {
            const found = listData.find(f => f.name === fileName);
            if (found) {
              const { data: urlData } = checkSupabase.storage
                .from('repurpose-videos')
                .getPublicUrl(filePath);
              if (urlData?.publicUrl) {
                videoUrl = urlData.publicUrl;
                videoId = filePath;
                console.log(`\n   ✅ File found in listing! (after ${(wait + 1) * 3}s)`);
                fileFound = true;
                break;
              }
            }
          }
          
          process.stdout.write(`   ⏳ Waiting for file combination... (${(wait + 1) * 3}s)\r`);
        }
        
        if (!fileFound) {
          // Try to get public URL anyway (might work even if file is still combining)
          const { data: urlData } = supabase.storage
            .from('repurpose-videos')
            .getPublicUrl(filePath);
          
          if (urlData?.publicUrl) {
            videoUrl = urlData.publicUrl;
            videoId = filePath;
            console.log('\n   ⚠️  File not verified, but using public URL');
            console.log('   💡 The file may still be combining. Repurpose job will retry.');
          } else {
            videoUrl = filePath;
            videoId = filePath;
            console.log('\n   ⚠️  File not found after 60s wait, using file path');
            console.log('   💡 The file may still be combining. The repurpose job will handle this.');
          }
        }
      }
    }
    
    console.log(`\n   ✅ Video upload process completed`);
    console.log(`   📁 File path: ${filePath}`);
    console.log(`   🔗 Video URL: ${videoUrl.substring(0, 100)}...`);

    // Step 3: Create repurpose job
    console.log('\n🎬 Step 3: Creating repurpose job...');
    const options = {
      target_clip_count: 5,
      min_duration: 15,
      max_duration: 60,
      virality_threshold: 70,
      platforms: ['youtube_shorts', 'tiktok'],
      include_captions: true,
      include_transitions: true,
      overlap_prevention: true
    };

    console.log('   📋 Options:', JSON.stringify(options, null, 2));

    const { data: jobData, error: jobError } = await supabase.functions.invoke('repurpose-video', {
      body: {
        action: 'create_job',
        userId: TEST_USER_ID,
        videoId: videoId,
        videoUrl: videoUrl,
        options: options
      }
    });
    
    // Clean up global variables
    delete global.videoUrl;
    delete global.videoId;

    if (jobError) {
      console.error('   ❌ Failed to create job:', jobError.message);
      throw jobError;
    }

    if (!jobData || !jobData.jobId) {
      console.error('   ❌ Invalid response:', jobData);
      throw new Error('Missing jobId in response');
    }

    const jobId = jobData.jobId;
    console.log(`   ✅ Job created: ${jobId}`);

    // Step 4: Poll for job status
    console.log('\n⏳ Step 4: Polling job status...');
    let attempts = 0;
    const maxAttempts = 120; // 4 minutes max (2s * 120)
    let lastStatus = 'queued';

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      attempts++;

      // Use Edge Function to get status (bypasses RLS)
      let job, statusError;
      try {
        const { data: statusData, error: statusErr } = await supabase.functions.invoke('repurpose-video', {
          body: {
            action: 'get_status',
            jobId: jobId
          }
        });
        
        if (statusErr) {
          statusError = statusErr;
        } else {
          job = statusData;
        }
      } catch (e) {
        statusError = e;
      }

      if (statusError) {
        console.error('   ❌ Failed to get status:', statusError.message);
        // Wait a bit and retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }

      if (!job) {
        console.log('   ⏳ Job not found yet, waiting...');
        continue;
      }
      const progress = job.progress || 0;
      const status = job.status;

      if (status !== lastStatus) {
        console.log(`   📊 Status: ${status.toUpperCase()} (${progress}%)`);
        lastStatus = status;
      } else if (attempts % 10 === 0) {
        // Print progress every 20 seconds
        process.stdout.write(`   ⏳ Progress: ${progress}%...\r`);
      }

      if (status === 'completed') {
        console.log(`\n   ✅ Job completed! (${attempts * 2}s)`);
        break;
      }

      if (status === 'failed') {
        console.error(`\n   ❌ Job failed: ${job.error_message || 'Unknown error'}`);
        throw new Error(job.error_message || 'Job failed');
      }
    }

    if (attempts >= maxAttempts) {
      console.error('\n   ⚠️  Timeout waiting for job completion');
      throw new Error('Job timeout');
    }

    // Step 5: Get final results
    console.log('\n📊 Step 5: Retrieving results...');
    const { data: finalJob, error: finalError } = await supabase.functions.invoke('repurpose-video', {
      body: {
        action: 'get_status',
        jobId: jobId
      }
    });

    if (finalError) {
      throw finalError;
    }

    const result = finalJob.result;
    if (!result || !result.clips) {
      console.error('   ❌ No clips in result:', result);
      throw new Error('No clips generated');
    }

    const clips = result.clips;
    console.log(`   ✅ Generated ${clips.length} clips\n`);

    // Step 6: Display results
    console.log('🎉 REPURPOSE RESULTS\n');
    console.log('═'.repeat(80));
    
    clips.forEach((clip, index) => {
      console.log(`\n📹 Clip ${index + 1}:`);
      console.log(`   Title: ${clip.title || 'Untitled'}`);
      console.log(`   Duration: ${clip.duration}s`);
      console.log(`   Time: ${Math.round(clip.start_time)}s - ${Math.round(clip.end_time)}s`);
      console.log(`   Virality Score: ${clip.virality_score}/100`);
      console.log(`   Type: ${clip.segment_type || 'content'}`);
      if (clip.description) {
        console.log(`   Description: ${clip.description.substring(0, 100)}...`);
      }
      if (clip.hashtags && clip.hashtags.length > 0) {
        console.log(`   Hashtags: ${clip.hashtags.join(' ')}`);
      }
    });

    console.log('\n' + '═'.repeat(80));
    console.log(`\n✅ Test completed successfully!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Total clips: ${clips.length}`);
    console.log(`   - Average score: ${result.statistics?.average_virality_score?.toFixed(1) || 'N/A'}`);
    console.log(`   - Processing time: ${result.statistics?.processing_time_seconds || 'N/A'}s`);
    console.log(`   - Analysis method: ${result.analysis_method || 'signal_based'}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testRepurpose();

