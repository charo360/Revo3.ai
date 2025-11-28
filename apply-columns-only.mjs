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

// Read the migration file
const migrationFile = join(__dirname, 'supabase/migrations/20251127202841_fix_repurpose_jobs_columns.sql');
const sql = readFileSync(migrationFile, 'utf-8');

console.log('📋 SQL to execute:');
console.log('='.repeat(60));
console.log(sql);
console.log('='.repeat(60));
console.log('\n💡 Please copy the SQL above and run it in:');
console.log('   Supabase Dashboard → SQL Editor');
console.log('\n   Or use psql:');
console.log(`   psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -c "${sql.replace(/\n/g, ' ')}"`);
