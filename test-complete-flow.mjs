#!/usr/bin/env node
/**
 * Complete End-to-End Test of Viral Clip Generation
 * 
 * This test will work once the database columns are added.
 * Run the SQL from supabase/migrations/20251127202841_fix_repurpose_jobs_columns.sql
 * in Supabase Dashboard first.
 */

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

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🧪 COMPLETE VIRAL CLIP GENERATION TEST');
console.log('='.repeat(60));
console.log('');

// Step 1: Verify schema
console.log('📋 Step 1: Verifying database schema...');
const testSchema = {
  id: 'schema-test-' + Date.now(),
  user_id: '00000000-0000-0000-0000-000000000000',
  video_id: 'test',
  video_url: 'test',
  options: {},
  status: 'queued',
  progress: 0
};

const { error: schemaError } = await supabase
  .from('repurpose_jobs')
  .insert(testSchema)
  .select();

if (schemaError) {
  console.error('❌ Schema check failed:', schemaError.message);
  if (schemaError.message.includes('column')) {
    console.error('\n💡 SOLUTION:');
    console.error('   Run this SQL in Supabase Dashboard → SQL Editor:');
    const sqlFile = join(__dirname, 'supabase/migrations/20251127202841_fix_repurpose_jobs_columns.sql');
    try {
      const sql = readFileSync(sqlFile, 'utf-8');
      console.error('\n' + sql);
    } catch (e) {
      console.error('   (Could not read SQL file)');
    }
  }
  process.exit(1);
}

// Clean up test record
await supabase.from('repurpose_jobs').delete().eq('id', testSchema.id);
console.log('✅ Schema is correct\n');

// Step 2: Get or create test user
console.log('👤 Step 2: Setting up user...');
const { data: { user } } = await supabase.auth.getUser();
let userId = 'test-user-' + Date.now();

if (user) {
  userId = user.id;
  console.log('✅ Using authenticated user:', userId.substring(0, 20) + '...\n');
} else {
  console.log('⚠️  Not authenticated, using test user ID\n');
}

// Step 3: Create repurpose job
console.log('🚀 Step 3: Creating repurpose job...');
const youtubeUrl = 'https://www.youtube.com/watch?v=C53N3SdD4Cs';
const videoId = `youtube_${Date.now()}_${userId}`;

const { data: jobData, error: jobError } = await supabase.functions.invoke('repurpose-video', {
  body: {
    action: 'create_job',
    userId: userId,
    videoId: videoId,
    videoUrl: youtubeUrl,
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
  if (jobError.context) {
    console.error('   Context:', JSON.stringify(jobError.context, null, 2));
  }
  process.exit(1);
}

if (!jobData || !jobData.jobId) {
  console.error('❌ Invalid response:', jobData);
  process.exit(1);
}

const jobId = jobData.jobId;
console.log('✅ Job created:', jobId);
console.log('   Status:', jobData.status);
console.log('');

// Step 4: Poll for completion
console.log('⏳ Step 4: Polling job status...');
console.log('   (This may take 30-60 seconds for Gemini AI processing)');
console.log('');

let attempts = 0;
const maxAttempts = 60; // 2 minutes max
let lastProgress = -1;

while (attempts < maxAttempts) {
  await new Promise(resolve => setTimeout(resolve, 2000));
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
  
  if (progress !== lastProgress) {
    console.log(`   ${progress}% - ${status}`);
    lastProgress = progress;
  }
  
  if (status === 'completed') {
    console.log('\n✅ Job completed successfully!\n');
    
    if (job.result && job.result.clips) {
      console.log('📊 RESULTS:');
      console.log('='.repeat(60));
      console.log(`   Total Clips Generated: ${job.result.clips.length}`);
      console.log(`   Average Virality Score: ${job.result.statistics?.average_virality_score?.toFixed(1) || 'N/A'}/100`);
      console.log(`   Processing Time: ${job.result.statistics?.processing_time_seconds?.toFixed(1) || 'N/A'}s`);
      console.log('');
      
      job.result.clips.forEach((clip, i) => {
        console.log(`   Clip ${i + 1}:`);
        console.log(`     Title: ${clip.title || 'Untitled'}`);
        console.log(`     Duration: ${clip.duration}s`);
        console.log(`     Virality Score: ${clip.virality_score}/100`);
        console.log(`     Time Range: ${clip.start_time}s - ${clip.end_time}s`);
        if (clip.hooks && clip.hooks.length > 0) {
          console.log(`     Hooks: ${clip.hooks.join(', ')}`);
        }
        if (clip.hashtags && clip.hashtags.length > 0) {
          console.log(`     Hashtags: ${clip.hashtags.join(' ')}`);
        }
        console.log('');
      });
    }
    
    console.log('='.repeat(60));
    console.log('✅ TEST PASSED! Viral clip generation is working!');
    process.exit(0);
  }
  
  if (status === 'failed') {
    console.error('\n❌ Job failed:', job.error_message);
    process.exit(1);
  }
}

console.error('\n❌ Timeout: Job did not complete within 2 minutes');
process.exit(1);

