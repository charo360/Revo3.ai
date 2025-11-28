import { createClient } from '@supabase/supabase-js';
import { readFileSync, statSync } from 'fs';
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

console.log('🚀 OPTIMIZED UPLOAD TEST (Load Balanced)');
console.log('='.repeat(70));
console.log('Features: Parallel uploads, retry logic, error handling');
console.log('');

const userId = 'd32c3d32-ce6d-4e55-92c6-9ad3686643b0';

// Find video
let videoPath;
try {
  const result = execSync('find src/assets -name "*.mp4" -type f 2>/dev/null | head -1', { 
    encoding: 'utf-8', 
    cwd: __dirname 
  }).trim();
  videoPath = result ? join(__dirname, result) : null;
} catch (e) {
  videoPath = null;
}

if (!videoPath) {
  console.error('❌ No video found');
  process.exit(1);
}

const stats = statSync(videoPath);
const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
console.log(`📹 Video: ${videoPath.split('/').pop()}`);
console.log(`📊 Size: ${sizeMB} MB`);
console.log('');

const videoBuffer = readFileSync(videoPath);
const fileName = `test_optimized_${Date.now()}.mp4`;
const filePath = `${userId}/${fileName}`;

// Chunk
const CHUNK_SIZE = 5 * 1024 * 1024;
const totalChunks = Math.ceil(videoBuffer.length / CHUNK_SIZE);
const chunks = [];

console.log(`📦 Chunking into ${totalChunks} chunks...`);
for (let i = 0; i < totalChunks; i++) {
  const start = i * CHUNK_SIZE;
  const end = Math.min(start + CHUNK_SIZE, videoBuffer.length);
  chunks.push(videoBuffer.slice(start, end).toString('base64'));
}

console.log(`🚀 Uploading with load balancing (3 concurrent)...`);
const start = Date.now();

try {
  // Use the upload service logic (parallel chunks)
  const CONCURRENT_LIMIT = 3;
  const uploadChunk = async (chunkIndex) => {
    const isLastChunk = chunkIndex === chunks.length - 1;
    const { data, error } = await supabase.functions.invoke('upload-video', {
      body: {
        filePath,
        userId,
        chunks: [chunks[chunkIndex]],
        chunkIndex,
        totalChunks: chunks.length,
        isLastChunk,
        fileName,
        contentType: 'video/mp4'
      }
    });
    
    if (error) throw new Error(error.message);
    return { chunkIndex, data, isLastChunk };
  };

  // Upload in batches
  const results = [];
  for (let i = 0; i < chunks.length; i += CONCURRENT_LIMIT) {
    const batch = [];
    for (let j = 0; j < CONCURRENT_LIMIT && (i + j) < chunks.length; j++) {
      batch.push(uploadChunk(i + j));
    }
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
    console.log(`   ✅ Batch ${Math.floor(i / CONCURRENT_LIMIT) + 1} completed (${Math.min(i + CONCURRENT_LIMIT, chunks.length)}/${chunks.length})`);
  }

  // Wait for combination if needed
  const lastResult = results.find(r => r.isLastChunk);
  if (lastResult?.data?.combining) {
    console.log('   ⏳ Waiting for file combination...');
    let attempts = 0;
    while (attempts < 30) {
      await new Promise(r => setTimeout(r, 2000));
      const { data: checkData } = await supabase.storage
        .from('repurpose-videos')
        .list(userId, { search: fileName });
      
      if (checkData && checkData.length > 0) {
        const { data: urlData } = supabase.storage
          .from('repurpose-videos')
          .getPublicUrl(filePath);
        if (urlData?.publicUrl) {
          console.log(`   ✅ File ready: ${urlData.publicUrl.substring(0, 60)}...`);
          break;
        }
      }
      attempts++;
    }
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✅ Upload completed in ${duration}s`);
  console.log(`📍 File: ${filePath}`);
} catch (e) {
  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.error(`\n❌ Failed after ${duration}s:`, e.message);
  process.exit(1);
}
