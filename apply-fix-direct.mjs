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
  console.error('❌ Need SUPABASE_SERVICE_ROLE_KEY to execute SQL');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('🔧 Applying database fixes...\n');

const sql = `
-- Add missing columns
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repurpose_jobs' AND column_name = 'video_id'
    ) THEN
        ALTER TABLE repurpose_jobs ADD COLUMN video_id TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repurpose_jobs' AND column_name = 'video_url'
    ) THEN
        ALTER TABLE repurpose_jobs ADD COLUMN video_url TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'repurpose_jobs' AND column_name = 'options'
    ) THEN
        ALTER TABLE repurpose_jobs ADD COLUMN options JSONB NOT NULL DEFAULT '{}';
    END IF;
END $$;
`;

try {
  // Use REST API to execute SQL
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });
  
  if (!response.ok) {
    const text = await response.text();
    console.log('Response:', text);
  } else {
    console.log('✅ SQL executed via REST API');
  }
} catch (e) {
  console.log('⚠️  REST API method failed, trying alternative...');
  console.log('   Error:', e.message);
  console.log('\n💡 Please run this SQL in Supabase Dashboard SQL Editor:');
  console.log(sql);
}
