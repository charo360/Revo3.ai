/**
 * Content Repurpose Test Script
 * 
 * This script tests the content repurpose flow step by step
 * Run with: node test-repurpose.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials!');
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test user ID (replace with actual user ID)
const TEST_USER_ID = process.env.TEST_USER_ID || 'd32c3d32-ce6d-4e55-92c6-9ad3686643b0';

// Video file path
const VIDEO_PATH = join(__dirname, 'src/assets/Why You Stay Broke While They Get Rich – Machiavelli\'s Principles for Making Money - PsychUnboxed (720p, h264, youtube).mp4');

console.log('🧪 Content Repurpose Test Script');
console.log('================================\n');

// Test 1: Check if video file exists
async function test1_checkVideoFile() {
    console.log('📹 Test 1: Checking video file...');
    try {
        const fs = await import('fs');
        const stats = fs.statSync(VIDEO_PATH);
        console.log(`✅ Video file found: ${VIDEO_PATH}`);
        console.log(`   Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
        return true;
    } catch (error) {
        console.error(`❌ Video file not found: ${VIDEO_PATH}`);
        console.error(`   Error: ${error.message}`);
        return false;
    }
}

// Test 2: Check Supabase connection
async function test2_checkSupabase() {
    console.log('\n🔌 Test 2: Checking Supabase connection...');
    try {
        const { data, error } = await supabase.from('user_credits').select('balance').eq('user_id', TEST_USER_ID).single();
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        console.log('✅ Supabase connection successful');
        if (data) {
            console.log(`   User credits: ${data.balance}`);
        }
        return true;
    } catch (error) {
        console.error(`❌ Supabase connection failed: ${error.message}`);
        return false;
    }
}

// Test 3: Check if repurpose_jobs table exists
async function test3_checkTable() {
    console.log('\n📊 Test 3: Checking repurpose_jobs table...');
    try {
        const { data, error } = await supabase.from('repurpose_jobs').select('id').limit(1);
        if (error) {
            throw error;
        }
        console.log('✅ repurpose_jobs table exists');
        return true;
    } catch (error) {
        console.error(`❌ repurpose_jobs table error: ${error.message}`);
        console.error('   Run: supabase db push');
        return false;
    }
}

// Test 4: Check storage bucket
async function test4_checkStorage() {
    console.log('\n📦 Test 4: Checking storage bucket...');
    try {
        const { data, error } = await supabase.storage.from('repurpose-videos').list('', { limit: 1 });
        if (error) {
            throw error;
        }
        console.log('✅ repurpose-videos bucket exists');
        return true;
    } catch (error) {
        console.error(`❌ Storage bucket error: ${error.message}`);
        console.error('   Check if bucket exists in Supabase dashboard');
        return false;
    }
}

// Test 5: Test video upload
async function test5_uploadVideo() {
    console.log('\n⬆️  Test 5: Testing video upload...');
    try {
        const fs = await import('fs');
        const videoBuffer = fs.readFileSync(VIDEO_PATH);
        const fileName = `test_video_${Date.now()}_${TEST_USER_ID}.mp4`;
        const filePath = `${TEST_USER_ID}/${fileName}`;

        console.log(`   Uploading: ${filePath}`);
        console.log(`   Size: ${(videoBuffer.length / (1024 * 1024)).toFixed(2)} MB`);

        const { data, error } = await supabase.storage
            .from('repurpose-videos')
            .upload(filePath, videoBuffer, {
                contentType: 'video/mp4',
                upsert: false
            });

        if (error) {
            throw error;
        }

        console.log('✅ Video uploaded successfully');
        console.log(`   Video ID: ${filePath}`);

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('repurpose-videos')
            .getPublicUrl(filePath);

        console.log(`   Public URL: ${urlData.publicUrl}`);

        return { videoId: filePath, publicUrl: urlData.publicUrl };
    } catch (error) {
        console.error(`❌ Upload failed: ${error.message}`);
        return null;
    }
}

// Test 6: Test Edge Function
async function test6_testEdgeFunction() {
    console.log('\n⚡ Test 6: Testing Edge Function...');
    try {
        const testVideoId = `test_${Date.now()}`;
        const testVideoUrl = 'https://example.com/test-video.mp4';

        console.log('   Calling Edge Function: repurpose-video');
        console.log(`   Action: create_job`);
        console.log(`   User ID: ${TEST_USER_ID}`);
        console.log(`   Video ID: ${testVideoId}`);

        const { data, error } = await supabase.functions.invoke('repurpose-video', {
            body: {
                action: 'create_job',
                userId: TEST_USER_ID,
                videoId: testVideoId,
                videoUrl: testVideoUrl,
                options: {
                    target_clip_count: 10,
                    min_duration: 15,
                    max_duration: 60
                }
            }
        });

        if (error) {
            throw error;
        }

        console.log('✅ Edge Function responded successfully');
        console.log(`   Response:`, JSON.stringify(data, null, 2));

        if (data && data.jobId) {
            console.log(`   Job ID: ${data.jobId}`);
            return data.jobId;
        } else {
            console.warn('⚠️  No jobId in response');
            return null;
        }
    } catch (error) {
        console.error(`❌ Edge Function error: ${error.message}`);
        if (error.context) {
            console.error(`   Context:`, error.context);
        }
        return null;
    }
}

// Test 7: Test full flow
async function test7_fullFlow() {
    console.log('\n🚀 Test 7: Testing full flow...');
    
    try {
        // Step 1: Upload video
        console.log('\n   Step 1: Uploading video...');
        const uploadResult = await test5_uploadVideo();
        if (!uploadResult) {
            throw new Error('Upload failed');
        }

        // Step 2: Create job
        console.log('\n   Step 2: Creating repurpose job...');
        const { data, error } = await supabase.functions.invoke('repurpose-video', {
            body: {
                action: 'create_job',
                userId: TEST_USER_ID,
                videoId: uploadResult.videoId,
                videoUrl: uploadResult.publicUrl,
                options: {
                    target_clip_count: 10,
                    min_duration: 15,
                    max_duration: 60,
                    platforms: ['youtube_shorts', 'tiktok'],
                    virality_threshold: 70
                }
            }
        });

        if (error) {
            throw error;
        }

        if (!data || !data.jobId) {
            throw new Error('No jobId returned');
        }

        const jobId = data.jobId;
        console.log(`   ✅ Job created: ${jobId}`);

        // Step 3: Poll job status
        console.log('\n   Step 3: Polling job status...');
        let attempts = 0;
        const maxAttempts = 30; // 1 minute max

        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

            const { data: jobData, error: jobError } = await supabase
                .from('repurpose_jobs')
                .select('*')
                .eq('id', jobId)
                .single();

            if (jobError) {
                console.error(`   ❌ Error fetching job: ${jobError.message}`);
                break;
            }

            console.log(`   [${attempts + 1}/${maxAttempts}] Status: ${jobData.status}, Progress: ${jobData.progress}%`);

            if (jobData.status === 'completed') {
                console.log('   ✅ Job completed!');
                console.log(`   Result:`, JSON.stringify(jobData.result, null, 2));
                return true;
            }

            if (jobData.status === 'failed') {
                console.error(`   ❌ Job failed: ${jobData.error_message}`);
                return false;
            }

            attempts++;
        }

        console.warn('   ⚠️  Polling timeout - job may still be processing');
        return false;
    } catch (error) {
        console.error(`❌ Full flow test failed: ${error.message}`);
        return false;
    }
}

// Run all tests
async function runTests() {
    const results = {
        videoFile: false,
        supabase: false,
        table: false,
        storage: false,
        upload: false,
        edgeFunction: false,
        fullFlow: false
    };

    // Run basic tests
    results.videoFile = await test1_checkVideoFile();
    results.supabase = await test2_checkSupabase();
    results.table = await test3_checkTable();
    results.storage = await test4_checkStorage();

    if (!results.videoFile || !results.supabase || !results.table || !results.storage) {
        console.log('\n❌ Basic tests failed. Please fix these issues first.');
        return;
    }

    // Run functional tests
    results.upload = await test5_uploadVideo() !== null;
    results.edgeFunction = await test6_testEdgeFunction() !== null;

    if (results.upload && results.edgeFunction) {
        results.fullFlow = await test7_fullFlow();
    }

    // Summary
    console.log('\n📊 Test Summary');
    console.log('================');
    console.log(`Video File:     ${results.videoFile ? '✅' : '❌'}`);
    console.log(`Supabase:       ${results.supabase ? '✅' : '❌'}`);
    console.log(`Table:          ${results.table ? '✅' : '❌'}`);
    console.log(`Storage:        ${results.storage ? '✅' : '❌'}`);
    console.log(`Upload:         ${results.upload ? '✅' : '❌'}`);
    console.log(`Edge Function:  ${results.edgeFunction ? '✅' : '❌'}`);
    console.log(`Full Flow:      ${results.fullFlow ? '✅' : '❌'}`);

    const allPassed = Object.values(results).every(r => r);
    if (allPassed) {
        console.log('\n🎉 All tests passed!');
    } else {
        console.log('\n⚠️  Some tests failed. Check the errors above.');
    }
}

// Run tests
runTests().catch(console.error);

