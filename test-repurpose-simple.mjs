/**
 * Simple Content Repurpose Test (ESM compatible)
 * Run with: node test-repurpose-simple.mjs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load from .env.local first, then .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const TEST_USER_ID = process.env.TEST_USER_ID || 'd32c3d32-ce6d-4e55-92c6-9ad3686643b0';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials!');
    process.exit(1);
}

// Use service role key for testing (bypasses RLS) if available, otherwise use anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

if (supabaseServiceKey) {
    console.log('   Using service role key (bypasses RLS)\n');
} else {
    console.log('   Using anon key (will need authentication)\n');
}

// Find video file dynamically
const assetsDir = path.join(__dirname, 'src/assets');
let VIDEO_PATH = null;
try {
    const files = fs.readdirSync(assetsDir);
    const videoFile = files.find(f => f.endsWith('.mp4'));
    if (videoFile) {
        VIDEO_PATH = path.join(assetsDir, videoFile);
    }
} catch (e) {
    // Fallback to expected name
    VIDEO_PATH = path.join(assetsDir, 'Why You Stay Broke While They Get Rich – Machiavelli\'s Principles for Making Money - PsychUnboxed (720p, h264, youtube).mp4');
}

console.log('🧪 Content Repurpose Test\n');

// Test 1: Video file
console.log('📹 Test 1: Video file...');
try {
    const stats = fs.statSync(VIDEO_PATH);
    console.log(`✅ Found: ${(stats.size / (1024 * 1024)).toFixed(2)} MB\n`);
} catch (error) {
    console.error(`❌ Not found: ${error.message}\n`);
    process.exit(1);
}

// Test 2: Supabase connection
console.log('🔌 Test 2: Supabase connection...');
try {
    const { error } = await supabase.from('user_credits').select('balance').eq('user_id', TEST_USER_ID).limit(1);
    if (error && error.code !== 'PGRST116') throw error;
    console.log('✅ Connected\n');
} catch (error) {
    console.error(`❌ Failed: ${error.message}\n`);
    process.exit(1);
}

// Test 3: Table exists
console.log('📊 Test 3: repurpose_jobs table...');
try {
    const { error } = await supabase.from('repurpose_jobs').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Table exists\n');
} catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    console.error('   Run: supabase db push\n');
    process.exit(1);
}

// Test 4: Storage bucket
console.log('📦 Test 4: Storage bucket...');
try {
    const { error } = await supabase.storage.from('repurpose-videos').list('', { limit: 1 });
    if (error) throw error;
    console.log('✅ Bucket exists\n');
} catch (error) {
    console.error(`❌ Failed: ${error.message}\n`);
    process.exit(1);
}

// Test 5: Upload video
console.log('⬆️  Test 5: Uploading video...');
try {
    const videoBuffer = fs.readFileSync(VIDEO_PATH);
    const fileName = `test_${Date.now()}.mp4`;
    const filePath = `${TEST_USER_ID}/${fileName}`;

    console.log(`   Uploading ${(videoBuffer.length / (1024 * 1024)).toFixed(2)} MB...`);
    console.log(`   File path: ${filePath}`);

    // Try with authenticated user context (RLS requires user_id to match)
    // For testing, we'll use service role or check if we can bypass RLS
    const { data, error } = await supabase.storage
        .from('repurpose-videos')
        .upload(filePath, videoBuffer, { 
            contentType: 'video/mp4',
            upsert: false
        });

    if (error) {
        console.error(`   ❌ Upload error: ${error.message}`);
        console.error(`   Error code: ${error.statusCode || 'N/A'}`);
        
        // Check if it's an RLS issue
        if (error.message.includes('row-level security') || error.message.includes('policy')) {
            console.error('\n   ⚠️  RLS Policy Issue!');
            console.error('   Solution: Set SUPABASE_SERVICE_ROLE_KEY in .env.local');
            console.error('   Or authenticate as user first.\n');
        }
        throw error;
    }

    const { data: urlData } = supabase.storage.from('repurpose-videos').getPublicUrl(filePath);
    console.log(`✅ Uploaded: ${filePath}`);
    console.log(`   URL: ${urlData.publicUrl}\n`);

    // Test 6: Create job
    console.log('⚡ Test 6: Creating repurpose job...');
    const { data: jobData, error: jobError } = await supabase.functions.invoke('repurpose-video', {
        body: {
            action: 'create_job',
            userId: TEST_USER_ID,
            videoId: filePath,
            videoUrl: urlData.publicUrl,
            options: { target_clip_count: 10, min_duration: 15, max_duration: 60 }
        }
    });

    if (jobError) throw jobError;
    if (!jobData || !jobData.jobId) throw new Error('No jobId returned');

    console.log(`✅ Job created: ${jobData.jobId}\n`);

    // Test 7: Poll status
    console.log('🔄 Test 7: Polling job status (30 seconds max)...');
    for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 2000));
        
        const { data: statusData, error: statusError } = await supabase
            .from('repurpose_jobs')
            .select('*')
            .eq('id', jobData.jobId)
            .single();

        if (statusError) {
            console.error(`❌ Status error: ${statusError.message}`);
            break;
        }

        console.log(`   [${i + 1}/15] ${statusData.status} - ${statusData.progress}%`);

        if (statusData.status === 'completed') {
            console.log('✅ Job completed!');
            console.log('   Result:', JSON.stringify(statusData.result, null, 2));
            process.exit(0);
        }

        if (statusData.status === 'failed') {
            console.error(`❌ Job failed: ${statusData.error_message}`);
            process.exit(1);
        }
    }

    console.log('⚠️  Polling timeout - job still processing\n');
} catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (error.context) console.error('   Context:', error.context);
    process.exit(1);
}

