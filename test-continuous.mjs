#!/usr/bin/env node
/**
 * Continuous Test - Keeps testing until it works
 * Run this and it will keep checking if the database is fixed
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

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔄 Continuous Test Mode');
console.log('   Will keep testing until database is fixed\n');

let attempt = 0;
const maxAttempts = 30;

while (attempt < maxAttempts) {
  attempt++;
  console.log(`\n📋 Attempt ${attempt}/${maxAttempts}: Checking schema...`);
  
  // Test schema
  const testData = {
    id: 'test-' + Date.now(),
    user_id: '00000000-0000-0000-0000-000000000000',
    video_id: 'test',
    video_url: 'test',
    options: {},
    status: 'queued',
    progress: 0
  };
  
  const { error } = await supabase
    .from('repurpose_jobs')
    .insert(testData)
    .select();
  
  if (error) {
    if (error.message.includes('column')) {
      const match = error.message.match(/column ['"]([^'"]+)['"]/);
      if (match) {
        console.log(`   ❌ Missing column: ${match[1]}`);
        console.log(`   💡 Run the SQL fix in Supabase Dashboard`);
      } else {
        console.log(`   ❌ Schema error: ${error.message}`);
      }
    } else {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    if (attempt < maxAttempts) {
      console.log(`   ⏳ Waiting 5 seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      continue;
    }
  } else {
    // Clean up
    await supabase.from('repurpose_jobs').delete().eq('id', testData.id);
    
    console.log('   ✅ Schema is correct!');
    console.log('\n🚀 Running full test...\n');
    
    // Run the full test
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      const { stdout, stderr } = await execAsync('node test-complete-flow.mjs');
      console.log(stdout);
      if (stderr) console.error(stderr);
      process.exit(0);
    } catch (e) {
      console.error('Test failed:', e.message);
      process.exit(1);
    }
  }
}

console.log('\n❌ Max attempts reached. Database still needs fixing.');
console.log('   Please run the SQL fix in Supabase Dashboard.');
process.exit(1);
