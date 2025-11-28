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

console.log('🧪 DIRECT STORAGE UPLOAD TEST');
console.log('='.repeat(60));
console.log('Testing if we can upload directly (bypassing Edge Function)');
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

if (parseFloat(sizeMB) > 50) {
  console.log('⚠️  File is >50MB, will test direct upload anyway...');
}

const videoBuffer = readFileSync(videoPath);
const fileName = `test_direct_${Date.now()}.mp4`;
const filePath = `${userId}/${fileName}`;

console.log(`🚀 Attempting direct upload to storage...`);
const start = Date.now();

try {
  const { data, error } = await supabase.storage
    .from('repurpose-videos')
    .upload(filePath, videoBuffer, {
      contentType: 'video/mp4',
      upsert: false
    });

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  
  if (error) {
    console.error(`❌ Failed after ${duration}s:`, error.message);
    if (error.message.includes('size')) {
      console.log('💡 File is too large for direct upload, need Edge Function');
    }
    process.exit(1);
  }

  const { data: urlData } = supabase.storage
    .from('repurpose-videos')
    .getPublicUrl(filePath);

  console.log(`✅ Uploaded in ${duration}s`);
  console.log(`📍 Video ID: ${filePath}`);
  console.log(`🔗 URL: ${urlData.publicUrl.substring(0, 60)}...`);
  console.log('');
  console.log('✅ Direct upload works! We can use this for files <50MB');
} catch (e) {
  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.error(`❌ Exception after ${duration}s:`, e.message);
  process.exit(1);
}
