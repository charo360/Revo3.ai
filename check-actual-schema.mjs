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
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('🔍 Checking actual table structure...\n');

// Query to get table structure
const { data, error } = await supabase.rpc('exec_sql', {
  query: `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'repurpose_jobs'
    ORDER BY ordinal_position;
  `
}).catch(async () => {
  // Try direct query
  const { data: rows } = await supabase
    .from('repurpose_jobs')
    .select('*')
    .limit(0);
  
  return { data: null, error: null };
});

// Try to get one row to see structure
const { data: sample, error: sampleError } = await supabase
  .from('repurpose_jobs')
  .select('*')
  .limit(1);

if (sampleError) {
  console.log('❌ Error querying table:', sampleError.message);
  console.log('   Code:', sampleError.code);
  console.log('   Details:', sampleError.details);
} else {
  console.log('✅ Table exists');
  if (sample && sample.length > 0) {
    console.log('   Sample row keys:', Object.keys(sample[0]));
  } else {
    console.log('   Table is empty - trying to infer structure from insert error...');
  }
}

// Try minimal insert to see what's missing
console.log('\n🧪 Testing minimal insert...');
const testInsert = {
  id: 'test-' + Date.now(),
  user_id: '00000000-0000-0000-0000-000000000000',
  status: 'queued',
  progress: 0
};

const { error: insertError } = await supabase
  .from('repurpose_jobs')
  .insert(testInsert);

if (insertError) {
  console.log('   Error:', insertError.message);
  if (insertError.message.includes('column')) {
    const match = insertError.message.match(/column ['"]([^'"]+)['"]/);
    if (match) {
      console.log(`   Missing column: ${match[1]}`);
    }
  }
}
