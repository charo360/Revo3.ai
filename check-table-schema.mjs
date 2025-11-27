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
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.log('⚠️  No service role key, using anon key');
}

const supabase = createClient(
  SUPABASE_URL, 
  SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY
);

console.log('🔍 Checking repurpose_jobs table schema...\n');

// Try to query the table structure
try {
  // Try to insert a test record to see what columns are missing
  const testData = {
    id: 'test-schema-check-' + Date.now(),
    user_id: '00000000-0000-0000-0000-000000000000',
    video_id: 'test',
    video_url: 'test',
    options: {},
    status: 'queued',
    progress: 0
  };
  
  const { data, error } = await supabase
    .from('repurpose_jobs')
    .insert(testData)
    .select();
  
  if (error) {
    console.log('❌ Insert failed:', error.message);
    console.log('   Code:', error.code);
    console.log('   Details:', error.details);
    console.log('   Hint:', error.hint);
    
    if (error.message.includes('options')) {
      console.log('\n💡 SOLUTION: The options column is missing!');
      console.log('   Run this migration:');
      console.log('   supabase db push');
      console.log('   Or manually add the column:');
      console.log('   ALTER TABLE repurpose_jobs ADD COLUMN IF NOT EXISTS options JSONB NOT NULL DEFAULT \'{}\';');
    }
  } else {
    console.log('✅ Table schema is correct!');
    // Clean up test record
    await supabase.from('repurpose_jobs').delete().eq('id', testData.id);
  }
} catch (e) {
  console.error('❌ Error:', e.message);
}
